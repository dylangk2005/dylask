package com.dylask.modules.task.repository;

import com.dylask.modules.task.entity.TaskChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác các mục danh sách kiểm tra con (TaskChecklist).
 */
@Repository
public interface TaskChecklistRepository extends JpaRepository<TaskChecklist, Long> {

    /**
     * Lấy toàn bộ danh sách kiểm tra con của một task, sắp xếp theo thứ tự vị trí tăng dần.
     *
     * @param taskId ID công việc cha
     * @return Danh sách các TaskChecklist
     */
    List<TaskChecklist> findByTaskIdOrderByPositionAscIdAsc(Long taskId);

    /**
     * Tìm mục checklist theo ID và ID công việc cha.
     *
     * @param id ID mục checklist
     * @param taskId ID công việc cha
     * @return Optional chứa TaskChecklist nếu tìm thấy
     */
    Optional<TaskChecklist> findByIdAndTaskId(Long id, Long taskId);

    /**
     * Đếm số lượng checklist con hiện có của một task (phục vụ giới hạn tối đa 50 items).
     *
     * @param taskId ID công việc cha
     * @return Số lượng mục checklist
     */
    int countByTaskId(Long taskId);
}

