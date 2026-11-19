package com.dylask.modules.analytics.personal.dto;

/**
 * DTO tỷ trọng công việc theo từng danh mục.
 */
public record CategoryShareDTO(
        Long categoryId,
        String name,
        String color,
        long taskCount,
        double percentage
) {
}
