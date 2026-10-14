package com.dylask.modules.auth.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.auth.dto.*;
import com.dylask.modules.auth.entity.EmailVerification;
import com.dylask.modules.auth.entity.RefreshToken;
import com.dylask.modules.auth.repository.EmailVerificationRepository;
import com.dylask.modules.auth.repository.RefreshTokenRepository;
import com.dylask.modules.auth.service.AuthService;
import com.dylask.modules.auth.service.EmailService;
import com.dylask.modules.auth.service.TokenService;
import com.dylask.modules.user.dto.UserResponse;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.mapper.UserMapper;
import com.dylask.modules.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Hiện thực hóa các nghiệp vụ xác thực người dùng, quản lý vòng đời JWT Token,
 * xoay vòng Refresh Token (Token Rotation) và quy trình xác thực email 2 bước (OTP).
 */
@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

    // Ràng buộc thời gian & số lần thử theo quy chuẩn bảo mật
    private static final long REFRESH_TOKEN_VALIDITY_DAYS = 7;
    private static final long OTP_VALIDITY_MINUTES = 10;
    private static final long RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            EmailVerificationRepository emailVerificationRepository,
            TokenService tokenService,
            PasswordEncoder passwordEncoder,
            UserMapper userMapper,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.emailService = emailService;
    }

    /**
     * Khởi tạo tài khoản người dùng mới và sinh mã xác thực OTP gửi qua email.
     */
    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        // 1. Chuẩn hóa email đầu vào và kiểm tra tài khoản đã tồn tại
        String email = request.email().trim().toLowerCase();

        User user;
        var existingUserOpt = userRepository.findByEmail(email);
        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (Boolean.TRUE.equals(existing.getIsVerified())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            // Ca đặc biệt: Tài khoản đã đăng ký nhưng chưa xác thực OTP -> Cho phép cập nhật lại thông tin
            existing.setFullName(request.fullName().trim());
            existing.setPasswordHash(passwordEncoder.encode(request.password()));
            user = userRepository.save(existing);
        } else {
            // 2. Tạo bản ghi người dùng mới ở trạng thái chưa kích hoạt (is_verified = false)
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(request.password()))
                    .fullName(request.fullName().trim())
                    .defaultMode("standard")
                    .isVerified(false)
                    .isAiEnabled(false)
                    .aiTrialCount(0)
                    .aiTrialLimit(10)
                    .build();
            user = userRepository.save(user);
        }

        // 3. Sinh mã OTP 6 chữ số ngẫu nhiên bằng bộ sinh số an toàn mật mã học
        String otp = generateOtpCode();

        // 4. Băm mã OTP bằng SHA-256 một chiều trước khi lưu vào CSDL để bảo vệ chống lộ mã
        String otpHash = tokenService.hashToken(otp);

        emailVerificationRepository.deleteAllByUserId(user.getId());
        EmailVerification verification = new EmailVerification(
                user,
                otpHash,
                Instant.now().plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES)
        );
        emailVerificationRepository.save(verification);

        // 5. Gửi email chứa mã xác thực OTP qua SMTP (Tự động in log console nếu chưa cấu hình SMTP)
        emailService.sendOtpEmail(user.getEmail(), otp, (int) OTP_VALIDITY_MINUTES);

        return new RegisterResponse(
                user.getEmail(),
                user.getFullName(),
                true,
                "Mã xác thực 6 chữ số đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư."
        );
    }

    /**
     * Xác thực mã OTP 6 chữ số và kích hoạt tài khoản chính thức.
     */
    @Override
    @Transactional
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        // 1. Tìm kiếm tài khoản người dùng theo email
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy thông tin tài khoản"));

        // Nếu tài khoản đã được kích hoạt trước đó, cấp token vào thẳng hệ thống
        if (Boolean.TRUE.equals(user.getIsVerified())) {
            return createAuthResponse(user);
        }

        // 2. Kiểm tra tính tồn tại của mã xác thực
        EmailVerification verification = emailVerificationRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_EXPIRED, "Không tìm thấy mã xác thực. Vui lòng yêu cầu gửi lại."));

        // 3. Kiểm tra thời hạn hiệu lực của mã OTP (tối đa 10 phút)
        if (verification.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED, "Mã xác thực OTP đã hết hạn sau 10 phút. Vui lòng yêu cầu gửi lại.");
        }

        // 4. Chống tấn công Brute-force: Khóa mã nếu nhập sai quá 5 lần
        if (verification.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
            throw new AppException(ErrorCode.INVALID_OTP, "Bạn đã nhập sai mã xác thực quá 5 lần. Vui lòng yêu cầu gửi lại mã mới.");
        }

        // 5. So khớp mã băm SHA-256 an toàn
        String inputOtpHash = tokenService.hashToken(request.otp().trim());
        if (!inputOtpHash.equals(verification.getOtpHash())) {
            verification.setAttemptCount(verification.getAttemptCount() + 1);
            emailVerificationRepository.save(verification);
            throw new AppException(ErrorCode.INVALID_OTP, "Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại.");
        }

        // 6. Kích hoạt tài khoản chính thức và dọn dẹp mã OTP đã dùng
        user.setIsVerified(true);
        userRepository.save(user);
        emailVerificationRepository.deleteAllByUserId(user.getId());

        log.info("🎉 Tài khoản {} đã xác thực email thành công và được kích hoạt!", user.getEmail());

        // 7. Cấp phát phiên làm việc mới (JWT Access Token + Refresh Token)
        return createAuthResponse(user);
    }

    /**
     * Gửi lại mã OTP xác thực mới với cơ chế rate-limit chống spam.
     */
    @Override
    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        // 1. Kiểm tra tài khoản tồn tại và chưa được kích hoạt
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy tài khoản để gửi lại mã"));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Tài khoản này đã được kích hoạt trước đó.");
        }

        // 2. Chống spam Mailer: Áp dụng Cooldown 60 giây giữa các lần yêu cầu
        var latestOpt = emailVerificationRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());
        if (latestOpt.isPresent()) {
            EmailVerification latest = latestOpt.get();
            long secondsSinceCreated = ChronoUnit.SECONDS.between(latest.getCreatedAt(), Instant.now());
            if (secondsSinceCreated < RESEND_COOLDOWN_SECONDS) {
                long waitSeconds = RESEND_COOLDOWN_SECONDS - secondsSinceCreated;
                throw new AppException(ErrorCode.INVALID_REQUEST, "Vui lòng chờ thêm " + waitSeconds + " giây trước khi yêu cầu gửi lại mã.");
            }
        }

        // 3. Sinh mã OTP mới và cập nhật bản ghi xác thực trong CSDL
        String otp = generateOtpCode();
        String otpHash = tokenService.hashToken(otp);

        emailVerificationRepository.deleteAllByUserId(user.getId());
        EmailVerification verification = new EmailVerification(
                user,
                otpHash,
                Instant.now().plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES)
        );
        emailVerificationRepository.save(verification);

        // 4. Gửi email xác thực mới qua SMTP
        emailService.sendOtpEmail(user.getEmail(), otp, (int) OTP_VALIDITY_MINUTES);
    }

    /**
     * Xác thực thông tin đăng nhập bằng Email và Mật khẩu.
     */
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // 1. Tìm kiếm tài khoản theo email
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        // 2. So khớp mật khẩu với mã băm BCrypt trong CSDL
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 3. Ràng buộc an ninh: Bắt buộc tài khoản phải hoàn tất xác thực email 2 bước
        if (Boolean.FALSE.equals(user.getIsVerified())) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED, "Tài khoản của bạn chưa được xác thực email. Vui lòng hoàn tất kích hoạt bằng mã OTP.");
        }

        // 4. Khởi tạo phiên làm việc mới
        return createAuthResponse(user);
    }

    /**
     * Làm mới Access Token bằng Refresh Token (Cơ chế Token Rotation & Reuse Detection).
     */
    @Override
    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Thiếu Refresh Token");
        }

        // 1. Tra cứu token theo mã băm SHA-256 (bảo vệ CSDL nếu bị rò rỉ)
        String tokenHash = tokenService.hashToken(rawRefreshToken.trim());
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "Phiên đăng nhập không tồn tại hoặc đã hết hạn"));

        // 2. Cơ chế Reuse Detection: Nếu token đã bị thu hồi nhưng lại được gửi lên -> Nghi ngờ bị đánh cắp (Replay Attack)
        if (Boolean.TRUE.equals(token.getIsRevoked())) {
            log.warn("CẢNH BÁO AN NINH: Phát hiện tái sử dụng Refresh Token đã bị thu hồi của user ID #{}", token.getUser().getId());
            // Lập tức thu hồi TOÀN BỘ các refresh token của user này để bảo vệ tài khoản
            refreshTokenRepository.revokeAllByUserId(token.getUser().getId());
            throw new AppException(ErrorCode.UNAUTHORIZED, "Cảnh báo bảo mật: Phiên làm việc đã bị thu hồi do phát hiện token bị xâm phạm");
        }

        // 3. Kiểm tra thời hạn hiệu lực 7 ngày của Refresh Token
        if (token.getExpiresAt().isBefore(Instant.now())) {
            token.setIsRevoked(true);
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Phiên làm việc đã hết hạn sau 7 ngày không hoạt động. Vui lòng đăng nhập lại.");
        }

        // 4. Token Rotation: Thu hồi token cũ ngay lập tức (mỗi Refresh Token chỉ được dùng đúng 1 lần)
        token.setIsRevoked(true);
        refreshTokenRepository.save(token);

        // 5. Cấp phát cặp token mới (Access Token mới + Refresh Token mới)
        User user = token.getUser();
        return createAuthResponse(user);
    }

    /**
     * Đăng xuất người dùng bằng cách thu hồi Refresh Token trong CSDL.
     */
    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = tokenService.hashToken(rawRefreshToken.trim());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setIsRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }

    /**
     * Lấy thông tin hồ sơ người dùng hiện tại theo ID.
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }

    /**
     * Helper tạo phiên làm việc: Cấp Access Token (15m), Refresh Token (7d) và lưu mã băm vào CSDL.
     */
    private AuthResponse createAuthResponse(User user) {
        String accessToken = tokenService.generateAccessToken(user);
        String rawRefreshToken = tokenService.generateRefreshToken();
        String hashedRefreshToken = tokenService.hashToken(rawRefreshToken);

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashedRefreshToken)
                .expiresAt(Instant.now().plus(REFRESH_TOKEN_VALIDITY_DAYS, ChronoUnit.DAYS))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(900L) // 15 phút
                .user(userMapper.toResponse(user))
                .build();
    }

    /**
     * Sinh mã OTP ngẫu nhiên 6 chữ số an toàn bảo mật mật mã học trong khoảng 100000 - 999999.
     */
    private String generateOtpCode() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }
}
