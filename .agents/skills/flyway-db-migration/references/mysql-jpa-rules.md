# Chi Tiết Quy Chuẩn CSDL MySQL & JPA Entity Mapping

## 1. Bảng quy chuẩn kiểu dữ liệu
| Thuộc tính nghiệp vụ | Kiểu MySQL 8.4 | Kiểu Java (Spring Boot) | Ghi chú |
|---|---|---|---|
| Mã định danh (ID) | `BIGINT AUTO_INCREMENT` | `Long` | Khóa chính `@Id` |
| Chuỗi ngắn (Tên, Email) | `VARCHAR(255)` | `String` | Kèm `@Column(nullable = false)` |
| Văn bản dài (Ghi chú, Markdown) | `TEXT` hoặc `LONGTEXT` | `String` | Dùng `@Lob` hoặc `@Column(columnDefinition = "TEXT")` |
| Trạng thái / Cờ | `BOOLEAN` / `TINYINT(1)` | `Boolean` | Tên có tiền tố `is_` hoặc `has_` |
| Số nguyên (Story Points) | `INT` | `Integer` | |
| Số thực (Ước tính giờ) | `DECIMAL(5, 2)` | `BigDecimal` | Tránh dùng `Double` / `Float` cho tài chính/giờ chuẩn |
| Thời gian UTC | `TIMESTAMP` | `java.time.Instant` | Chuẩn ISO-8601 |
| Thời gian ngày | `DATE` | `java.time.LocalDate` | Cho hạn chót chỉ có ngày |

## 2. Mẫu JPA Entity chuẩn Dylask
```java
package com.dylask.modules.task.entity;

import com.dylask.common.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_tasks_project_id_status", columnList = "project_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "due_date")
    private Instant dueDate;

    // Quan hệ ManyToOne LUÔN LAZY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", foreignKey = @ForeignKey(name = "fk_tasks_projects"))
    private Project project;
}
```
