package com.careerpath.service;

import com.careerpath.dto.JobDto;
import com.careerpath.dto.PageResponse;
import com.careerpath.entity.JobStatus;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface JobService {
    JobDto.JobResponse createJob(JobDto.JobRequest request);
    JobDto.JobResponse updateJob(Long id, JobDto.JobRequest request);
    JobDto.JobResponse updateJobStatus(Long id, JobStatus status);
    JobDto.JobResponse getJobById(Long id, String currentUserEmail);
    void deleteJob(Long id);
    PageResponse<JobDto.JobResponse> getJobsForStudent(
            String studentEmail,
            String query,
            String location,
            BigDecimal minPackage,
            Long companyId,
            Pageable pageable
    );
    PageResponse<JobDto.JobResponse> getAllJobsAdmin(
            String query,
            JobStatus status,
            Long companyId,
            Pageable pageable
    );
    List<JobDto.JobResponse> getOpenJobsList();
}
