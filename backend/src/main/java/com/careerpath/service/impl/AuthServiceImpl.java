package com.careerpath.service.impl;

import com.careerpath.dto.AuthDto;
import com.careerpath.entity.Role;
import com.careerpath.entity.Student;
import com.careerpath.entity.User;
import com.careerpath.exception.ConflictException;
import com.careerpath.exception.ResourceNotFoundException;
import com.careerpath.repository.StudentRepository;
import com.careerpath.repository.UserRepository;
import com.careerpath.security.JwtTokenProvider;
import com.careerpath.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthDto.AuthResponse registerStudent(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();
        User savedUser = userRepository.save(user);

        Student student = Student.builder()
                .user(savedUser)
                .name(request.getName().trim())
                .phone(request.getPhone())
                .department(request.getDepartment())
                .cgpa(request.getCgpa())
                .graduationYear(request.getGraduationYear())
                .resumeUrl(request.getResumeUrl())
                .active(true)
                .build();
        Student savedStudent = studentRepository.save(student);
        savedUser.setStudent(savedStudent);

        String token = jwtTokenProvider.generateToken(savedUser);

        return AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .studentId(savedStudent.getId())
                .name(savedStudent.getName())
                .build();
    }

    @Override
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String token = jwtTokenProvider.generateToken(user);
        Long studentId = user.getStudent() != null ? user.getStudent().getId() : null;
        String name = user.getStudent() != null ? user.getStudent().getName() : "Administrator";

        return AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(studentId)
                .name(name)
                .build();
    }

    @Override
    public AuthDto.AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Long studentId = user.getStudent() != null ? user.getStudent().getId() : null;
        String name = user.getStudent() != null ? user.getStudent().getName() : "Administrator";

        return AuthDto.AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(studentId)
                .name(name)
                .build();
    }
}
