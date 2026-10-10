package com.careerpath.repository;

import com.careerpath.entity.Placement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface PlacementRepository extends JpaRepository<Placement, Long> {
    Optional<Placement> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);

    @Query("SELECT AVG(p.packageLpa) FROM Placement p")
    BigDecimal findAveragePackage();

    @Query("SELECT MAX(p.packageLpa) FROM Placement p")
    BigDecimal findHighestPackage();

    @Query("SELECT p FROM Placement p JOIN p.student s JOIN p.company c JOIN p.job j WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Placement> searchPlacements(@Param("query") String query, Pageable pageable);
}
