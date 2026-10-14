package com.dylask.modules.auth.service;

import com.dylask.modules.auth.service.impl.JwtTokenServiceImpl;
import com.dylask.modules.user.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenServiceTest {

    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        String testSecret = "test_very_secret_key_that_is_at_least_256_bits_long_1234567890";
        tokenService = new JwtTokenServiceImpl(testSecret, 900);
    }

    @Test
    @DisplayName("Should generate valid JWT access token containing user claims")
    void shouldGenerateValidAccessToken() {
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Nguyễn Duy Anh")
                .defaultMode("standard")
                .build();

        String token = tokenService.generateAccessToken(user);

        assertNotNull(token);
        assertTrue(tokenService.validateAccessToken(token));

        Claims claims = tokenService.parseClaims(token);
        assertEquals("1", claims.getSubject());
        assertEquals("test@example.com", claims.get("email"));
        assertEquals("Nguyễn Duy Anh", claims.get("fullName"));
        assertEquals("standard", claims.get("defaultMode"));
    }

    @Test
    @DisplayName("Should generate secure 64-character hex refresh token")
    void shouldGenerateValidRefreshToken() {
        String refreshToken1 = tokenService.generateRefreshToken();
        String refreshToken2 = tokenService.generateRefreshToken();

        assertNotNull(refreshToken1);
        assertEquals(64, refreshToken1.length());
        assertNotEquals(refreshToken1, refreshToken2);
    }

    @Test
    @DisplayName("Should hash token using SHA-256 deterministically")
    void shouldHashTokenConsistently() {
        String rawToken = "7a9f8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a";
        String hash1 = tokenService.hashToken(rawToken);
        String hash2 = tokenService.hashToken(rawToken);

        assertNotNull(hash1);
        assertEquals(64, hash1.length());
        assertEquals(hash1, hash2);
    }
}
