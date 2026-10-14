package com.dylask.common.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    @DisplayName("Should create success OK response with data and message")
    void shouldCreateOkResponse() {
        ApiResponse<String> response = ApiResponse.ok("Hello Dylask", "Thành công");

        assertTrue(response.isSuccess());
        assertEquals(200, response.getCode());
        assertEquals("Hello Dylask", response.getData());
        assertEquals("Thành công", response.getMessage());
        assertNotNull(response.getTimestamp());
        assertNull(response.getErrorCode());
        assertNull(response.getErrors());
    }

    @Test
    @DisplayName("Should create success CREATED response")
    void shouldCreateCreatedResponse() {
        ApiResponse<Long> response = ApiResponse.created(101L, "Tạo thành công");

        assertTrue(response.isSuccess());
        assertEquals(201, response.getCode());
        assertEquals(101L, response.getData());
        assertEquals("Tạo thành công", response.getMessage());
    }

    @Test
    @DisplayName("Should create error response with errorCode and message")
    void shouldCreateErrorResponse() {
        ApiResponse<Void> response = ApiResponse.error(404, "NOT_FOUND", "Không tìm thấy dữ liệu");

        assertFalse(response.isSuccess());
        assertEquals(404, response.getCode());
        assertEquals("NOT_FOUND", response.getErrorCode());
        assertEquals("Không tìm thấy dữ liệu", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    @DisplayName("Should correctly hold field validation errors in FieldErrorDTO")
    void shouldHoldFieldErrors() {
        FieldErrorDTO fieldError = FieldErrorDTO.builder()
                .field("email")
                .message("Email không đúng định dạng")
                .rejectedValue("invalid-email")
                .build();

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .code(400)
                .errorCode("VALIDATION_FAILED")
                .message("Lỗi dữ liệu")
                .errors(List.of(fieldError))
                .build();

        assertFalse(response.isSuccess());
        assertNotNull(response.getErrors());
        assertEquals(1, response.getErrors().size());
        assertEquals("email", response.getErrors().getFirst().getField());
    }
}
