package com.careerpath.dto;

import com.careerpath.entity.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class JobDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobRequest {
        @NotNull(message = "Company ID is required")
        private Long companyId;

        @NotBlank(message = "Job title is required")
        private String title;

        private String description;
        private String requiredSkills;
        private BigDecimal minCgpa;
        private BigDecimal packageLpa;
        private String location;
        private LocalDateTime deadline;
        private JobStatus status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class JobResponse {
        private Long id;
        private Long companyId;
        private String companyName;
        private String companyLocation;
        private String title;
        private String description;
        private String requiredSkills;
        private BigDecimal minCgpa;
        private BigDecimal packageLpa;
        private String location;
        private LocalDateTime deadline;
        private JobStatus status;
        private boolean eligible;
        private String eligibilityReason;
        private boolean alreadyApplied;
        private int totalApplications;
        private LocalDateTime createdAt;
    }
}
