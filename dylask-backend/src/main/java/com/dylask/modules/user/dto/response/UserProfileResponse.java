package com.dylask.modules.user.dto.response;

import java.time.Instant;

/**
 * DTO phản hồi thông tin chi tiết hồ sơ người dùng.
 *
 * @param id Định danh người dùng
 * @param email Địa chỉ email
 * @param fullName Họ và tên
 * @param avatarUrl Đường dẫn ảnh đại diện
 * @param defaultMode Chế độ giao diện mặc định ('standard' hoặc 'developer')
 * @param isAiEnabled Trạng thái kích hoạt trợ lý AI
 * @param aiTrialCount Số lượt gọi AI dùng thử đã sử dụng trong tháng
 * @param aiTrialLimit Tổng số lượt gọi AI dùng thử được cấp trong tháng (10 lượt)
 * @param aiTrialResetAt Thời điểm đặt lại lượt AI dùng thử (ngày 1 tháng kế tiếp)
 * @param createdAt Thời điểm tạo tài khoản
 */
public record UserProfileResponse(
        Long id,
        String email,
        String fullName,
        String avatarUrl,
        String defaultMode,
        Boolean isAiEnabled,
        Integer aiTrialCount,
        Integer aiTrialLimit,
        Instant aiTrialResetAt,
        Instant createdAt
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
        private Integer aiTrialCount;
        private Integer aiTrialLimit;
        private Instant aiTrialResetAt;
        private Instant createdAt;

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

        public Builder aiTrialCount(Integer aiTrialCount) {
            this.aiTrialCount = aiTrialCount;
            return this;
        }

        public Builder aiTrialLimit(Integer aiTrialLimit) {
            this.aiTrialLimit = aiTrialLimit;
            return this;
        }

        public Builder aiTrialResetAt(Instant aiTrialResetAt) {
            this.aiTrialResetAt = aiTrialResetAt;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserProfileResponse build() {
            return new UserProfileResponse(
                    id, email, fullName, avatarUrl, defaultMode,
                    isAiEnabled, aiTrialCount, aiTrialLimit, aiTrialResetAt, createdAt
            );
        }
    }
}
