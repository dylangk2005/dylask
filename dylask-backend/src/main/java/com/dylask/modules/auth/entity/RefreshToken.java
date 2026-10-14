package com.dylask.modules.auth.entity;

import com.dylask.common.entity.BaseAuditEntity;
import com.dylask.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_tokens_user_id", columnList = "user_id"),
    @Index(name = "idx_refresh_tokens_token_hash", columnList = "token_hash")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_refresh_tokens_token_hash", columnNames = "token_hash")
})
@Getter
@Setter
public class RefreshToken extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_refresh_tokens_users"))
    private User user;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "is_revoked", nullable = false)
    private Boolean isRevoked = false;

    public RefreshToken() {
    }

    public RefreshToken(Long id, User user, String tokenHash, Instant expiresAt, Boolean isRevoked) {
        this.id = id;
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.isRevoked = isRevoked != null ? isRevoked : false;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private String tokenHash;
        private Instant expiresAt;
        private Boolean isRevoked = false;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder tokenHash(String tokenHash) { this.tokenHash = tokenHash; return this; }
        public Builder expiresAt(Instant expiresAt) { this.expiresAt = expiresAt; return this; }
        public Builder isRevoked(Boolean isRevoked) { this.isRevoked = isRevoked; return this; }

        public RefreshToken build() {
            return new RefreshToken(id, user, tokenHash, expiresAt, isRevoked);
        }
    }
}
