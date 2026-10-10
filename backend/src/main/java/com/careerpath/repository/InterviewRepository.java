package com.careerpath.repository;

import com.careerpath.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationIdOrderByInterviewDateAsc(Long applicationId);
    List<Interview> findByApplicationStudentIdOrderByInterviewDateDesc(Long studentId);
}
