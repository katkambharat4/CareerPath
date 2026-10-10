package com.careerpath.service;

import com.careerpath.dto.AuthDto;

public interface AuthService {
    AuthDto.AuthResponse registerStudent(AuthDto.RegisterRequest request);
    AuthDto.AuthResponse login(AuthDto.LoginRequest request);
    AuthDto.AuthResponse getCurrentUser(String email);
}
