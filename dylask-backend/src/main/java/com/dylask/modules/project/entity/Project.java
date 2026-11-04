package com.dylask.modules.project.entity;

import com.dylask.common.entity.BaseAuditEntity;
import com.dylask.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Thực thể Dự án / Danh mục công việc.
 * Phục vụ cả Standard Mode (Danh mục: Cá nhân, Học tập, Công việc...)
 * và Developer Mode (Dự án Git, Sprint Board...).
 */
@Entity
@Table(name = "projects", indexes = {
    @Index(name = "idx_projects_user_mode", columnList = "user_id, mode_type")
})
@Getter
@Setter
public class Project extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "mode_type", nullable = false, length = 20)
    private String modeType = "standard";

    @Column(name = "git_repo_url", length = 500)
    private String gitRepoUrl;

    @Column(name = "is_ai_enabled", nullable = false)
    private Boolean isAiEnabled = true;

    public Project() {
    }

    public Project(Long id, User user, String name, String description, String modeType, String gitRepoUrl, Boolean isAiEnabled) {
        this.id = id;
        this.user = user;
        this.name = name;
        this.description = description;
        this.modeType = modeType != null ? modeType : "standard";
        this.gitRepoUrl = gitRepoUrl;
        this.isAiEnabled = isAiEnabled != null ? isAiEnabled : true;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private String name;
        private String description;
        private String modeType = "standard";
        private String gitRepoUrl;
        private Boolean isAiEnabled = true;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder modeType(String modeType) {
            this.modeType = modeType;
            return this;
        }

        public Builder gitRepoUrl(String gitRepoUrl) {
            this.gitRepoUrl = gitRepoUrl;
            return this;
        }

        public Builder isAiEnabled(Boolean isAiEnabled) {
            this.isAiEnabled = isAiEnabled;
            return this;
        }

        public Project build() {
            return new Project(id, user, name, description, modeType, gitRepoUrl, isAiEnabled);
        }
    }
}

