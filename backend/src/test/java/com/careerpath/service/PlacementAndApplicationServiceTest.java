package com.careerpath.service;

import com.careerpath.dto.ApplicationDto;
import com.careerpath.dto.JobDto;
import com.careerpath.dto.PlacementDto;
import com.careerpath.dto.StudentDto;
import com.careerpath.entity.*;
import com.careerpath.exception.BadRequestException;
import com.careerpath.exception.ConflictException;
import com.careerpath.repository.*;
import com.careerpath.service.impl.ApplicationServiceImpl;
import com.careerpath.service.impl.PlacementServiceImpl;
import com.careerpath.service.impl.StudentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlacementAndApplicationServiceTest {

    @Mock
    private PlacementRepository placementRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @InjectMocks
    private PlacementServiceImpl placementService;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private Student mockStudent;
    private Company mockCompany;
    private Job mockJob;
    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("student@test.com").role(Role.STUDENT).build();
        mockStudent = Student.builder()
                .id(1L)
                .name("Alex Johnson")
                .user(mockUser)
                .cgpa(BigDecimal.valueOf(8.50))
                .active(true)
                .applications(new ArrayList<>())
                .build();
        mockCompany = Company.builder().id(1L).name("Tech Corp").build();
        mockJob = Job.builder()
                .id(1L)
                .title("Software Engineer")
                .company(mockCompany)
                .minCgpa(BigDecimal.valueOf(7.00))
                .packageLpa(BigDecimal.valueOf(15.00))
                .status(JobStatus.OPEN)
                .deadline(LocalDateTime.now().plusDays(10))
                .applications(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should successfully apply when eligible and no duplicate exists")
    void testApplyForJob_Success() {
        when(studentRepository.findByUserEmail("student@test.com")).thenReturn(Optional.of(mockStudent));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.existsByStudentIdAndJobId(1L, 1L)).thenReturn(false);

        Application savedApp = Application.builder()
                .id(10L)
                .student(mockStudent)
                .job(mockJob)
                .status(ApplicationStatus.APPLIED)
                .interviews(new ArrayList<>())
                .appliedAt(LocalDateTime.now())
                .build();

        when(applicationRepository.save(any(Application.class))).thenReturn(savedApp);

        ApplicationDto.ApplicationResponse response = applicationService.applyForJob("student@test.com", 1L);

        assertNotNull(response);
        assertEquals(ApplicationStatus.APPLIED, response.getStatus());
        assertEquals("Tech Corp", response.getCompanyName());
        verify(applicationRepository, times(1)).save(any(Application.class));
    }

    @Test
    @DisplayName("Should reject duplicate application for same student and job")
    void testApplyForJob_DuplicateFails() {
        when(studentRepository.findByUserEmail("student@test.com")).thenReturn(Optional.of(mockStudent));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(mockJob));
        when(applicationRepository.existsByStudentIdAndJobId(1L, 1L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> applicationService.applyForJob("student@test.com", 1L));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    @DisplayName("Should fail application if student CGPA is lower than required minimum")
    void testApplyForJob_LowCgpaFails() {
        mockStudent.setCgpa(BigDecimal.valueOf(6.50)); // Below required 7.00
        when(studentRepository.findByUserEmail("student@test.com")).thenReturn(Optional.of(mockStudent));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(mockJob));

        assertThrows(BadRequestException.class, () -> applicationService.applyForJob("student@test.com", 1L));
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    @DisplayName("Should successfully record placement when student not previously placed")
    void testRecordPlacement_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(placementRepository.existsByStudentId(1L)).thenReturn(false);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(mockCompany));
        when(jobRepository.findById(1L)).thenReturn(Optional.of(mockJob));

        Placement savedPlacement = Placement.builder()
                .id(100L)
                .student(mockStudent)
                .company(mockCompany)
                .job(mockJob)
                .packageLpa(BigDecimal.valueOf(15.00))
                .placedDate(LocalDate.now())
                .build();

        when(placementRepository.save(any(Placement.class))).thenReturn(savedPlacement);
        when(applicationRepository.findByStudentIdAndJobId(1L, 1L)).thenReturn(Optional.empty());

        PlacementDto.RecordPlacementRequest request = PlacementDto.RecordPlacementRequest.builder()
                .studentId(1L)
                .companyId(1L)
                .jobId(1L)
                .packageLpa(BigDecimal.valueOf(15.00))
                .placedDate(LocalDate.now())
                .build();

        PlacementDto.PlacementResponse response = placementService.recordPlacement(request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(15.00), response.getPackageLpa());
        assertEquals("Alex Johnson", response.getStudentName());
    }

    @Test
    @DisplayName("Should enforce one-placement-per-student rule and reject secondary placement")
    void testRecordPlacement_SecondaryPlacementFails() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(placementRepository.existsByStudentId(1L)).thenReturn(true); // Already placed

        PlacementDto.RecordPlacementRequest request = PlacementDto.RecordPlacementRequest.builder()
                .studentId(1L)
                .companyId(1L)
                .jobId(1L)
                .packageLpa(BigDecimal.valueOf(18.00))
                .placedDate(LocalDate.now())
                .build();

        assertThrows(ConflictException.class, () -> placementService.recordPlacement(request));
        verify(placementRepository, never()).save(any(Placement.class));
    }
}
