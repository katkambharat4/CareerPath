package com.careerpath.service.impl;

import com.careerpath.dto.JobDto;
import com.careerpath.dto.PageResponse;
import com.careerpath.entity.Company;
import com.careerpath.entity.Job;
import com.careerpath.entity.JobStatus;
import com.careerpath.entity.Student;
import com.careerpath.exception.ResourceNotFoundException;
import com.careerpath.repository.ApplicationRepository;
import com.careerpath.repository.CompanyRepository;
import com.careerpath.repository.JobRepository;
import com.careerpath.repository.StudentRepository;
import com.careerpath.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional
    public JobDto.JobResponse createJob(JobDto.JobRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.getCompanyId()));

        Job job = Job.builder()
                .company(company)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .minCgpa(request.getMinCgpa())
                .packageLpa(request.getPackageLpa())
                .location(request.getLocation())
                .deadline(request.getDeadline())
                .status(request.getStatus() != null ? request.getStatus() : JobStatus.OPEN)
                .build();

        Job saved = jobRepository.save(job);
        return mapToJobResponse(saved, null);
    }

    @Override
    @Transactional
    public JobDto.JobResponse updateJob(Long id, JobDto.JobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + request.getCompanyId()));

        job.setCompany(company);
        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription());
        job.setRequiredSkills(request.getRequiredSkills());
        job.setMinCgpa(request.getMinCgpa());
        job.setPackageLpa(request.getPackageLpa());
        job.setLocation(request.getLocation());
        job.setDeadline(request.getDeadline());
        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
        }

        Job updated = jobRepository.save(job);
        return mapToJobResponse(updated, null);
    }

    @Override
    @Transactional
    public JobDto.JobResponse updateJobStatus(Long id, JobStatus status) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));
        job.setStatus(status);
        Job updated = jobRepository.save(job);
        return mapToJobResponse(updated, null);
    }

    @Override
    @Transactional(readOnly = true)
    public JobDto.JobResponse getJobById(Long id, String currentUserEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));

        Student student = null;
        if (currentUserEmail != null) {
            student = studentRepository.findByUserEmail(currentUserEmail).orElse(null);
        }
        return mapToJobResponse(job, student);
    }

    @Override
    @Transactional
    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job not found with ID: " + id);
        }
        jobRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<JobDto.JobResponse> getJobsForStudent(
            String studentEmail,
            String query,
            String location,
            BigDecimal minPackage,
            Long companyId,
            Pageable pageable
    ) {
        Student student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + studentEmail));

        // Return OPEN jobs for students
        Page<Job> page = jobRepository.searchJobs(JobStatus.OPEN, companyId, location, minPackage, query, pageable);
        List<JobDto.JobResponse> content = page.getContent().stream()
                .map(j -> mapToJobResponse(j, student))
                .collect(Collectors.toList());

        return PageResponse.<JobDto.JobResponse>builder()
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
    public PageResponse<JobDto.JobResponse> getAllJobsAdmin(
            String query,
            JobStatus status,
            Long companyId,
            Pageable pageable
    ) {
        Page<Job> page = jobRepository.searchJobs(status, companyId, null, null, query, pageable);
        List<JobDto.JobResponse> content = page.getContent().stream()
                .map(j -> mapToJobResponse(j, null))
                .collect(Collectors.toList());

        return PageResponse.<JobDto.JobResponse>builder()
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
    public List<JobDto.JobResponse> getOpenJobsList() {
        return jobRepository.findAll().stream()
                .filter(j -> j.getStatus() == JobStatus.OPEN)
                .map(j -> mapToJobResponse(j, null))
                .collect(Collectors.toList());
    }

    private JobDto.JobResponse mapToJobResponse(Job job, Student student) {
        boolean eligible = true;
        String eligibilityReason = "Eligible";
        boolean alreadyApplied = false;

        if (student != null) {
            alreadyApplied = applicationRepository.existsByStudentIdAndJobId(student.getId(), job.getId());

            // Check CGPA eligibility criteria configured for this job
            if (job.getMinCgpa() != null) {
                if (student.getCgpa() == null) {
                    eligible = false;
                    eligibilityReason = "CGPA not updated in profile (Min required: " + job.getMinCgpa() + ")";
                } else if (student.getCgpa().compareTo(job.getMinCgpa()) < 0) {
                    eligible = false;
                    eligibilityReason = "CGPA " + student.getCgpa() + " is below minimum requirement of " + job.getMinCgpa();
                }
            }

            // Check Deadline
            if (job.getDeadline() != null && LocalDateTime.now().isAfter(job.getDeadline())) {
                eligible = false;
                eligibilityReason = "Application deadline has passed";
            }

            // Check Status
            if (job.getStatus() != JobStatus.OPEN) {
                eligible = false;
                eligibilityReason = "Job opening is currently closed";
            }
        }

        return JobDto.JobResponse.builder()
                .id(job.getId())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .companyLocation(job.getCompany().getLocation())
                .title(job.getTitle())
                .description(job.getDescription())
                .requiredSkills(job.getRequiredSkills())
                .minCgpa(job.getMinCgpa())
                .packageLpa(job.getPackageLpa())
                .location(job.getLocation())
                .deadline(job.getDeadline())
                .status(job.getStatus())
                .eligible(eligible)
                .eligibilityReason(eligibilityReason)
                .alreadyApplied(alreadyApplied)
                .totalApplications(job.getApplications() != null ? job.getApplications().size() : 0)
                .createdAt(job.getCreatedAt())
                .build();
    }
}
