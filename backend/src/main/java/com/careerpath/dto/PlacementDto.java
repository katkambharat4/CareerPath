package com.careerpath.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PlacementDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecordPlacementRequest {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Company ID is required")
        private Long companyId;

        @NotNull(message = "Job ID is required")
        private Long jobId;

        @NotNull(message = "Package LPA is required")
        private BigDecimal packageLpa;

        private LocalDate joiningDate;

        @NotNull(message = "Placed date is required")
        private LocalDate placedDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlacementResponse {
        private Long id;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private String department;
        private Long companyId;
        private String companyName;
        private Long jobId;
        private String jobTitle;
        private BigDecimal packageLpa;
        private LocalDate joiningDate;
        private LocalDate placedDate;
        private LocalDateTime createdAt;
    }
}
