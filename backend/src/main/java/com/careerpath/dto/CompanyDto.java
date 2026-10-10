package com.careerpath.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class CompanyDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanyRequest {
        @NotBlank(message = "Company name is required")
        private String name;
        private String industry;
        private String location;
        private String website;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanyResponse {
        private Long id;
        private String name;
        private String industry;
        private String location;
        private String website;
        private String description;
        private int totalJobs;
        private LocalDateTime createdAt;
    }
}
