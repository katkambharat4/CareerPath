package com.careerpath.service.impl;

import com.careerpath.dto.DashboardStatsDto;
import com.careerpath.dto.PageResponse;
import com.careerpath.dto.PlacementDto;
import com.careerpath.entity.*;
import com.careerpath.exception.ConflictException;
import com.careerpath.exception.ResourceNotFoundException;
import com.careerpath.repository.*;
import com.careerpath.service.PlacementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlacementServiceImpl implements PlacementService {

    private final PlacementRepository placementRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional
    public PlacementDto.PlacementResponse recordPlacement(PlacementDto.RecordPlacementRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        // Enforce Decision: One final placement per student
        if (placementRepository.existsByStudentId(student.getId())) {
            throw new ConflictException("Student already has a recorded final placement. Only one final placement per student is permitted.");
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.getCompanyId()));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + request.getJobId()));

        Placement placement = Placement.builder()
                .student(student)
                .company(company)
                .job(job)
                .packageLpa(request.getPackageLpa())
                .joiningDate(request.getJoiningDate())
                .placedDate(request.getPlacedDate())
                .build();

        Placement saved = placementRepository.save(placement);

        // Also mark corresponding application as SELECTED if exists
        applicationRepository.findByStudentIdAndJobId(student.getId(), job.getId())
                .ifPresent(app -> {
                    app.setStatus(ApplicationStatus.SELECTED);
                    applicationRepository.save(app);
                });

        return mapToPlacementResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PlacementDto.PlacementResponse getPlacementByStudentId(Long studentId) {
        Placement placement = placementRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Placement record not found for student ID: " + studentId));
        return mapToPlacementResponse(placement);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PlacementDto.PlacementResponse> getAllPlacements(String query, Pageable pageable) {
        Page<Placement> page = placementRepository.searchPlacements(query, pageable);
        List<PlacementDto.PlacementResponse> content = page.getContent().stream()
                .map(this::mapToPlacementResponse)
                .collect(Collectors.toList());

        return PageResponse.<PlacementDto.PlacementResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.countByActiveTrue();
        long totalCompanies = companyRepository.count();
        long totalJobs = jobRepository.count();
        long openJobs = jobRepository.countByStatus(JobStatus.OPEN);
        long totalApplications = applicationRepository.count();
        long totalPlacements = placementRepository.count();

        double placementRate = totalStudents > 0
                ? Math.round(((double) totalPlacements / totalStudents * 100.0) * 10.0) / 10.0
                : 0.0;

        BigDecimal avgPackage = placementRepository.findAveragePackage();
        if (avgPackage != null) {
            avgPackage = avgPackage.setScale(2, RoundingMode.HALF_UP);
        } else {
            avgPackage = BigDecimal.ZERO;
        }

        BigDecimal highestPackage = placementRepository.findHighestPackage();
        if (highestPackage == null) {
            highestPackage = BigDecimal.ZERO;
        }

        Map<String, Long> statusCounts = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            statusCounts.put(status.name(), applicationRepository.countByStatus(status));
        }

        return DashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .activeStudents(activeStudents)
                .totalCompanies(totalCompanies)
                .totalJobs(totalJobs)
                .openJobs(openJobs)
                .totalApplications(totalApplications)
                .totalPlacements(totalPlacements)
                .placementRatePercentage(placementRate)
                .averagePackageLpa(avgPackage)
                .highestPackageLpa(highestPackage)
                .applicationsByStatus(statusCounts)
                .build();
    }

    private PlacementDto.PlacementResponse mapToPlacementResponse(Placement p) {
        return PlacementDto.PlacementResponse.builder()
                .id(p.getId())
                .studentId(p.getStudent().getId())
                .studentName(p.getStudent().getName())
                .studentEmail(p.getStudent().getUser().getEmail())
                .department(p.getStudent().getDepartment())
                .companyId(p.getCompany().getId())
                .companyName(p.getCompany().getName())
                .jobId(p.getJob().getId())
                .jobTitle(p.getJob().getTitle())
                .packageLpa(p.getPackageLpa())
                .joiningDate(p.getJoiningDate())
                .placedDate(p.getPlacedDate())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
