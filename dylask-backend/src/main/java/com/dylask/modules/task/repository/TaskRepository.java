package com.dylask.modules.task.repository;

import com.dylask.modules.task.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác truy vấn thực thể công việc (Task).
 * Hỗ trợ phân trang, lọc nâng cao qua JPA Specification.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    /**
     * Tìm công việc theo ID và ID người dùng sở hữu.
     * Đảm bảo tính bảo mật và phân quyền truy cập (Ownership).
     *
     * @param id ID công việc
     * @param userId ID người dùng
     * @return Optional chứa Task nếu tìm thấy
     */
    Optional<Task> findByIdAndUserId(Long id, Long userId);

    /**
     * Đếm số lượng công việc theo người dùng và trạng thái.
     *
     * @param userId ID người dùng
     * @param status Trạng thái ('todo' hoặc 'done')
     * @return Số lượng task
     */
    long countByUserIdAndStatus(Long userId, String status);

    /**
     * Lấy danh sách công việc có hạn hoàn thành nằm trong khoảng thời gian cho Calendar View.
     *
     * @param userId    ID người dùng
     * @param startDate Thời điểm bắt đầu khoảng lịch
     * @param endDate   Thời điểm kết thúc khoảng lịch
     * @return Danh sách công việc sắp xếp theo thời gian đến hạn tăng dần
     */
    List<Task> findByUserIdAndDueDateBetweenOrderByDueDateAsc(Long userId, Instant startDate, Instant endDate);

    /**
     * Lấy danh sách công việc đang nằm trong Kế hoạch hôm nay (My Day) theo ngày chỉ định.
     *
     * @param userId    ID người dùng
     * @param myDayDate Ngày dương lịch hiện tại
     * @return Danh sách công việc trong My Day
     */
    List<Task> findByUserIdAndIsMyDayTrueAndMyDayDateOrderByCreatedAtDesc(Long userId, LocalDate myDayDate);

    /**
     * Lấy danh sách công việc theo người dùng và trạng thái để lọc gợi ý thông minh cho My Day.
     *
     * @param userId ID người dùng
     * @param status Trạng thái ('todo')
     * @return Danh sách công việc chưa hoàn thành
     */
    List<Task> findByUserIdAndStatusOrderByDueDateAsc(Long userId, String status);

    /**
     * Lấy toàn bộ công việc của người dùng phục vụ tính toán thống kê & Streak cá nhân.
     *
     * @param userId ID người dùng
     * @return Danh sách công việc thuộc quyền sở hữu của người dùng
     */
    List<Task> findByUserId(Long userId);
}

