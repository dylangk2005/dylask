package com.dylask.modules.auth.service;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.auth.dto.*;
import com.dylask.modules.auth.entity.EmailVerification;
import com.dylask.modules.auth.entity.RefreshToken;
import com.dylask.modules.auth.repository.EmailVerificationRepository;
import com.dylask.modules.auth.repository.RefreshTokenRepository;
import com.dylask.modules.auth.service.impl.AuthServiceImpl;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private EmailVerificationRepository emailVerificationRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @Mock
    private EmailService emailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository,
                refreshTokenRepository,
                emailVerificationRepository,
                tokenService,
                passwordEncoder,
                userMapper,
                emailService
        );
    }

    @Test
    @DisplayName("TC-AUTH-01: Should register user and generate OTP verification")
    void shouldRegisterUserSuccessfully() {
        RegisterRequest request = new RegisterRequest("newuser@example.com", "Password123", "Nguyễn Duy Anh");

        when(userRepository.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password123")).thenReturn("hashedPassword123");
        when(tokenService.hashToken(anyString())).thenReturn("hashedOtpCode");

        User savedUser = User.builder()
                .id(1L)
                .email("newuser@example.com")
                .fullName("Nguyễn Duy Anh")
                .defaultMode("standard")
                .isVerified(false)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        RegisterResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("newuser@example.com", response.email());
        assertTrue(response.requiresVerification());
        verify(emailVerificationRepository, times(1)).save(any(EmailVerification.class));
    }

    @Test
    @DisplayName("TC-AUTH-02: Should verify email successfully with valid OTP")
    void shouldVerifyEmailSuccessfully() {
        VerifyEmailRequest request = new VerifyEmailRequest("test@example.com", "123456");

        User unverifiedUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Nguyễn Duy Anh")
                .isVerified(false)
                .build();

        EmailVerification verification = new EmailVerification(
                unverifiedUser,
                "hashed123456",
                Instant.now().plus(10, ChronoUnit.MINUTES)
        );

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(unverifiedUser));
        when(emailVerificationRepository.findTopByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(verification));
        when(tokenService.hashToken("123456")).thenReturn("hashed123456");
        when(tokenService.generateAccessToken(any(User.class))).thenReturn("mockJwt");
        when(tokenService.generateRefreshToken()).thenReturn("mockRefreshToken");
        when(tokenService.hashToken("mockRefreshToken")).thenReturn("hashedRefreshToken");

        UserResponse userResponse = UserResponse.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Nguyễn Duy Anh")
                .build();
        when(userMapper.toResponse(any(User.class))).thenReturn(userResponse);

        AuthResponse response = authService.verifyEmail(request);

        assertNotNull(response);
        assertEquals("mockJwt", response.accessToken());
        assertTrue(unverifiedUser.getIsVerified());
        verify(emailVerificationRepository, times(1)).deleteAllByUserId(1L);
    }

    @Test
    @DisplayName("TC-AUTH-03: Should reject registration if email is already verified")
    void shouldThrowExceptionWhenRegisteringExistingVerifiedEmail() {
        RegisterRequest request = new RegisterRequest("existing@example.com", "Password123", "Nguyễn Duy Anh");

        User existingUser = User.builder()
                .id(2L)
                .email("existing@example.com")
                .isVerified(true)
                .build();
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));

        AppException exception = assertThrows(AppException.class, () -> authService.register(request));
        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, exception.getErrorCode());
    }

    @Test
    @DisplayName("TC-AUTH-04: Should login successfully when credentials valid and email verified")
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("test@example.com", "Password123");

        User user = User.builder()
                .id(3L)
                .email("test@example.com")
                .passwordHash("hashedPass")
                .fullName("Nguyễn Duy Anh")
                .defaultMode("standard")
                .isVerified(true)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "hashedPass")).thenReturn(true);
        when(tokenService.generateAccessToken(user)).thenReturn("mockAccessToken");
        when(tokenService.generateRefreshToken()).thenReturn("mockRefreshToken");
        when(tokenService.hashToken("mockRefreshToken")).thenReturn("hashedToken");

        UserResponse userResponse = UserResponse.builder()
                .id(3L)
                .email("test@example.com")
                .fullName("Nguyễn Duy Anh")
                .defaultMode("standard")
                .aiTrialRemaining(10)
                .build();
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockAccessToken", response.accessToken());
        assertEquals("mockRefreshToken", response.refreshToken());
    }

    @Test
    @DisplayName("TC-AUTH-05: Should reject login if email is not verified")
    void shouldRejectLoginWhenEmailNotVerified() {
        LoginRequest request = new LoginRequest("unverified@example.com", "Password123");

        User user = User.builder()
                .id(3L)
                .email("unverified@example.com")
                .passwordHash("hashedPass")
                .isVerified(false)
                .build();

        when(userRepository.findByEmail("unverified@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123", "hashedPass")).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> authService.login(request));
        assertEquals(ErrorCode.EMAIL_NOT_VERIFIED, exception.getErrorCode());
    }

    @Test
    @DisplayName("TC-AUTH-06: Should rotate refresh token on valid refresh request")
    void shouldRotateTokenSuccessfully() {
        String oldRawToken = "oldRawToken123";
        String oldTokenHash = "oldTokenHash456";

        User user = User.builder()
                .id(4L)
                .email("test@example.com")
                .isVerified(true)
                .build();

        RefreshToken existingToken = RefreshToken.builder()
                .id(10L)
                .user(user)
                .tokenHash(oldTokenHash)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .isRevoked(false)
                .build();

        when(tokenService.hashToken(oldRawToken)).thenReturn(oldTokenHash);
        when(refreshTokenRepository.findByTokenHash(oldTokenHash)).thenReturn(Optional.of(existingToken));
        when(tokenService.generateAccessToken(user)).thenReturn("newAccessToken");
        when(tokenService.generateRefreshToken()).thenReturn("newRawRefreshToken");
        when(tokenService.hashToken("newRawRefreshToken")).thenReturn("newTokenHash");

        UserResponse userResponse = UserResponse.builder().id(4L).email("test@example.com").build();
        when(userMapper.toResponse(user)).thenReturn(userResponse);

        AuthResponse response = authService.refreshToken(oldRawToken);

        assertNotNull(response);
        assertEquals("newAccessToken", response.accessToken());
        assertEquals("newRawRefreshToken", response.refreshToken());
        assertTrue(existingToken.getIsRevoked());
        verify(refreshTokenRepository, times(1)).save(existingToken);
    }

    @Test
    @DisplayName("TC-AUTH-07: Should trigger reuse detection and revoke all tokens if revoked token used")
    void shouldTriggerReuseDetectionOnRevokedToken() {
        String revokedRawToken = "compromisedToken";
        String tokenHash = "compromisedHash";

        User user = User.builder().id(4L).email("victim@example.com").build();
        RefreshToken revokedToken = RefreshToken.builder()
                .id(10L)
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(5, ChronoUnit.DAYS))
                .isRevoked(true)
                .build();

        when(tokenService.hashToken(revokedRawToken)).thenReturn(tokenHash);
        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(revokedToken));

        AppException exception = assertThrows(AppException.class, () -> authService.refreshToken(revokedRawToken));
        assertEquals(ErrorCode.UNAUTHORIZED, exception.getErrorCode());
        verify(refreshTokenRepository, times(1)).revokeAllByUserId(4L);
    }
}
