package com.dylask.modules.project.repository;

import com.dylask.modules.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy xuất dữ liệu danh mục/dự án của người dùng.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Tìm danh mục theo ID người dùng, chế độ hoạt động và tên danh mục.
     *
     * @param userId ID người dùng
     * @param modeType Chế độ ('standard' hoặc 'developer')
     * @param name Tên danh mục / dự án
     * @return Optional chứa Project nếu tìm thấy
     */
    Optional<Project> findByUserIdAndModeTypeAndName(Long userId, String modeType, String name);

    /**
     * Lấy tất cả danh mục của người dùng theo chế độ.
     *
     * @param userId ID người dùng
     * @param modeType Chế độ ('standard' hoặc 'developer')
     * @return Danh sách các Project
     */
    List<Project> findAllByUserIdAndModeType(Long userId, String modeType);
}

