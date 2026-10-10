package com.careerpath.service;

import com.careerpath.dto.PageResponse;
import com.careerpath.dto.StudentDto;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StudentService {
    StudentDto.ProfileResponse getProfileByEmail(String email);
    StudentDto.ProfileResponse getProfileById(Long studentId);
    StudentDto.ProfileResponse updateProfile(String email, StudentDto.UpdateProfileRequest request);
    List<StudentDto.SkillItem> getStudentSkills(String email);
    StudentDto.SkillItem addSkill(String email, StudentDto.AddSkillRequest request);
    void removeSkill(String email, Long skillId);
    PageResponse<StudentDto.ProfileResponse> getAllStudents(String query, Pageable pageable);
    void updateStudentStatus(Long studentId, boolean active);
}
