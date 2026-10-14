package com.dylask.common.exception;

import com.dylask.common.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Should handle AppException and return correct HTTP status and ErrorCode")
    void shouldHandleAppException() {
        AppException ex = new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy người dùng #1");

        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAppException(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals(404, response.getBody().getCode());
        assertEquals("RESOURCE_NOT_FOUND", response.getBody().getErrorCode());
        assertEquals("Không tìm thấy người dùng #1", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should handle generic unexpected exception with 500 status")
    void shouldHandleUncaughtException() {
        Exception ex = new RuntimeException("Lỗi bất ngờ");

        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleUncaughtException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals(500, response.getBody().getCode());
        assertEquals("INTERNAL_SERVER_ERROR", response.getBody().getErrorCode());
    }
}
