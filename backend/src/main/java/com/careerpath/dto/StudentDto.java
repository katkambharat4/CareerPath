package com.careerpath.dto;

import com.careerpath.entity.Proficiency;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class StudentDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillItem {
        private Long skillId;
        private String skillName;
        private Proficiency proficiency;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddSkillRequest {
        @NotBlank(message = "Skill name is required")
        private String skillName;
        private Proficiency proficiency;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileResponse {
        private Long id;
        private Long userId;
        private String email;
        private String name;
        private String phone;
        private String department;
        private BigDecimal cgpa;
        private Integer graduationYear;
        private String resumeUrl;
        private boolean active;
        private List<SkillItem> skills;
        private boolean placed;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateProfileRequest {
        @NotBlank(message = "Name is required")
        private String name;
        private String phone;
        private String department;

        @DecimalMin(value = "0.00", message = "CGPA cannot be negative")
        @DecimalMax(value = "10.00", message = "CGPA cannot exceed 10.00")
        private BigDecimal cgpa;

        private Integer graduationYear;
        private String resumeUrl;
    }
}
