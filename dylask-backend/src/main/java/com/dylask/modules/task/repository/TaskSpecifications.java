package com.dylask.modules.task.repository;

import com.dylask.modules.task.entity.Task;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications động phục vụ tìm kiếm, phân loại và lọc công việc.
 */
public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    /**
     * Tạo bộ đặc tả Specification động theo các tiêu chí bộ lọc của người dùng.
     *
     * @param userId ID người dùng bắt buộc
     * @param mode Chế độ ('standard' hoặc 'developer')
     * @param category Tên danh mục (Học tập, Công việc, Cá nhân...)
     * @param filter Bộ lọc đặc thù: 'today', 'upcoming', 'overdue'
     * @param search Từ khóa tìm kiếm theo tiêu đề công việc
     * @param status Trạng thái cụ thể ('todo' hoặc 'done')
     * @return Specification<Task>
     */
    public static Specification<Task> buildFilter(
            Long userId,
            String mode,
            String category,
            String filter,
            String search,
            String status) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Luôn bảo vệ phân quyền theo userId
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            // 2. Lọc theo mode nếu có
            if (mode != null && !mode.isBlank()) {
                predicates.add(cb.equal(root.get("project").get("modeType"), mode.trim().toLowerCase()));
            }

            // 3. Lọc theo tên danh mục (Category)
            if (category != null && !category.isBlank() && !"Tất cả".equalsIgnoreCase(category.trim())) {
                predicates.add(cb.equal(root.get("project").get("name"), category.trim()));
            }

            // 4. Lọc theo trạng thái status
            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toLowerCase()));
            }

            // 5. Tìm kiếm theo từ khóa tiêu đề (không phân biệt hoa thường)
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("title")), pattern));
            }

            // 6. Lọc theo mốc thời gian đặc thù
            Instant now = Instant.now();
            if ("today".equalsIgnoreCase(filter)) {
                Instant startOfDay = now.truncatedTo(ChronoUnit.DAYS);
                Instant endOfDay = startOfDay.plus(1, ChronoUnit.DAYS);
                predicates.add(cb.between(root.get("dueDate"), startOfDay, endOfDay));
            } else if ("upcoming".equalsIgnoreCase(filter)) {
                Instant in7Days = now.plus(7, ChronoUnit.DAYS);
                predicates.add(cb.between(root.get("dueDate"), now, in7Days));
            } else if ("overdue".equalsIgnoreCase(filter)) {
                predicates.add(cb.lessThan(root.get("dueDate"), now));
                predicates.add(cb.notEqual(root.get("status"), "done"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

