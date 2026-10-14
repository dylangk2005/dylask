package com.dylask.modules.auth.dto;

public record RegisterResponse(
    String email,
    String fullName,
    boolean requiresVerification,
    String message
) {
}
