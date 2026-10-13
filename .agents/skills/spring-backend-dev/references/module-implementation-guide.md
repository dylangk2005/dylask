# Hướng Dẫn Chi Tiết Triển Khai Module Backend (Spring Boot 4 / Java 25)

Tài liệu này cung cấp mã nguồn mẫu chuẩn (production-ready) cho từng tầng trong kiến trúc **Modular Monolith** của Dylask.

---

## 1. Tầng Entity (`entity/`)
- Kế thừa từ `BaseAuditEntity` (`id`, `createdAt`, `updatedAt`).
- Bắt buộc `fetch = FetchType.LAZY` cho quan hệ `@ManyToOne` và `@OneToOne`.
- Dùng `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`. **Cấm dùng `@Data`**.

```java
package com.dylask.modules.task.entity;

import com.dylask.common.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_tasks_project_id_status", columnList = "project_id, status"),
    @Index(name = "idx_tasks_due_date", columnList = "due_date")
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
    private String status; // 'todo', 'in_progress', 'in_review', 'done'

    @Column(name = "priority", nullable = false, length = 20)
    @Builder.Default
    private String priority = "medium"; // 'low', 'medium', 'high', 'urgent'

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "user_id", nullable = false)
    private Long userId; // Assignee / Creator
}
```

---

## 2. Tầng DTO (`dto/`)
DTO được phân tách rõ ràng thành `request/` và `response/`. Dùng Java Record hoặc class có Lombok kết hợp Bean Validation (`jakarta.validation.constraints`).

### 2.1. Request DTO (`dto/request/CreateTaskRequest.java`)
```java
package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import java.time.Instant;

@Builder
public record CreateTaskRequest(
    @NotBlank(message = "Tiêu đề công việc không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    String title,

    String description,

    String priority,

    Integer storyPoints,

    Instant dueDate,

    @NotNull(message = "Project ID không được để trống")
    Long projectId
) {}
```

### 2.2. Response DTO (`dto/response/TaskResponse.java`)
```java
package com.dylask.modules.task.dto.response;

import lombok.Builder;
import java.time.Instant;

@Builder
public record TaskResponse(
    Long id,
    String title,
    String description,
    String status,
    String priority,
    Integer storyPoints,
    Instant dueDate,
    Long projectId,
    Long userId,
    Instant createdAt,
    Instant updatedAt
) {}
```

---

## 3. Tầng Mapper (`mapper/`)
Sử dụng MapStruct phiên bản 1.6.x tương thích Java 25:
- Khai báo `@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)`.
- Sử dụng `@MappingTarget` cho các hàm cập nhật Entity từ Request.

```java
package com.dylask.modules.task.mapper;

import com.dylask.modules.task.dto.request.CreateTaskRequest;
import com.dylask.modules.task.dto.request.UpdateTaskRequest;
import com.dylask.modules.task.dto.response.TaskResponse;
import com.dylask.modules.task.entity.Task;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TaskMapper {

    Task toEntity(CreateTaskRequest request);

    TaskResponse toResponse(Task task);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(UpdateTaskRequest request, @MappingTarget Task task);
}
```

---

## 4. Tầng Repository (`repository/`)
Kế thừa `JpaRepository<Task, Long>` và `JpaSpecificationExecutor<Task>` nếu cần lọc động.

```java
package com.dylask.modules.task.repository;

import com.dylask.modules.task.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    Page<Task> findByUserIdAndStatus(Long userId, String status, Pageable pageable);

    boolean existsByIdAndUserId(Long id, Long userId);
}
```

---

## 5. Tầng Service (`service/`)
Luôn tách biệt `interface` và `impl`. Class ServiceImpl được đánh dấu `@Transactional(readOnly = true)` ở mức class.

### 5.1. Interface (`service/TaskService.java`)
```java
package com.dylask.modules.task.service;

import com.dylask.modules.task.dto.request.CreateTaskRequest;
import com.dylask.modules.task.dto.request.UpdateTaskRequest;
import com.dylask.modules.task.dto.response.TaskResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    TaskResponse createTask(Long currentUserId, CreateTaskRequest request);
    TaskResponse getTaskById(Long currentUserId, Long taskId);
    Page<TaskResponse> getTasksByUser(Long currentUserId, String status, Pageable pageable);
    TaskResponse updateTask(Long currentUserId, Long taskId, UpdateTaskRequest request);
    void deleteTask(Long currentUserId, Long taskId);
}
```

### 5.2. Service Implementation (`service/impl/TaskServiceImpl.java`)
```java
package com.dylask.modules.task.service.impl;

import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.task.dto.request.CreateTaskRequest;
import com.dylask.modules.task.dto.request.UpdateTaskRequest;
import com.dylask.modules.task.dto.response.TaskResponse;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.mapper.TaskMapper;
import com.dylask.modules.task.repository.TaskRepository;
import com.dylask.modules.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    @Override
    @Transactional
    public TaskResponse createTask(Long currentUserId, CreateTaskRequest request) {
        log.info("Creating new task for user: {}, title: {}", currentUserId, request.title());

        Task task = taskMapper.toEntity(request);
        task.setUserId(currentUserId);
        task.setStatus("todo");

        Task savedTask = taskRepository.save(task);
        log.info("Task created successfully with ID: {}", savedTask.getId());
        return taskMapper.toResponse(savedTask);
    }

    @Override
    public TaskResponse getTaskById(Long currentUserId, Long taskId) {
        Task task = findTaskAndVerifyOwner(currentUserId, taskId);
        return taskMapper.toResponse(task);
    }

    @Override
    public Page<TaskResponse> getTasksByUser(Long currentUserId, String status, Pageable pageable) {
        Page<Task> tasks = (status != null && !status.isBlank())
                ? taskRepository.findByUserIdAndStatus(currentUserId, status, pageable)
                : taskRepository.findAll(pageable);
        return tasks.map(taskMapper::toResponse);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long currentUserId, Long taskId, UpdateTaskRequest request) {
        log.info("Updating task ID: {} for user: {}", taskId, currentUserId);
        Task task = findTaskAndVerifyOwner(currentUserId, taskId);

        taskMapper.updateEntityFromRequest(request, task);
        Task updatedTask = taskRepository.save(task);
        return taskMapper.toResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long currentUserId, Long taskId) {
        log.info("Deleting task ID: {} for user: {}", taskId, currentUserId);
        Task task = findTaskAndVerifyOwner(currentUserId, taskId);
        taskRepository.delete(task);
    }

    private Task findTaskAndVerifyOwner(Long currentUserId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy công việc với ID: " + taskId));

        if (!task.getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên công việc này");
        }
        return task;
    }
}
```

---

## 6. Tầng REST Controller (`controller/`)
- Đường dẫn chuẩn RESTful: `/api/v1/tasks`.
- Mọi phương thức trả về `ApiResponse<T>`.

```java
package com.dylask.modules.task.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.dto.PageResponse;
import com.dylask.modules.task.dto.request.CreateTaskRequest;
import com.dylask.modules.task.dto.request.UpdateTaskRequest;
import com.dylask.modules.task.dto.response.TaskResponse;
import com.dylask.modules.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @RequestAttribute("currentUserId") Long currentUserId,
            @Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Tạo công việc thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @RequestAttribute("currentUserId") Long currentUserId,
            @PathVariable("id") Long id) {
        TaskResponse response = taskService.getTaskById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(response, "Lấy thông tin công việc thành công"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TaskResponse>>> getTasks(
            @RequestAttribute("currentUserId") Long currentUserId,
            @RequestParam(value = "status", required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TaskResponse> page = taskService.getTasksByUser(currentUserId, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page), "Lấy danh sách công việc thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @RequestAttribute("currentUserId") Long currentUserId,
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        TaskResponse response = taskService.updateTask(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "Cập nhật công việc thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @RequestAttribute("currentUserId") Long currentUserId,
            @PathVariable("id") Long id) {
        taskService.deleteTask(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa công việc thành công"));
    }
}
```
