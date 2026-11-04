package com.dylask.modules.task.mapper;

import com.dylask.modules.task.dto.response.ChecklistItemDTO;
import com.dylask.modules.task.entity.TaskChecklist;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct Mapper chuyển đổi giữa TaskChecklist Entity và ChecklistItemDTO.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TaskChecklistMapper {

    ChecklistItemDTO toDto(TaskChecklist checklist);

    List<ChecklistItemDTO> toDtoList(List<TaskChecklist> checklists);
}

