package com.careerpath.service.impl;

import com.careerpath.dto.ApplicationDto;
import com.careerpath.dto.PageResponse;
import com.careerpath.entity.*;
import com.careerpath.exception.BadRequestException;
import com.careerpath.exception.ConflictException;
import com.careerpath.exception.ResourceNotFoundException;
import com.careerpath.repository.ApplicationRepository;
import com.careerpath.repository.InterviewRepository;
import com.careerpath.repository.JobRepository;
import com.careerpath.repository.StudentRepository;
import com.careerpath.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final StudentRepository studentRepository;
    private final InterviewRepository interviewRepository;

    @Override
    @Transactional
    public ApplicationDto.ApplicationResponse applyForJob(String studentEmail, Long jobId) {
        Student student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + studentEmail));

        if (!student.isActive()) {
            throw new BadRequestException("Student account is deactivated. Contact placement cell.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + jobId));

        if (job.getStatus() != JobStatus.OPEN) {
            throw new BadRequestException("Cannot apply: This job is closed for applications.");
        }

        if (job.getDeadline() != null && LocalDateTime.now().isAfter(job.getDeadline())) {
            throw new BadRequestException("Cannot apply: The application deadline has passed.");
        }

        // Eligibility check on configured criteria
        if (job.getMinCgpa() != null) {
            if (student.getCgpa() == null) {
                throw new BadRequestException("Please update your CGPA in profile before applying. Minimum required is: " + job.getMinCgpa());
            }
            if (student.getCgpa().compareTo(job.getMinCgpa()) < 0) {
                throw new BadRequestException("Ineligible: Your CGPA (" + student.getCgpa() + ") does not meet the minimum requirement of " + job.getMinCgpa());
            }
        }

        // Prevent duplicate applications
        if (applicationRepository.existsByStudentIdAndJobId(student.getId(), jobId)) {
            throw new ConflictException("You have already applied for this job position.");
        }

        Application application = Application.builder()
                .student(student)
                .job(job)
                .status(ApplicationStatus.APPLIED)
                .build();

        Application saved = applicationRepository.save(application);
        return mapToApplicationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDto.ApplicationResponse> getStudentApplications(String studentEmail) {
        Student student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + studentEmail));

        return applicationRepository.findByStudentIdOrderByAppliedAtDesc(student.getId()).stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApplicationDto.ApplicationResponse> getAllApplicationsAdmin(
            String query,
            ApplicationStatus status,
            Long jobId,
            Long companyId,
            Pageable pageable
    ) {
        Page<Application> page = applicationRepository.searchApplications(status, jobId, companyId, query, pageable);
        List<ApplicationDto.ApplicationResponse> content = page.getContent().stream()
                .map(this::mapToApplicationResponse)
                .collect(Collectors.toList());

        return PageResponse.<ApplicationDto.ApplicationResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public ApplicationDto.ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        application.setStatus(status);
        Application updated = applicationRepository.save(application);
        return mapToApplicationResponse(updated);
    }

    @Override
    @Transactional
    public ApplicationDto.InterviewDto scheduleInterview(Long applicationId, ApplicationDto.ScheduleInterviewRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));

        Interview interview = Interview.builder()
                .application(application)
                .interviewDate(request.getInterviewDate())
                .mode(request.getMode() != null ? request.getMode() : InterviewMode.ONLINE)
                .locationOrLink(request.getLocationOrLink())
                .roundName(request.getRoundName().trim())
                .status(InterviewStatus.SCHEDULED)
                .feedback(request.getFeedback())
                .build();

        Interview saved = interviewRepository.save(interview);

        // If interview scheduled and application is still APPLIED, automatically mark SHORTLISTED
        if (application.getStatus() == ApplicationStatus.APPLIED) {
            application.setStatus(ApplicationStatus.SHORTLISTED);
            applicationRepository.save(application);
        }

        return mapToInterviewDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDto.InterviewDto> getApplicationInterviews(Long applicationId) {
        return interviewRepository.findByApplicationIdOrderByInterviewDateAsc(applicationId).stream()
                .map(this::mapToInterviewDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDto.InterviewDto> getStudentInterviews(String studentEmail) {
        Student student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + studentEmail));

        return interviewRepository.findByApplicationStudentIdOrderByInterviewDateDesc(student.getId()).stream()
                .map(this::mapToInterviewDto)
                .collect(Collectors.toList());
    }

    private ApplicationDto.ApplicationResponse mapToApplicationResponse(Application app) {
        List<ApplicationDto.InterviewDto> interviews = app.getInterviews().stream()
                .map(this::mapToInterviewDto)
                .collect(Collectors.toList());

        return ApplicationDto.ApplicationResponse.builder()
                .id(app.getId())
                .studentId(app.getStudent().getId())
                .studentName(app.getStudent().getName())
                .studentEmail(app.getStudent().getUser().getEmail())
                .department(app.getStudent().getDepartment())
                .studentCgpa(app.getStudent().getCgpa())
                .resumeUrl(app.getStudent().getResumeUrl())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .companyId(app.getJob().getCompany().getId())
                .companyName(app.getJob().getCompany().getName())
                .packageLpa(app.getJob().getPackageLpa())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .interviews(interviews)
                .build();
    }

    private ApplicationDto.InterviewDto mapToInterviewDto(Interview i) {
        return ApplicationDto.InterviewDto.builder()
                .id(i.getId())
                .applicationId(i.getApplication().getId())
                .interviewDate(i.getInterviewDate())
                .mode(i.getMode())
                .locationOrLink(i.getLocationOrLink())
                .roundName(i.getRoundName())
                .status(i.getStatus())
                .feedback(i.getFeedback())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
