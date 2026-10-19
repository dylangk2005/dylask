package com.dylask.modules.user.service;

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
import com.dylask.modules.user.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Bộ kiểm thử đơn vị cho {@link UserServiceImpl}.
 * Đáp ứng ma trận kiểm thử TC-USER-01 đến TC-USER-06 từ đặc tả FEAT-AUTH-02.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                userMapper
        );

        sampleUser = User.builder()
                .id(1L)
                .email("duyanh@example.com")
                .fullName("Nguyễn Duy Anh")
                .passwordHash("$2a$10$encodedOldPasswordHash")
                .defaultMode("standard")
                .isVerified(true)
                .isAiEnabled(false)
                .aiTrialCount(2)
                .aiTrialLimit(10)
                .build();
    }

    @Test
    @DisplayName("TC-USER-01: Lấy hồ sơ người dùng thành công")
    void getProfile_Success() {
        // Given
        UserProfileResponse mockResponse = UserProfileResponse.builder()
                .id(1L)
                .email("duyanh@example.com")
                .fullName("Nguyễn Duy Anh")
                .defaultMode("standard")
                .isAiEnabled(false)
                .aiTrialCount(2)
                .aiTrialLimit(10)
                .createdAt(Instant.now())
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userMapper.toProfileResponse(sampleUser)).thenReturn(mockResponse);

        // When
        UserProfileResponse response = userService.getProfile(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("duyanh@example.com", response.email());
        assertEquals("standard", response.defaultMode());
        verify(userRepository, times(1)).findById(1L);
        verify(userMapper, times(1)).toProfileResponse(sampleUser);
    }

    @Test
    @DisplayName("TC-USER-01b: Lấy hồ sơ thất bại khi không tìm thấy người dùng")
    void getProfile_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        AppException ex = assertThrows(AppException.class, () -> userService.getProfile(99L));
        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
        verify(userRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("TC-USER-02: Chuyển đổi sang Developer Mode thành công")
    void updateMode_DeveloperMode_Success() {
        // Given
        UpdateModeRequest request = new UpdateModeRequest("developer");
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        // When
        UserModeResponse response = userService.updateMode(1L, request);

        // Then
        assertNotNull(response);
        assertEquals("developer", response.defaultMode());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("developer", userCaptor.getValue().getDefaultMode());
    }

    @Test
    @DisplayName("TC-USER-04: Đổi họ tên thành công và loại bỏ khoảng trắng thừa")
    void updateProfile_Success() {
        // Given
        UpdateProfileRequest request = new UpdateProfileRequest("  Nguyễn Duy Anh (Lead Dev)  ");
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UserProfileResponse mockResponse = UserProfileResponse.builder()
                .id(1L)
                .fullName("Nguyễn Duy Anh (Lead Dev)")
                .build();
        when(userMapper.toProfileResponse(sampleUser)).thenReturn(mockResponse);

        // When
        UserProfileResponse response = userService.updateProfile(1L, request);

        // Then
        assertNotNull(response);
        assertEquals("Nguyễn Duy Anh (Lead Dev)", response.fullName());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("Nguyễn Duy Anh (Lead Dev)", userCaptor.getValue().getFullName());
    }

    @Test
    @DisplayName("TC-USER-05: Đổi mật khẩu thất bại khi mật khẩu hiện tại không chính xác")
    void changePassword_WrongCurrentPassword_ThrowsException() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest(
                "WrongPassword123",
                "NewPassword456",
                "NewPassword456"
        );
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword123", sampleUser.getPasswordHash())).thenReturn(false);

        // When & Then
        AppException ex = assertThrows(AppException.class, () -> userService.changePassword(1L, request));
        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
        assertEquals("Mật khẩu hiện tại không chính xác", ex.getMessage());

        verify(userRepository, never()).save(any(User.class));
        verify(refreshTokenRepository, never()).revokeAllByUserId(anyLong());
    }

    @Test
    @DisplayName("TC-USER-06: Đổi mật khẩu thất bại khi mật khẩu mới trùng lặp mật khẩu cũ")
    void changePassword_SameAsCurrentPassword_ThrowsException() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest(
                "Password123",
                "Password123",
                "Password123"
        );
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("Password123", sampleUser.getPasswordHash())).thenReturn(true);

        // When & Then
        AppException ex = assertThrows(AppException.class, () -> userService.changePassword(1L, request));
        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        assertEquals("Mật khẩu mới không được trùng với mật khẩu hiện tại", ex.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại khi mật khẩu xác nhận không khớp")
    void changePassword_MismatchConfirm_ThrowsException() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest(
                "Password123",
                "NewPassword456",
                "DifferentConfirm789"
        );

        // When & Then
        AppException ex = assertThrows(AppException.class, () -> userService.changePassword(1L, request));
        assertEquals(ErrorCode.VALIDATION_FAILED, ex.getErrorCode());
        assertEquals("Mật khẩu xác nhận không khớp", ex.getMessage());

        verify(userRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại đối với tài khoản chỉ dùng OAuth2 không có mật khẩu cục bộ")
    void changePassword_OAuthUserWithoutPassword_ThrowsException() {
        // Given
        sampleUser.setPasswordHash(null);
        ChangePasswordRequest request = new ChangePasswordRequest(
                "AnyCurrentPass1",
                "NewPassword456",
                "NewPassword456"
        );
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        // When & Then
        AppException ex = assertThrows(AppException.class, () -> userService.changePassword(1L, request));
        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("chưa thiết lập mật khẩu cục bộ"));
    }

    @Test
    @DisplayName("Đổi mật khẩu thành công: Mã hóa mật khẩu mới và thu hồi tất cả refresh token")
    void changePassword_Success() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123",
                "NewSecurePassword456",
                "NewSecurePassword456"
        );
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("OldPassword123", sampleUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.matches("NewSecurePassword456", sampleUser.getPasswordHash())).thenReturn(false);
        when(passwordEncoder.encode("NewSecurePassword456")).thenReturn("$2a$10$newHashedPassword");

        // When
        userService.changePassword(1L, request);

        // Then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("$2a$10$newHashedPassword", userCaptor.getValue().getPasswordHash());

        verify(refreshTokenRepository, times(1)).revokeAllByUserId(1L);
    }
}
