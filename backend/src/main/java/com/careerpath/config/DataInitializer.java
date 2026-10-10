package com.careerpath.config;

import com.careerpath.entity.*;
import com.careerpath.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final PlacementRepository placementRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Seed Admin user if not exists
        if (!userRepository.existsByEmail("admin@careerpath.edu")) {
            log.info("Seeding default Administrator...");
            User admin = User.builder()
                    .email("admin@careerpath.edu")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin created: admin@careerpath.edu / Admin@123");
        }

        // 2. Seed Skills if empty
        if (skillRepository.count() == 0) {
            log.info("Seeding skills catalogue...");
            String[] commonSkills = {"Java", "Spring Boot", "React", "Python", "SQL", "JavaScript", "Docker", "AWS", "Node.js", "C++"};
            for (String s : commonSkills) {
                skillRepository.save(Skill.builder().name(s).build());
            }
        }

        // 3. Seed Companies if empty
        if (companyRepository.count() == 0) {
            log.info("Seeding initial corporate partners...");
            Company google = companyRepository.save(Company.builder()
                    .name("Google India")
                    .industry("Information Technology")
                    .location("Bangalore, Karnataka")
                    .website("https://careers.google.com")
                    .description("Global technology leader in search, cloud systems, and machine intelligence.")
                    .build());

            Company microsoft = companyRepository.save(Company.builder()
                    .name("Microsoft India")
                    .industry("Software & Cloud")
                    .location("Hyderabad, Telangana")
                    .website("https://careers.microsoft.com")
                    .description("Empowering every person and organization on the planet to achieve more.")
                    .build());

            Company amazon = companyRepository.save(Company.builder()
                    .name("Amazon Web Services")
                    .industry("Cloud Computing")
                    .location("Chennai, Tamil Nadu")
                    .website("https://amazon.jobs")
                    .description("World's most comprehensive and broadly adopted cloud platform.")
                    .build());

            Company tcs = companyRepository.save(Company.builder()
                    .name("Tata Consultancy Services")
                    .industry("IT Consulting & Services")
                    .location("Mumbai, Maharashtra")
                    .website("https://tcs.com/careers")
                    .description("Global leader in IT services, consulting, and business solutions.")
                    .build());

            // 4. Seed Jobs
            Job jobGoogle = jobRepository.save(Job.builder()
                    .company(google)
                    .title("Software Engineer - Backend")
                    .description("Develop robust distributed systems using Java, Spring Boot, and cloud microservices.")
                    .requiredSkills("Java, Spring Boot, SQL, Docker")
                    .minCgpa(BigDecimal.valueOf(8.00))
                    .packageLpa(BigDecimal.valueOf(24.50))
                    .location("Bangalore")
                    .deadline(LocalDateTime.now().plusMonths(2))
                    .status(JobStatus.OPEN)
                    .build());

            Job jobMicrosoft = jobRepository.save(Job.builder()
                    .company(microsoft)
                    .title("Full Stack Web Developer")
                    .description("Build rich responsive client applications and services using React and modern APIs.")
                    .requiredSkills("React, JavaScript, Java, SQL")
                    .minCgpa(BigDecimal.valueOf(7.50))
                    .packageLpa(BigDecimal.valueOf(18.00))
                    .location("Hyderabad")
                    .deadline(LocalDateTime.now().plusMonths(1))
                    .status(JobStatus.OPEN)
                    .build());

            Job jobAmazon = jobRepository.save(Job.builder()
                    .company(amazon)
                    .title("Cloud Support Associate")
                    .description("Troubleshoot cloud infrastructure and help enterprise clients scale on AWS.")
                    .requiredSkills("Python, AWS, Docker")
                    .minCgpa(BigDecimal.valueOf(7.00))
                    .packageLpa(BigDecimal.valueOf(14.00))
                    .location("Chennai")
                    .deadline(LocalDateTime.now().plusDays(20))
                    .status(JobStatus.OPEN)
                    .build());

            Job jobTcs = jobRepository.save(Job.builder()
                    .company(tcs)
                    .title("Systems Engineer")
                    .description("Engineering enterprise solutions across core banking and retail domains.")
                    .requiredSkills("Java, SQL")
                    .minCgpa(BigDecimal.valueOf(6.50))
                    .packageLpa(BigDecimal.valueOf(7.20))
                    .location("Mumbai")
                    .deadline(LocalDateTime.now().plusDays(45))
                    .status(JobStatus.OPEN)
                    .build());

            // 5. Seed sample students
            if (!userRepository.existsByEmail("rahul.sharma@careerpath.edu")) {
                User user1 = userRepository.save(User.builder()
                        .email("rahul.sharma@careerpath.edu")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(Role.STUDENT)
                        .build());

                Student student1 = studentRepository.save(Student.builder()
                        .user(user1)
                        .name("Rahul Sharma")
                        .phone("+91 9876543210")
                        .department("Computer Science and Engineering")
                        .cgpa(BigDecimal.valueOf(8.85))
                        .graduationYear(2026)
                        .resumeUrl("https://example.com/resumes/rahul-sharma.pdf")
                        .active(true)
                        .build());
                user1.setStudent(student1);

                // Add skills
                Skill javaSkill = skillRepository.findByNameIgnoreCase("Java").orElse(null);
                Skill springSkill = skillRepository.findByNameIgnoreCase("Spring Boot").orElse(null);
                Skill reactSkill = skillRepository.findByNameIgnoreCase("React").orElse(null);

                if (javaSkill != null) {
                    studentSkillRepository.save(StudentSkill.builder()
                            .id(new StudentSkillId(student1.getId(), javaSkill.getId()))
                            .student(student1).skill(javaSkill).proficiency(Proficiency.ADVANCED).build());
                }
                if (springSkill != null) {
                    studentSkillRepository.save(StudentSkill.builder()
                            .id(new StudentSkillId(student1.getId(), springSkill.getId()))
                            .student(student1).skill(springSkill).proficiency(Proficiency.INTERMEDIATE).build());
                }
                if (reactSkill != null) {
                    studentSkillRepository.save(StudentSkill.builder()
                            .id(new StudentSkillId(student1.getId(), reactSkill.getId()))
                            .student(student1).skill(reactSkill).proficiency(Proficiency.INTERMEDIATE).build());
                }

                // Create Application
                Application app1 = applicationRepository.save(Application.builder()
                        .student(student1)
                        .job(jobGoogle)
                        .status(ApplicationStatus.SHORTLISTED)
                        .build());

                interviewRepository.save(Interview.builder()
                        .application(app1)
                        .interviewDate(LocalDateTime.now().plusDays(3).withHour(11).withMinute(0))
                        .mode(InterviewMode.ONLINE)
                        .locationOrLink("https://meet.google.com/xyz-placement-round")
                        .roundName("Technical Round 1 - Problem Solving")
                        .status(InterviewStatus.SCHEDULED)
                        .feedback("Selected for round 1 after resume screening.")
                        .build());
            }

            if (!userRepository.existsByEmail("priya.patel@careerpath.edu")) {
                User user2 = userRepository.save(User.builder()
                        .email("priya.patel@careerpath.edu")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(Role.STUDENT)
                        .build());

                Student student2 = studentRepository.save(Student.builder()
                        .user(user2)
                        .name("Priya Patel")
                        .phone("+91 9123456780")
                        .department("Information Technology")
                        .cgpa(BigDecimal.valueOf(9.30))
                        .graduationYear(2026)
                        .resumeUrl("https://example.com/resumes/priya-patel.pdf")
                        .active(true)
                        .build());
                user2.setStudent(student2);

                // Add skills
                Skill pythonSkill = skillRepository.findByNameIgnoreCase("Python").orElse(null);
                Skill sqlSkill = skillRepository.findByNameIgnoreCase("SQL").orElse(null);
                if (pythonSkill != null) {
                    studentSkillRepository.save(StudentSkill.builder()
                            .id(new StudentSkillId(student2.getId(), pythonSkill.getId()))
                            .student(student2).skill(pythonSkill).proficiency(Proficiency.ADVANCED).build());
                }
                if (sqlSkill != null) {
                    studentSkillRepository.save(StudentSkill.builder()
                            .id(new StudentSkillId(student2.getId(), sqlSkill.getId()))
                            .student(student2).skill(sqlSkill).proficiency(Proficiency.ADVANCED).build());
                }

                // Priya got placed at Microsoft!
                Application app2 = applicationRepository.save(Application.builder()
                        .student(student2)
                        .job(jobMicrosoft)
                        .status(ApplicationStatus.SELECTED)
                        .build());

                placementRepository.save(Placement.builder()
                        .student(student2)
                        .company(microsoft)
                        .job(jobMicrosoft)
                        .packageLpa(BigDecimal.valueOf(18.00))
                        .joiningDate(LocalDate.now().plusMonths(3))
                        .placedDate(LocalDate.now().minusDays(5))
                        .build());
            }

            if (!userRepository.existsByEmail("arun.kumar@careerpath.edu")) {
                User user3 = userRepository.save(User.builder()
                        .email("arun.kumar@careerpath.edu")
                        .password(passwordEncoder.encode("Student@123"))
                        .role(Role.STUDENT)
                        .build());

                Student student3 = studentRepository.save(Student.builder()
                        .user(user3)
                        .name("Arun Kumar")
                        .phone("+91 9988776655")
                        .department("Electronics & Communication")
                        .cgpa(BigDecimal.valueOf(7.60))
                        .graduationYear(2026)
                        .resumeUrl("https://example.com/resumes/arun-kumar.pdf")
                        .active(true)
                        .build());
                user3.setStudent(student3);

                applicationRepository.save(Application.builder()
                        .student(student3)
                        .job(jobTcs)
                        .status(ApplicationStatus.APPLIED)
                        .build());
            }
        }
        log.info("Data initialization check complete.");
    }
}
