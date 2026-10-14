package com.dylask.modules.auth.entity;

import com.dylask.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "email_verifications", indexes = {
    @Index(name = "idx_verif_user_id", columnList = "user_id")
})
@Getter
@Setter
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "otp_hash", nullable = false, length = 64)
    private String otpHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public EmailVerification() {
    }

    public EmailVerification(User user, String otpHash, Instant expiresAt) {
        this.user = user;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.attemptCount = 0;
        this.createdAt = Instant.now();
    }
}
