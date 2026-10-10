package com.careerpath.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalStudents;
    private long activeStudents;
    private long totalCompanies;
    private long totalJobs;
    private long openJobs;
    private long totalApplications;
    private long totalPlacements;
    private double placementRatePercentage;
    private BigDecimal averagePackageLpa;
    private BigDecimal highestPackageLpa;
    private Map<String, Long> applicationsByStatus;
}
