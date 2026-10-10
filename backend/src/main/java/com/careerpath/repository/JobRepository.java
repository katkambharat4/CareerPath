package com.careerpath.repository;

import com.careerpath.entity.Job;
import com.careerpath.entity.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    long countByStatus(JobStatus status);

    List<Job> findByCompanyId(Long companyId);

    @Query("SELECT j FROM Job j JOIN j.company c WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:companyId IS NULL OR c.id = :companyId) AND " +
           "(:location IS NULL OR :location = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minPackage IS NULL OR j.packageLpa >= :minPackage) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Job> searchJobs(
            @Param("status") JobStatus status,
            @Param("companyId") Long companyId,
            @Param("location") String location,
            @Param("minPackage") BigDecimal minPackage,
            @Param("query") String query,
            Pageable pageable
    );
}
