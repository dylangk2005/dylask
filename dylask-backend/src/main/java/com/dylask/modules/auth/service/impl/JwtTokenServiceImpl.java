package com.dylask.modules.auth.service.impl;

import com.dylask.modules.auth.service.TokenService;
import com.dylask.modules.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HexFormat;

@Slf4j
@Service
public class JwtTokenServiceImpl implements TokenService {

    private final SecretKey secretKey;
    private final long accessTokenExpirationSeconds;
    private final SecureRandom secureRandom = new SecureRandom();

    public JwtTokenServiceImpl(
            @Value("${jwt.secret:c2FmZV9hbmRfc2VjdXJlX2p3dF9zZWNyZXRfa2V5X2Zvcl9keWxhc2tfYXBwXzIwMjY=}") String jwtSecret,
            @Value("${jwt.access-token-expiration-seconds:900}") long accessTokenExpirationSeconds) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
    }

    @Override
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenExpirationSeconds, ChronoUnit.SECONDS);

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("fullName", user.getFullName())
                .claim("defaultMode", user.getDefaultMode())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    @Override
    public String generateRefreshToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return HexFormat.of().formatHex(randomBytes); // 64 hex characters
    }

    @Override
    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    @Override
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public boolean validateAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public long getAccessTokenExpiresIn() {
        return accessTokenExpirationSeconds;
    }
}
