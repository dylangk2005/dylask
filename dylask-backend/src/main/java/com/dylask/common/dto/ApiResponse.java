package com.dylask.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private int code;
    private String errorCode;
    private String message;
    private T data;
    private List<FieldErrorDTO> errors;
    private String timestamp;

    public ApiResponse() {
        this.timestamp = Instant.now().toString();
    }

    public ApiResponse(boolean success, int code, String errorCode, String message, T data, List<FieldErrorDTO> errors, String timestamp) {
        this.success = success;
        this.code = code;
        this.errorCode = errorCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
        this.timestamp = timestamp != null ? timestamp : Instant.now().toString();
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(201)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .errorCode(errorCode)
                .message(message)
                .build();
    }

    public static <T> Builder<T> builder() {
        return new Builder<>();
    }

    public static class Builder<T> {
        private boolean success;
        private int code;
        private String errorCode;
        private String message;
        private T data;
        private List<FieldErrorDTO> errors;
        private String timestamp = Instant.now().toString();

        public Builder<T> success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder<T> code(int code) {
            this.code = code;
            return this;
        }

        public Builder<T> errorCode(String errorCode) {
            this.errorCode = errorCode;
            return this;
        }

        public Builder<T> message(String message) {
            this.message = message;
            return this;
        }

        public Builder<T> data(T data) {
            this.data = data;
            return this;
        }

        public Builder<T> errors(List<FieldErrorDTO> errors) {
            this.errors = errors;
            return this;
        }

        public Builder<T> timestamp(String timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public ApiResponse<T> build() {
            return new ApiResponse<>(success, code, errorCode, message, data, errors, timestamp);
        }
    }
}
