package com.careerpath.service.impl;

import com.careerpath.dto.PageResponse;
import com.careerpath.dto.StudentDto;
import com.careerpath.entity.*;
import com.careerpath.exception.BadRequestException;
import com.careerpath.exception.ResourceNotFoundException;
import com.careerpath.repository.PlacementRepository;
import com.careerpath.repository.SkillRepository;
import com.careerpath.repository.StudentRepository;
import com.careerpath.repository.StudentSkillRepository;
import com.careerpath.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final PlacementRepository placementRepository;

    @Override
    @Transactional(readOnly = true)
    public StudentDto.ProfileResponse getProfileByEmail(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));
        return mapToProfileResponse(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDto.ProfileResponse getProfileById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        return mapToProfileResponse(student);
    }

    @Override
    @Transactional
    public StudentDto.ProfileResponse updateProfile(String email, StudentDto.UpdateProfileRequest request) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));

        student.setName(request.getName().trim());
        student.setPhone(request.getPhone());
        student.setDepartment(request.getDepartment());
        student.setCgpa(request.getCgpa());
        student.setGraduationYear(request.getGraduationYear());
        student.setResumeUrl(request.getResumeUrl());

        Student updated = studentRepository.save(student);
        return mapToProfileResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentDto.SkillItem> getStudentSkills(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));

        return studentSkillRepository.findByStudentId(student.getId()).stream()
                .map(ss -> StudentDto.SkillItem.builder()
                        .skillId(ss.getSkill().getId())
                        .skillName(ss.getSkill().getName())
                        .proficiency(ss.getProficiency())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StudentDto.SkillItem addSkill(String email, StudentDto.AddSkillRequest request) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));

        String skillName = request.getSkillName().trim();
        Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                .orElseGet(() -> skillRepository.save(Skill.builder().name(skillName).build()));

        StudentSkillId id = new StudentSkillId(student.getId(), skill.getId());
        StudentSkill studentSkill = StudentSkill.builder()
                .id(id)
                .student(student)
                .skill(skill)
                .proficiency(request.getProficiency() != null ? request.getProficiency() : Proficiency.INTERMEDIATE)
                .build();

        StudentSkill saved = studentSkillRepository.save(studentSkill);

        return StudentDto.SkillItem.builder()
                .skillId(saved.getSkill().getId())
                .skillName(saved.getSkill().getName())
                .proficiency(saved.getProficiency())
                .build();
    }

    @Override
    @Transactional
    public void removeSkill(String email, Long skillId) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));

        StudentSkillId id = new StudentSkillId(student.getId(), skillId);
        studentSkillRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StudentDto.ProfileResponse> getAllStudents(String query, Pageable pageable) {
        Page<Student> page = studentRepository.searchStudents(query, pageable);
        List<StudentDto.ProfileResponse> content = page.getContent().stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());

        return PageResponse.<StudentDto.ProfileResponse>builder()
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
    public void updateStudentStatus(Long studentId, boolean active) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        student.setActive(active);
        studentRepository.save(student);
    }

    private StudentDto.ProfileResponse mapToProfileResponse(Student student) {
        boolean isPlaced = placementRepository.existsByStudentId(student.getId());
        List<StudentDto.SkillItem> skills = studentSkillRepository.findByStudentId(student.getId()).stream()
                .map(ss -> StudentDto.SkillItem.builder()
                        .skillId(ss.getSkill().getId())
                        .skillName(ss.getSkill().getName())
                        .proficiency(ss.getProficiency())
                        .build())
                .collect(Collectors.toList());

        return StudentDto.ProfileResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .email(student.getUser().getEmail())
                .name(student.getName())
                .phone(student.getPhone())
                .department(student.getDepartment())
                .cgpa(student.getCgpa())
                .graduationYear(student.getGraduationYear())
                .resumeUrl(student.getResumeUrl())
                .active(student.isActive())
                .skills(skills)
                .placed(isPlaced)
                .createdAt(student.getCreatedAt())
                .build();
    }
}
