package com.careerpath.service;

import com.careerpath.dto.ApplicationDto;
import com.careerpath.dto.PageResponse;
import com.careerpath.entity.ApplicationStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ApplicationService {
    ApplicationDto.ApplicationResponse applyForJob(String studentEmail, Long jobId);
    List<ApplicationDto.ApplicationResponse> getStudentApplications(String studentEmail);
    PageResponse<ApplicationDto.ApplicationResponse> getAllApplicationsAdmin(
            String query,
            ApplicationStatus status,
            Long jobId,
            Long companyId,
            Pageable pageable
    );
    ApplicationDto.ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatus status);
    ApplicationDto.InterviewDto scheduleInterview(Long applicationId, ApplicationDto.ScheduleInterviewRequest request);
    List<ApplicationDto.InterviewDto> getApplicationInterviews(Long applicationId);
    List<ApplicationDto.InterviewDto> getStudentInterviews(String studentEmail);
}
