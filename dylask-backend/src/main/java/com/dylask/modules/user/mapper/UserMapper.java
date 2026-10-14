package com.dylask.modules.user.mapper;

import com.dylask.modules.user.dto.UserResponse;
import com.dylask.modules.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "aiTrialRemaining", expression = "java(calculateTrialRemaining(user))")
    UserResponse toResponse(User user);

    default Integer calculateTrialRemaining(User user) {
        if (user == null || user.getAiTrialLimit() == null) {
            return 10;
        }
        int used = user.getAiTrialCount() != null ? user.getAiTrialCount() : 0;
        return Math.max(0, user.getAiTrialLimit() - used);
    }
}
