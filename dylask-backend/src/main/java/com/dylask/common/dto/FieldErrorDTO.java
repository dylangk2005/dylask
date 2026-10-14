package com.dylask.common.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FieldErrorDTO {
    private String field;
    private String message;
    private Object rejectedValue;

    public FieldErrorDTO() {
    }

    public FieldErrorDTO(String field, String message, Object rejectedValue) {
        this.field = field;
        this.message = message;
        this.rejectedValue = rejectedValue;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String field;
        private String message;
        private Object rejectedValue;

        public Builder field(String field) {
            this.field = field;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder rejectedValue(Object rejectedValue) {
            this.rejectedValue = rejectedValue;
            return this;
        }

        public FieldErrorDTO build() {
            return new FieldErrorDTO(field, message, rejectedValue);
        }
    }
}
