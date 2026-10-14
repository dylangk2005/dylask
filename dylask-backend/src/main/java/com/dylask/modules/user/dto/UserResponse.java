package com.dylask.modules.user.dto;

public record UserResponse(
    Long id,
    String email,
    String fullName,
    String avatarUrl,
    String defaultMode,
    Boolean isAiEnabled,
    Integer aiTrialRemaining
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String email;
        private String fullName;
        private String avatarUrl;
        private String defaultMode;
        private Boolean isAiEnabled;
        private Integer aiTrialRemaining;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Builder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }

        public Builder defaultMode(String defaultMode) {
            this.defaultMode = defaultMode;
            return this;
        }

        public Builder isAiEnabled(Boolean isAiEnabled) {
            this.isAiEnabled = isAiEnabled;
            return this;
        }

        public Builder aiTrialRemaining(Integer aiTrialRemaining) {
            this.aiTrialRemaining = aiTrialRemaining;
            return this;
        }

        public UserResponse build() {
            return new UserResponse(id, email, fullName, avatarUrl, defaultMode, isAiEnabled, aiTrialRemaining);
        }
    }
}
