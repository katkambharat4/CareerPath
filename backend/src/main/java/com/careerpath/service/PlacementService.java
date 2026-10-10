package com.careerpath.service;

import com.careerpath.dto.DashboardStatsDto;
import com.careerpath.dto.PageResponse;
import com.careerpath.dto.PlacementDto;
import org.springframework.data.domain.Pageable;

public interface PlacementService {
    PlacementDto.PlacementResponse recordPlacement(PlacementDto.RecordPlacementRequest request);
    PlacementDto.PlacementResponse getPlacementByStudentId(Long studentId);
    PageResponse<PlacementDto.PlacementResponse> getAllPlacements(String query, Pageable pageable);
    DashboardStatsDto getDashboardStats();
}
