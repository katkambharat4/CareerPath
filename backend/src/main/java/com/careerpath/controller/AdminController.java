package com.careerpath.controller;

import com.careerpath.dto.*;
import com.careerpath.entity.ApplicationStatus;
import com.careerpath.entity.JobStatus;
import com.careerpath.service.ApplicationService;
import com.careerpath.service.CompanyService;
import com.careerpath.service.JobService;
import com.careerpath.service.PlacementService;
import com.careerpath.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Endpoints accessible by placement cell administrators")
public class AdminController {

    private final StudentService studentService;
    private final CompanyService companyService;
    private final JobService jobService;
    private final ApplicationService applicationService;
    private final PlacementService placementService;

    // --- DASHBOARD ---
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(placementService.getDashboardStats()));
    }

    // --- STUDENTS ---
    @GetMapping("/students")
    @Operation(summary = "Search and list students")
    public ResponseEntity<ApiResponse<PageResponse<StudentDto.ProfileResponse>>> getStudents(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        PageResponse<StudentDto.ProfileResponse> response = studentService.getAllStudents(query, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/students/{id}")
    @Operation(summary = "Get student profile by ID")
    public ResponseEntity<ApiResponse<StudentDto.ProfileResponse>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getProfileById(id)));
    }

    @PatchMapping("/students/{id}/status")
    @Operation(summary = "Activate or deactivate student")
    public ResponseEntity<ApiResponse<Void>> updateStudentStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        studentService.updateStudentStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success(null, "Student status updated"));
    }

    // --- COMPANIES ---
    @GetMapping("/companies")
    @Operation(summary = "List companies paginated")
    public ResponseEntity<ApiResponse<PageResponse<CompanyDto.CompanyResponse>>> getCompanies(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        PageResponse<CompanyDto.CompanyResponse> response = companyService.getAllCompanies(query, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/companies/all")
    @Operation(summary = "List all companies dropdown")
    public ResponseEntity<ApiResponse<List<CompanyDto.CompanyResponse>>> getAllCompaniesDropdown() {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllCompaniesList()));
    }

    @PostMapping("/companies")
    @Operation(summary = "Create company")
    public ResponseEntity<ApiResponse<CompanyDto.CompanyResponse>> createCompany(
            @Valid @RequestBody CompanyDto.CompanyRequest request
    ) {
        CompanyDto.CompanyResponse response = companyService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Company created successfully"));
    }

    @PutMapping("/companies/{id}")
    @Operation(summary = "Update company")
    public ResponseEntity<ApiResponse<CompanyDto.CompanyResponse>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyDto.CompanyRequest request
    ) {
        CompanyDto.CompanyResponse response = companyService.updateCompany(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Company updated successfully"));
    }

    @DeleteMapping("/companies/{id}")
    @Operation(summary = "Delete company")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Company deleted successfully"));
    }

    // --- JOBS ---
    @GetMapping("/jobs")
    @Operation(summary = "List jobs paginated")
    public ResponseEntity<ApiResponse<PageResponse<JobDto.JobResponse>>> getJobs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        PageResponse<JobDto.JobResponse> response = jobService.getAllJobsAdmin(query, status, companyId, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/jobs/open")
    @Operation(summary = "List all open jobs dropdown")
    public ResponseEntity<ApiResponse<List<JobDto.JobResponse>>> getOpenJobsList() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getOpenJobsList()));
    }

    @PostMapping("/jobs")
    @Operation(summary = "Create job drive")
    public ResponseEntity<ApiResponse<JobDto.JobResponse>> createJob(@Valid @RequestBody JobDto.JobRequest request) {
        JobDto.JobResponse response = jobService.createJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Job posted successfully"));
    }

    @PutMapping("/jobs/{id}")
    @Operation(summary = "Update job drive")
    public ResponseEntity<ApiResponse<JobDto.JobResponse>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobDto.JobRequest request
    ) {
        JobDto.JobResponse response = jobService.updateJob(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Job updated successfully"));
    }

    @PatchMapping("/jobs/{id}/status")
    @Operation(summary = "Open or close job")
    public ResponseEntity<ApiResponse<JobDto.JobResponse>> updateJobStatus(
            @PathVariable Long id,
            @RequestParam JobStatus status
    ) {
        JobDto.JobResponse response = jobService.updateJobStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Job status changed to " + status));
    }

    @DeleteMapping("/jobs/{id}")
    @Operation(summary = "Delete job drive")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Job deleted successfully"));
    }

    // --- APPLICATIONS & INTERVIEWS ---
    @GetMapping("/applications")
    @Operation(summary = "List all student applications")
    public ResponseEntity<ApiResponse<PageResponse<ApplicationDto.ApplicationResponse>>> getApplications(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        PageResponse<ApplicationDto.ApplicationResponse> response = applicationService.getAllApplicationsAdmin(
                query, status, jobId, companyId, PageRequest.of(page, size, sort)
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/applications/{id}/status")
    @Operation(summary = "Update application status (SHORTLISTED, REJECTED, SELECTED)")
    public ResponseEntity<ApiResponse<ApplicationDto.ApplicationResponse>> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationDto.UpdateApplicationStatusRequest request
    ) {
        ApplicationDto.ApplicationResponse response = applicationService.updateApplicationStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(response, "Application marked as " + request.getStatus()));
    }

    @PostMapping("/applications/{id}/interviews")
    @Operation(summary = "Schedule interview round")
    public ResponseEntity<ApiResponse<ApplicationDto.InterviewDto>> scheduleInterview(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationDto.ScheduleInterviewRequest request
    ) {
        ApplicationDto.InterviewDto response = applicationService.scheduleInterview(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Interview scheduled successfully"));
    }

    // --- PLACEMENTS ---
    @GetMapping("/placements")
    @Operation(summary = "List placements paginated")
    public ResponseEntity<ApiResponse<PageResponse<PlacementDto.PlacementResponse>>> getPlacements(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "placedDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        PageResponse<PlacementDto.PlacementResponse> response = placementService.getAllPlacements(query, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/placements")
    @Operation(summary = "Record final placement for student")
    public ResponseEntity<ApiResponse<PlacementDto.PlacementResponse>> recordPlacement(
            @Valid @RequestBody PlacementDto.RecordPlacementRequest request
    ) {
        PlacementDto.PlacementResponse response = placementService.recordPlacement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Placement recorded successfully!"));
    }
}
