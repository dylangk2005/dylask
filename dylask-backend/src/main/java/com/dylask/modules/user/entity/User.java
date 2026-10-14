package com.dylask.modules.user.entity;

import com.dylask.common.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_users_email", columnNames = "email")
})
@Getter
@Setter
public class User extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "default_mode", nullable = false, length = 20)
    private String defaultMode = "standard";

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "is_ai_enabled", nullable = false)
    private Boolean isAiEnabled = false;

    @Column(name = "ai_trial_count", nullable = false)
    private Integer aiTrialCount = 0;

    @Column(name = "ai_trial_limit", nullable = false)
    private Integer aiTrialLimit = 10;

    @Column(name = "ai_provider", length = 50)
    private String aiProvider;

    @Column(name = "ai_api_key_encrypted", columnDefinition = "TEXT")
    private String aiApiKeyEncrypted;

    public User() {
    }

    public User(Long id, String email, String passwordHash, String fullName, String avatarUrl,
                String defaultMode, Boolean isVerified, Boolean isAiEnabled, Integer aiTrialCount, Integer aiTrialLimit,
                String aiProvider, String aiApiKeyEncrypted) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.defaultMode = defaultMode != null ? defaultMode : "standard";
        this.isVerified = isVerified != null ? isVerified : false;
        this.isAiEnabled = isAiEnabled != null ? isAiEnabled : false;
        this.aiTrialCount = aiTrialCount != null ? aiTrialCount : 0;
        this.aiTrialLimit = aiTrialLimit != null ? aiTrialLimit : 10;
        this.aiProvider = aiProvider;
        this.aiApiKeyEncrypted = aiApiKeyEncrypted;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String email;
        private String passwordHash;
        private String fullName;
        private String avatarUrl;
        private String defaultMode = "standard";
        private Boolean isVerified = false;
        private Boolean isAiEnabled = false;
        private Integer aiTrialCount = 0;
        private Integer aiTrialLimit = 10;
        private String aiProvider;
        private String aiApiKeyEncrypted;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public Builder defaultMode(String defaultMode) { this.defaultMode = defaultMode; return this; }
        public Builder isVerified(Boolean isVerified) { this.isVerified = isVerified; return this; }
        public Builder isAiEnabled(Boolean isAiEnabled) { this.isAiEnabled = isAiEnabled; return this; }
        public Builder aiTrialCount(Integer aiTrialCount) { this.aiTrialCount = aiTrialCount; return this; }
        public Builder aiTrialLimit(Integer aiTrialLimit) { this.aiTrialLimit = aiTrialLimit; return this; }
        public Builder aiProvider(String aiProvider) { this.aiProvider = aiProvider; return this; }
        public Builder aiApiKeyEncrypted(String aiApiKeyEncrypted) { this.aiApiKeyEncrypted = aiApiKeyEncrypted; return this; }

        public User build() {
            return new User(id, email, passwordHash, fullName, avatarUrl, defaultMode, isVerified, isAiEnabled, aiTrialCount, aiTrialLimit, aiProvider, aiApiKeyEncrypted);
        }
    }
}
