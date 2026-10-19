package com.dylask.modules.auth.service.impl;

import com.dylask.modules.auth.dto.AuthResponse;
import com.dylask.modules.auth.entity.RefreshToken;
import com.dylask.modules.auth.repository.RefreshTokenRepository;
import com.dylask.modules.auth.service.OAuth2AuthService;
import com.dylask.modules.auth.service.TokenService;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.mapper.UserMapper;
import com.dylask.modules.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

/**
 * Hiện thực hóa quy trình đồng bộ hồ sơ OAuth2 và cấp phát phiên làm việc an toàn.
 * Hỗ trợ liên kết tài khoản tự động (Account Linking) giữa đăng ký thường và mạng xã hội.
 */
@Service
@Slf4j
public class OAuth2AuthServiceImpl implements OAuth2AuthService {

    private static final long REFRESH_TOKEN_VALIDITY_DAYS = 7;
    private static final long ACCESS_TOKEN_EXPIRATION_SECONDS = 900; // 15 phút

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;
    private final UserMapper userMapper;

    public OAuth2AuthServiceImpl(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            TokenService tokenService,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenService = tokenService;
        this.userMapper = userMapper;
    }

    /**
     * Đồng bộ người dùng từ OAuth2 Provider (Google hoặc GitHub) vào cơ sở dữ liệu.
     * Quy trình thực hiện:
     * 1. Tìm người dùng theo cặp duy nhất (auth_provider, provider_id).
     * 2. Nếu không tìm thấy, tìm tiếp theo email để hỗ trợ liên kết tài khoản (Account Linking).
     * 3. Nếu chưa tồn tại, khởi tạo User mới với chế độ mặc định tương ứng (GitHub -> developer, Google -> standard).
     * 4. Cấp phát JWT Access Token (15 phút) và Refresh Token (7 ngày) lưu mã băm an toàn vào CSDL.
     *
     * @param provider Tên nhà cung cấp ('google' hoặc 'github')
     * @param providerId Mã định danh ID duy nhất của nhà cung cấp
     * @param email Địa chỉ email xác thực của người dùng
     * @param fullName Họ tên người dùng từ OAuth2
     * @param avatarUrl Link ảnh đại diện từ OAuth2
     * @return {@link AuthResponse} Phiên làm việc đã kích hoạt
     */
    @Override
    @Transactional
    public AuthResponse processOAuth2Login(
            String provider,
            String providerId,
            String email,
            String fullName,
            String avatarUrl
    ) {
        log.info("Bắt đầu xử lý đăng nhập OAuth2 cho provider: {}, providerId: {}, email: {}", provider, providerId, email);

        // 1. Chuẩn hóa dữ liệu đầu vào
        String normalizedEmail = email != null ? email.trim().toLowerCase() : null;
        String normalizedProvider = provider.toLowerCase();

        // 2. Tra cứu tài khoản đã liên kết trước đó bằng (auth_provider, provider_id)
        Optional<User> existingUserOpt = userRepository.findByAuthProviderAndProviderId(normalizedProvider, providerId);
        User user;

        if (existingUserOpt.isPresent()) {
            // Trường hợp A: Đã từng đăng nhập bằng tài khoản OAuth2 này
            user = existingUserOpt.get();
            log.info("Tìm thấy tài khoản đã liên kết: id={}, email={}", user.getId(), user.getEmail());

            // Cập nhật ảnh đại diện hoặc họ tên nếu có thay đổi từ Provider
            boolean updated = false;
            if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
                user.setAvatarUrl(avatarUrl);
                updated = true;
            }
            if (fullName != null && !fullName.isBlank() && !fullName.equals(user.getFullName())) {
                user.setFullName(fullName);
                updated = true;
            }
            if (Boolean.FALSE.equals(user.getIsVerified())) {
                // Nhà cung cấp OAuth2 đã chứng thực quyền sở hữu email
                user.setIsVerified(true);
                updated = true;
            }
            if (updated) {
                user = userRepository.save(user);
            }
        } else {
            // Trường hợp B: Chưa liên kết theo provider_id -> Kiểm tra email đã có trong hệ thống chưa
            Optional<User> userByEmailOpt = normalizedEmail != null ? userRepository.findByEmail(normalizedEmail) : Optional.empty();

            if (userByEmailOpt.isPresent()) {
                // Trường hợp B1: Đã có tài khoản tạo bằng email/password cục bộ -> Tự động liên kết tài khoản
                user = userByEmailOpt.get();
                log.info("Liên kết tài khoản hiện có id={} với provider: {}", user.getId(), normalizedProvider);

                user.setAuthProvider(normalizedProvider);
                user.setProviderId(providerId);
                user.setIsVerified(true); // Đánh dấu kích hoạt vì Google/GitHub đã xác thực email
                if (user.getAvatarUrl() == null && avatarUrl != null) {
                    user.setAvatarUrl(avatarUrl);
                }
                user = userRepository.save(user);
            } else {
                // Trường hợp B2: Khách hàng mới hoàn toàn -> Tạo bản ghi User mới
                log.info("Tạo tài khoản mới từ OAuth2 provider: {}, email: {}", normalizedProvider, normalizedEmail);

                // Gán chế độ mặc định theo đặc tả: GitHub thiên về Developer Mode, Google thiên về Standard Mode
                String defaultMode = "github".equals(normalizedProvider) ? "developer" : "standard";
                String displayName = (fullName != null && !fullName.isBlank()) ? fullName : ("github".equals(normalizedProvider) ? "GitHub Developer" : "Google User");
                String fallbackEmail = normalizedEmail != null ? normalizedEmail : (providerId + "@" + normalizedProvider + ".oauth");

                user = new User(
                        null,
                        fallbackEmail,
                        normalizedProvider,
                        providerId,
                        null, // OAuth2 không cần mật khẩu cục bộ
                        displayName,
                        avatarUrl,
                        defaultMode,
                        true, // isVerified = true ngay lập tức
                        false, // isAiEnabled
                        0, // aiTrialCount
                        10, // aiTrialLimit
                        null, // aiProvider
                        null // aiApiKeyEncrypted
                );
                user = userRepository.save(user);
            }
        }

        // 3. Cấp phát phiên làm việc: JWT Access Token (15 phút) & Refresh Token (7 ngày)
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

        log.info("🎉 Đăng nhập OAuth2 thành công cho user: {} (ID: {})", user.getEmail(), user.getId());

        // 4. Trả về cấu trúc AuthResponse chuẩn hóa toàn hệ thống
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresIn(ACCESS_TOKEN_EXPIRATION_SECONDS)
                .user(userMapper.toResponse(user))
                .build();
    }
}
