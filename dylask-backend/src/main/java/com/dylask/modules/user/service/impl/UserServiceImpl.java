package com.dylask.modules.user.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.auth.repository.RefreshTokenRepository;
import com.dylask.modules.user.dto.request.ChangePasswordRequest;
import com.dylask.modules.user.dto.request.UpdateModeRequest;
import com.dylask.modules.user.dto.request.UpdateProfileRequest;
import com.dylask.modules.user.dto.response.UserModeResponse;
import com.dylask.modules.user.dto.response.UserProfileResponse;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.mapper.UserMapper;
import com.dylask.modules.user.repository.UserRepository;
import com.dylask.modules.user.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Hiện thực hóa các nghiệp vụ quản lý hồ sơ cá nhân và chế độ giao diện người dùng.
 * Đảm bảo các tiêu chuẩn về an toàn bảo mật, tính toàn vẹn dữ liệu và kiểm soát phiên làm việc.
 */
@Slf4j
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserServiceImpl(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    /**
     * Lấy thông tin hồ sơ cá nhân chi tiết của người dùng.
     *
     * @param userId Định danh người dùng cần lấy thông tin
     * @return DTO chứa thông tin hồ sơ và định mức sử dụng AI
     */
    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        // 1. Tìm kiếm thông tin người dùng trong cơ sở dữ liệu
        User user = findUserById(userId);

        // 2. Chuyển đổi sang UserProfileResponse thông qua MapStruct
        return userMapper.toProfileResponse(user);
    }

    /**
     * Cập nhật chế độ giao diện mặc định của người dùng (Dual-Mode).
     *
     * @param userId Định danh người dùng
     * @param request DTO chứa chế độ mới ('standard' hoặc 'developer')
     * @return DTO xác nhận chế độ mặc định vừa cập nhật
     */
    @Override
    public UserModeResponse updateMode(Long userId, UpdateModeRequest request) {
        // 1. Tìm kiếm thực thể người dùng
        User user = findUserById(userId);

        // 2. Cập nhật chế độ mặc định
        user.setDefaultMode(request.mode());
        userRepository.save(user);

        log.info("Người dùng ID #{} đã chuyển đổi chế độ mặc định sang: '{}'", userId, request.mode());

        // 3. Trả về phản hồi xác nhận
        return new UserModeResponse(user.getDefaultMode());
    }

    /**
     * Cập nhật họ tên hiển thị trong hồ sơ người dùng.
     *
     * @param userId Định danh người dùng
     * @param request DTO chứa họ và tên mới
     * @return Hồ sơ người dùng sau khi đã cập nhật thành công
     */
    @Override
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        // 1. Tìm kiếm thực thể người dùng
        User user = findUserById(userId);

        // 2. Chuẩn hóa và gán họ tên mới (loại bỏ khoảng trắng thừa ở hai đầu)
        String trimmedFullName = request.fullName().trim();
        user.setFullName(trimmedFullName);
        userRepository.save(user);

        log.info("Người dùng ID #{} đã cập nhật họ tên thành: '{}'", userId, trimmedFullName);

        // 3. Chuyển đổi và trả về hồ sơ cập nhật
        return userMapper.toProfileResponse(user);
    }

    /**
     * Thay đổi mật khẩu tài khoản người dùng và vô hiệu hóa tất cả các phiên đăng nhập khác.
     *
     * @param userId Định danh người dùng
     * @param request DTO chứa mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu
     */
    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        // 1. Kiểm tra xác nhận mật khẩu mới có khớp chính xác không
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Mật khẩu xác nhận không khớp");
        }

        // 2. Tìm kiếm tài khoản người dùng
        User user = findUserById(userId);

        // 3. Kiểm tra xem tài khoản có mật khẩu cục bộ không (ví dụ: tài khoản chỉ đăng nhập qua Google/GitHub)
        if (user.getPasswordHash() == null) {
            throw new AppException(
                    ErrorCode.INVALID_REQUEST,
                    "Tài khoản đăng nhập qua mạng xã hội chưa thiết lập mật khẩu cục bộ"
            );
        }

        // 4. Xác thực mật khẩu hiện tại có trùng khớp với bản băm mật khẩu trong cơ sở dữ liệu không
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            log.warn("Người dùng ID #{} thất bại khi đổi mật khẩu: Mật khẩu hiện tại không khớp", userId);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu hiện tại không chính xác");
        }

        // 5. Ngăn chặn đặt mật khẩu mới trùng lặp với mật khẩu hiện tại
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        // 6. Mã hóa mật khẩu mới bằng thuật toán BCrypt
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // 7. Thu hồi toàn bộ Refresh Token của tài khoản trên các thiết bị khác để ngăn chặn rò rỉ phiên
        int revokedCount = refreshTokenRepository.revokeAllByUserId(userId);
        log.info("Người dùng ID #{} đã đổi mật khẩu thành công. Đã thu hồi {} refresh token phiên cũ.", userId, revokedCount);
    }

    /**
     * Hàm phụ trợ tìm kiếm User theo ID, bắn ngoại lệ 404 nếu không tìm thấy.
     */
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy thông tin tài khoản"));
    }
}
