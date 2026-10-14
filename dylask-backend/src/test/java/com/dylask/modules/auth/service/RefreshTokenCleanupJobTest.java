package com.dylask.modules.auth.service;

import com.dylask.modules.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenCleanupJobTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenCleanupJob cleanupJob;

    @Test
    @DisplayName("Should execute cleanup query to purge expired and revoked tokens")
    void shouldExecuteCleanupQuery() {
        when(refreshTokenRepository.deleteExpiredOrRevokedTokens(any(Instant.class))).thenReturn(5);

        cleanupJob.cleanupExpiredTokens();

        verify(refreshTokenRepository, times(1)).deleteExpiredOrRevokedTokens(any(Instant.class));
    }
}
