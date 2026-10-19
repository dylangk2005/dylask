package com.dylask.modules.user.service;

import com.dylask.modules.user.dto.request.ChangePasswordRequest;
import com.dylask.modules.user.dto.request.UpdateModeRequest;
import com.dylask.modules.user.dto.request.UpdateProfileRequest;
import com.dylask.modules.user.dto.response.UserModeResponse;
import com.dylask.modules.user.dto.response.UserProfileResponse;

/**
 * Service định nghĩa các thao tác nghiệp vụ liên quan đến hồ sơ cá nhân và tùy chỉnh chế độ giao diện người dùng.
 */
public interface UserService {

    /**
     * Lấy thông tin hồ sơ chi tiết của người dùng theo ID tài khoản.
     *
     * @param userId Định danh người dùng
     * @return Thông tin hồ sơ người dùng đầy đủ
     */
    UserProfileResponse getProfile(Long userId);

    /**
     * Chuyển đổi và lưu lại chế độ giao diện mặc định (Dual-Mode: 'standard' hoặc 'developer').
     *
     * @param userId Định danh người dùng
     * @param request Yêu cầu chứa chế độ mong muốn
     * @return Phản hồi xác nhận chế độ mặc định mới
     */
    UserModeResponse updateMode(Long userId, UpdateModeRequest request);

    /**
     * Cập nhật thông tin họ và tên hiển thị của người dùng.
     *
     * @param userId Định danh người dùng
     * @param request Yêu cầu chứa họ tên mới
     * @return Hồ sơ người dùng sau khi cập nhật
     */
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    /**
     * Thay đổi mật khẩu người dùng và thu hồi toàn bộ Refresh Token của các phiên cũ để đảm bảo an toàn.
     *
     * @param userId Định danh người dùng
     * @param request Yêu cầu chứa mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu
     */
    void changePassword(Long userId, ChangePasswordRequest request);
}
