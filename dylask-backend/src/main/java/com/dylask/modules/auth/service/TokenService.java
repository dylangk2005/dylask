package com.dylask.modules.auth.service;

import com.dylask.modules.user.entity.User;
import io.jsonwebtoken.Claims;

public interface TokenService {

    String generateAccessToken(User user);

    String generateRefreshToken();

    String hashToken(String rawToken);

    Claims parseClaims(String token);

    boolean validateAccessToken(String token);

    long getAccessTokenExpiresIn();
}
