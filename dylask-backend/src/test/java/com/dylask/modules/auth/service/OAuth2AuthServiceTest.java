package com.dylask.modules.auth.service;

import com.dylask.modules.auth.dto.AuthResponse;
import com.dylask.modules.auth.entity.RefreshToken;
import com.dylask.modules.auth.repository.RefreshTokenRepository;
import com.dylask.modules.auth.service.impl.OAuth2AuthServiceImpl;
import com.dylask.modules.user.dto.UserResponse;
import com.dylask.modules.user.entity.User;
import com.dylask.modules.user.mapper.UserMapper;
import com.dylask.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Bộ kiểm thử đơn vị cho {@link OAuth2AuthServiceImpl}.
 * Kiểm tra các kịch bản:
 * 1. Đăng nhập lại với tài khoản OAuth2 đã liên kết từ trước.
 * 2. Tự động liên kết tài khoản khi email trùng với tài khoản đã đăng ký cục bộ.
 * 3. Tạo tài khoản mới cho người dùng Google (mặc định Standard Mode).
 * 4. Tạo tài khoản mới cho lập trình viên GitHub (mặc định Developer Mode).
 */
@ExtendWith(MockitoExtension.class)
class OAuth2AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private UserMapper userMapper;

    private OAuth2AuthService oAuth2AuthService;

    @BeforeEach
    void setUp() {
        oAuth2AuthService = new OAuth2AuthServiceImpl(
                userRepository,
                refreshTokenRepository,
                tokenService,
                userMapper
        );
    }

    @Test
    @DisplayName("OAuth2: Đăng nhập lại thành công với tài khoản đã liên kết trước đó")
    void processOAuth2Login_existingUserWithProviderId_updatesAndReturnsTokens() {
        // Arrange
        User existingUser = new User();
        existingUser.setId(10L);
        existingUser.setEmail("dev@example.com");
        existingUser.setAuthProvider("github");
        existingUser.setProviderId("123456");
        existingUser.setFullName("Old Name");
        existingUser.setIsVerified(false);

        when(userRepository.findByAuthProviderAndProviderId("github", "123456"))
                .thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenService.generateAccessToken(existingUser)).thenReturn("access-token-xyz");
        when(tokenService.generateRefreshToken()).thenReturn("refresh-token-xyz");
        when(tokenService.hashToken("refresh-token-xyz")).thenReturn("hashed-refresh-token");

        UserResponse mockResponse = new UserResponse(
                10L, "dev@example.com", "New Dev", "https://avatar.com/dev.jpg",
                "developer", false, 10
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(mockResponse);

        // Act
        AuthResponse response = oAuth2AuthService.processOAuth2Login(
                "github", "123456", "dev@example.com", "New Dev", "https://avatar.com/dev.jpg"
        );

        // Assert
        assertNotNull(response);
        assertEquals("access-token-xyz", response.accessToken());
        assertEquals("refresh-token-xyz", response.refreshToken());
        assertTrue(existingUser.getIsVerified());
        assertEquals("New Dev", existingUser.getFullName());
        assertEquals("https://avatar.com/dev.jpg", existingUser.getAvatarUrl());

        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("OAuth2: Tự động liên kết tài khoản khi email trùng với tài khoản cục bộ")
    void processOAuth2Login_existingUserWithEmail_linksAccount() {
        // Arrange
        User localUser = new User();
        localUser.setId(20L);
        localUser.setEmail("user@gmail.com");
        localUser.setAuthProvider("local");
        localUser.setProviderId(null);
        localUser.setIsVerified(false);

        when(userRepository.findByAuthProviderAndProviderId("google", "google-sub-789"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("user@gmail.com"))
                .thenReturn(Optional.of(localUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tokenService.generateAccessToken(localUser)).thenReturn("access-token-google");
        when(tokenService.generateRefreshToken()).thenReturn("refresh-token-google");
        when(tokenService.hashToken("refresh-token-google")).thenReturn("hashed-token-google");

        UserResponse mockResponse = new UserResponse(
                20L, "user@gmail.com", "User Full Name", null,
                "standard", false, 10
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(mockResponse);

        // Act
        AuthResponse response = oAuth2AuthService.processOAuth2Login(
                "google", "google-sub-789", "user@gmail.com", "User Full Name", "https://photo.com/u.jpg"
        );

        // Assert
        assertNotNull(response);
        assertEquals("google", localUser.getAuthProvider());
        assertEquals("google-sub-789", localUser.getProviderId());
        assertTrue(localUser.getIsVerified(), "Tài khoản liên kết Google phải được kích hoạt xác thực");
        assertEquals("https://photo.com/u.jpg", localUser.getAvatarUrl());
        verify(userRepository, times(1)).save(localUser);
    }

    @Test
    @DisplayName("OAuth2: Khởi tạo tài khoản mới cho người dùng Google với Standard Mode")
    void processOAuth2Login_newGoogleUser_createsStandardModeUser() {
        // Arrange
        when(userRepository.findByAuthProviderAndProviderId("google", "google-new-id"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("new.google@gmail.com"))
                .thenReturn(Optional.empty());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(30L);
            return u;
        });

        when(tokenService.generateAccessToken(any(User.class))).thenReturn("access-new-google");
        when(tokenService.generateRefreshToken()).thenReturn("refresh-new-google");
        when(tokenService.hashToken("refresh-new-google")).thenReturn("hash-new-google");

        UserResponse mockResponse = new UserResponse(
                30L, "new.google@gmail.com", "Google Guy", null,
                "standard", false, 10
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(mockResponse);

        // Act
        AuthResponse response = oAuth2AuthService.processOAuth2Login(
                "google", "google-new-id", "new.google@gmail.com", "Google Guy", null
        );

        // Assert
        assertNotNull(response);
        User savedUser = userCaptor.getValue();
        assertEquals("new.google@gmail.com", savedUser.getEmail());
        assertEquals("google", savedUser.getAuthProvider());
        assertEquals("google-new-id", savedUser.getProviderId());
        assertEquals("standard", savedUser.getDefaultMode(), "Người dùng Google mặc định ở chế độ Standard Mode");
        assertTrue(savedUser.getIsVerified());
        assertNull(savedUser.getPasswordHash(), "Tài khoản OAuth2 không có mật khẩu cục bộ");
    }

    @Test
    @DisplayName("OAuth2: Khởi tạo tài khoản mới cho kỹ sư GitHub với Developer Mode")
    void processOAuth2Login_newGitHubUser_createsDeveloperModeUser() {
        // Arrange
        when(userRepository.findByAuthProviderAndProviderId("github", "github-999"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("octocat@github.com"))
                .thenReturn(Optional.empty());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(40L);
            return u;
        });

        when(tokenService.generateAccessToken(any(User.class))).thenReturn("access-github");
        when(tokenService.generateRefreshToken()).thenReturn("refresh-github");
        when(tokenService.hashToken("refresh-github")).thenReturn("hash-github");

        UserResponse mockResponse = new UserResponse(
                40L, "octocat@github.com", "Octocat", "https://github.com/octocat.png",
                "developer", false, 10
        );
        when(userMapper.toResponse(any(User.class))).thenReturn(mockResponse);

        // Act
        AuthResponse response = oAuth2AuthService.processOAuth2Login(
                "github", "github-999", "octocat@github.com", "Octocat", "https://github.com/octocat.png"
        );

        // Assert
        assertNotNull(response);
        User savedUser = userCaptor.getValue();
        assertEquals("octocat@github.com", savedUser.getEmail());
        assertEquals("github", savedUser.getAuthProvider());
        assertEquals("github-999", savedUser.getProviderId());
        assertEquals("developer", savedUser.getDefaultMode(), "Người dùng GitHub mặc định ở chế độ Developer Mode");
        assertTrue(savedUser.getIsVerified());
    }
}
