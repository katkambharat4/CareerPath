package com.careerpath.dto;

import com.careerpath.entity.ApplicationStatus;
import com.careerpath.entity.InterviewMode;
import com.careerpath.entity.InterviewStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ApplicationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InterviewDto {
        private Long id;
        private Long applicationId;
        private LocalDateTime interviewDate;
        private InterviewMode mode;
        private String locationOrLink;
        private String roundName;
        private InterviewStatus status;
        private String feedback;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScheduleInterviewRequest {
        @NotNull(message = "Interview date is required")
        private LocalDateTime interviewDate;

        private InterviewMode mode;
        private String locationOrLink;

        @NotBlank(message = "Round name is required (e.g., Technical 1, HR)")
        private String roundName;

        private String feedback;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateApplicationStatusRequest {
        @NotNull(message = "Status is required")
        private ApplicationStatus status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationResponse {
        private Long id;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private String department;
        private BigDecimal studentCgpa;
        private String resumeUrl;
        private Long jobId;
        private String jobTitle;
        private Long companyId;
        private String companyName;
        private BigDecimal packageLpa;
        private ApplicationStatus status;
        private LocalDateTime appliedAt;
        private List<InterviewDto> interviews;
    }
}
