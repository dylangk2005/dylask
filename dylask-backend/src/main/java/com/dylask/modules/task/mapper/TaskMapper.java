package com.dylask.modules.task.mapper;

import com.dylask.modules.task.dto.response.CalendarTaskDTO;
import com.dylask.modules.task.dto.response.TaskDetailDTO;
import com.dylask.modules.task.dto.response.TaskSummaryDTO;
import com.dylask.modules.task.entity.Task;
import com.dylask.modules.task.entity.TaskChecklist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct Mapper chuyển đổi giữa Task Entity và các Response DTOs.
 */
@Mapper(componentModel = "spring", uses = {TaskChecklistMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TaskMapper {

    @Mapping(target = "categoryName", expression = "java(task.getProject() != null ? task.getProject().getName() : null)")
    @Mapping(target = "totalChecklists", expression = "java(countTotalChecklists(task))")
    @Mapping(target = "completedChecklists", expression = "java(countCompletedChecklists(task))")
    @Mapping(target = "isRecurring", expression = "java(task.getRecurringPattern() != null && !task.getRecurringPattern().isBlank())")
    TaskSummaryDTO toSummaryDto(Task task);

    @Mapping(target = "categoryName", expression = "java(task.getProject() != null ? task.getProject().getName() : null)")
    @Mapping(target = "isRecurring", expression = "java(task.getRecurringPattern() != null && !task.getRecurringPattern().isBlank())")
    @Mapping(target = "checklists", source = "checklists")
    TaskDetailDTO toDetailDto(Task task);

    @Mapping(target = "categoryName", expression = "java(task.getProject() != null ? task.getProject().getName() : null)")
    @Mapping(target = "isRecurring", expression = "java(task.getRecurringPattern() != null && !task.getRecurringPattern().isBlank())")
    CalendarTaskDTO toCalendarDto(Task task);

    default Integer countTotalChecklists(Task task) {
        if (task == null || task.getChecklists() == null) {
            return 0;
        }
        return task.getChecklists().size();
    }

    default Integer countCompletedChecklists(Task task) {
        if (task == null || task.getChecklists() == null) {
            return 0;
        }
        int count = 0;
        for (TaskChecklist item : task.getChecklists()) {
            if (Boolean.TRUE.equals(item.getIsCompleted())) {
                count++;
            }
        }
        return count;
    }
}

