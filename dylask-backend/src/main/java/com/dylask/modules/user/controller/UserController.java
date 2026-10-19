package com.dylask.modules.user.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.user.dto.request.ChangePasswordRequest;
import com.dylask.modules.user.dto.request.UpdateModeRequest;
import com.dylask.modules.user.dto.request.UpdateProfileRequest;
import com.dylask.modules.user.dto.response.UserModeResponse;
import com.dylask.modules.user.dto.response.UserProfileResponse;
import com.dylask.modules.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller cung cấp các API quản lý thông tin tài khoản cá nhân
 * và chuyển đổi chế độ giao diện (Dual-Mode: Standard Mode / Developer Mode).
 */
@RestController
@RequestMapping("/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Lấy thông tin hồ sơ chi tiết của người dùng đang đăng nhập.
     *
     * @param currentUserId ID người dùng được trích xuất từ JWT token
     * @return Thông tin hồ sơ người dùng đầy đủ
     */
    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId) {
        validateAuthenticatedUser(currentUserId);
        UserProfileResponse response = userService.getProfile(currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(response, "Lấy thông tin tài khoản thành công"));
    }

    /**
     * Chuyển đổi và lưu lại chế độ giao diện mặc định ('standard' hoặc 'developer').
     *
     * @param currentUserId ID người dùng được trích xuất từ JWT token
     * @param request DTO chứa chế độ mới
     * @return Phản hồi xác nhận chế độ mặc định mới
     */
    @PatchMapping("/mode")
    public ResponseEntity<ApiResponse<UserModeResponse>> updateMode(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @Valid @RequestBody UpdateModeRequest request) {
        validateAuthenticatedUser(currentUserId);
        UserModeResponse response = userService.updateMode(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Chuyển đổi chế độ thành công"));
    }

    /**
     * Cập nhật họ tên hiển thị trong hồ sơ người dùng.
     *
     * @param currentUserId ID người dùng được trích xuất từ JWT token
     * @param request DTO chứa họ và tên mới
     * @return Hồ sơ người dùng sau khi đã cập nhật
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @Valid @RequestBody UpdateProfileRequest request) {
        validateAuthenticatedUser(currentUserId);
        UserProfileResponse response = userService.updateProfile(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Cập nhật hồ sơ thành công"));
    }

    /**
     * Thay đổi mật khẩu người dùng và thu hồi các phiên làm việc cũ.
     *
     * @param currentUserId ID người dùng được trích xuất từ JWT token
     * @param request DTO chứa mật khẩu hiện tại và mật khẩu mới
     * @return Thông báo đổi mật khẩu thành công
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @Valid @RequestBody ChangePasswordRequest request) {
        validateAuthenticatedUser(currentUserId);
        userService.changePassword(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok(
                null,
                "Đổi mật khẩu thành công. Các phiên đăng nhập trên thiết bị khác đã được thu hồi an toàn."
        ));
    }

    /**
     * Kiểm tra phiên đăng nhập của người dùng.
     */
    private void validateAuthenticatedUser(Long userId) {
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Chưa xác thực hoặc phiên làm việc không hợp lệ");
        }
    }
}
