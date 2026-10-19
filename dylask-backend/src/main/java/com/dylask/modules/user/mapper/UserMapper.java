package com.dylask.modules.user.mapper;

import com.dylask.modules.user.dto.UserResponse;
import com.dylask.modules.user.dto.response.UserProfileResponse;
import com.dylask.modules.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;

/**
 * MapStruct Mapper chuyển đổi đối tượng User Entity sang các DTO phản hồi.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "aiTrialRemaining", expression = "java(calculateTrialRemaining(user))")
    UserResponse toResponse(User user);

    @Mapping(target = "aiTrialResetAt", expression = "java(calculateNextResetAt())")
    UserProfileResponse toProfileResponse(User user);

    default Integer calculateTrialRemaining(User user) {
        if (user == null || user.getAiTrialLimit() == null) {
            return 10;
        }
        int used = user.getAiTrialCount() != null ? user.getAiTrialCount() : 0;
        return Math.max(0, user.getAiTrialLimit() - used);
    }

    default Instant calculateNextResetAt() {
        return YearMonth.now(ZoneOffset.UTC)
                .plusMonths(1)
                .atDay(1)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);
    }
}

