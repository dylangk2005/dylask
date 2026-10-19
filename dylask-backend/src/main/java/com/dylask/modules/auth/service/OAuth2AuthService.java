package com.dylask.modules.auth.service;

import com.dylask.modules.auth.dto.AuthResponse;

/**
 * Service xử lý nghiệp vụ đồng bộ và xác thực tài khoản qua OAuth2 (Google & GitHub).
 * Tuân thủ kiến trúc Modular Monolith và quy chuẩn bảo mật phân hệ Authentication.
 */
public interface OAuth2AuthService {

    /**
     * Đồng bộ thông tin người dùng từ OAuth2 Provider (Google/GitHub) vào hệ thống.
     * Tự động tạo người dùng mới hoặc liên kết tài khoản đã tồn tại, sau đó cấp phát
     * cặp mã thông báo JWT Access Token (15 phút) và Refresh Token (7 ngày).
     *
     * @param provider Tên nhà cung cấp ('google' hoặc 'github')
     * @param providerId Mã định danh duy nhất của người dùng từ nhà cung cấp ('sub' hoặc 'id')
     * @param email Địa chỉ email của người dùng đã được nhà cung cấp xác thực
     * @param fullName Họ và tên hiển thị của người dùng
     * @param avatarUrl Đường dẫn ảnh đại diện (nếu có)
     * @return {@link AuthResponse} Chứa JWT Access Token, Refresh Token và thông tin người dùng
     */
    AuthResponse processOAuth2Login(String provider, String providerId, String email, String fullName, String avatarUrl);
}
