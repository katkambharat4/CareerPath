package com.careerpath.controller;

import com.careerpath.dto.*;
import com.careerpath.service.ApplicationService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
@Tag(name = "Student Operations", description = "Endpoints accessible by authenticated students")
public class StudentController {

    private final StudentService studentService;
    private final JobService jobService;
    private final ApplicationService applicationService;
    private final PlacementService placementService;

    @GetMapping("/profile")
    @Operation(summary = "Get student profile", description = "Retrieves profile and skills of current student")
    public ResponseEntity<ApiResponse<StudentDto.ProfileResponse>> getProfile(Authentication authentication) {
        StudentDto.ProfileResponse profile = studentService.getProfileByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update student profile", description = "Updates details such as phone, department, CGPA, graduation year, resume URL")
    public ResponseEntity<ApiResponse<StudentDto.ProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody StudentDto.UpdateProfileRequest request
    ) {
        StudentDto.ProfileResponse updated = studentService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @GetMapping("/skills")
    @Operation(summary = "List skills", description = "List all skills of the authenticated student")
    public ResponseEntity<ApiResponse<List<StudentDto.SkillItem>>> getSkills(Authentication authentication) {
        List<StudentDto.SkillItem> skills = studentService.getStudentSkills(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @PostMapping("/skills")
    @Operation(summary = "Add or update skill", description = "Adds a skill to the student profile with proficiency")
    public ResponseEntity<ApiResponse<StudentDto.SkillItem>> addSkill(
            Authentication authentication,
            @Valid @RequestBody StudentDto.AddSkillRequest request
    ) {
        StudentDto.SkillItem skill = studentService.addSkill(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(skill, "Skill added successfully"));
    }

    @DeleteMapping("/skills/{skillId}")
    @Operation(summary = "Remove skill", description = "Removes a skill from student profile")
    public ResponseEntity<ApiResponse<Void>> removeSkill(
            Authentication authentication,
            @PathVariable Long skillId
    ) {
        studentService.removeSkill(authentication.getName(), skillId);
        return ResponseEntity.ok(ApiResponse.success(null, "Skill removed successfully"));
    }

    @GetMapping("/jobs")
    @Operation(summary = "View jobs", description = "Search and filter open jobs with eligibility check")
    public ResponseEntity<ApiResponse<PageResponse<JobDto.JobResponse>>> getJobs(
            Authentication authentication,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPackage,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        PageResponse<JobDto.JobResponse> response = jobService.getJobsForStudent(
                authentication.getName(),
                query,
                location,
                minPackage,
                companyId,
                PageRequest.of(page, size, sort)
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/jobs/{jobId}/apply")
    @Operation(summary = "Apply for job", description = "Applies for a job with CGPA eligibility and duplicate prevention checks")
    public ResponseEntity<ApiResponse<ApplicationDto.ApplicationResponse>> applyForJob(
            Authentication authentication,
            @PathVariable Long jobId
    ) {
        ApplicationDto.ApplicationResponse application = applicationService.applyForJob(authentication.getName(), jobId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(application, "Applied successfully!"));
    }

    @GetMapping("/applications")
    @Operation(summary = "Track applications", description = "List all applications of the logged in student with interview history")
    public ResponseEntity<ApiResponse<List<ApplicationDto.ApplicationResponse>>> getApplications(Authentication authentication) {
        List<ApplicationDto.ApplicationResponse> applications = applicationService.getStudentApplications(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(applications));
    }

    @GetMapping("/interviews")
    @Operation(summary = "Track interviews", description = "List all scheduled/completed interviews for the logged in student")
    public ResponseEntity<ApiResponse<List<ApplicationDto.InterviewDto>>> getInterviews(Authentication authentication) {
        List<ApplicationDto.InterviewDto> interviews = applicationService.getStudentInterviews(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(interviews));
    }

    @GetMapping("/placement")
    @Operation(summary = "Get placement record", description = "Returns student's final placement record if placed")
    public ResponseEntity<ApiResponse<PlacementDto.PlacementResponse>> getPlacement(Authentication authentication) {
        StudentDto.ProfileResponse profile = studentService.getProfileByEmail(authentication.getName());
        try {
            PlacementDto.PlacementResponse placement = placementService.getPlacementByStudentId(profile.getId());
            return ResponseEntity.ok(ApiResponse.success(placement));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResponse.success(null, "Not yet placed"));
        }
    }
}
