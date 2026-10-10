package com.careerpath.repository;

import com.careerpath.entity.Application;
import com.careerpath.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    Optional<Application> findByStudentIdAndJobId(Long studentId, Long jobId);

    List<Application> findByStudentIdOrderByAppliedAtDesc(Long studentId);

    long countByStatus(ApplicationStatus status);

    @Query("SELECT a FROM Application a JOIN a.student s JOIN a.job j JOIN j.company c WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:jobId IS NULL OR j.id = :jobId) AND " +
           "(:companyId IS NULL OR c.id = :companyId) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Application> searchApplications(
            @Param("status") ApplicationStatus status,
            @Param("jobId") Long jobId,
            @Param("companyId") Long companyId,
            @Param("query") String query,
            Pageable pageable
    );
}
