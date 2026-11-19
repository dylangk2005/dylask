package com.dylask.modules.planning.repository;

import com.dylask.modules.planning.entity.WeeklyGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác với mục tiêu trọng tâm tuần (WeeklyGoal).
 */
@Repository
public interface WeeklyGoalRepository extends JpaRepository<WeeklyGoal, Long> {

    List<WeeklyGoal> findByUserIdAndYearAndWeekNumberOrderByIdAsc(Long userId, Integer year, Integer weekNumber);

    Optional<WeeklyGoal> findByIdAndUserId(Long id, Long userId);
}
