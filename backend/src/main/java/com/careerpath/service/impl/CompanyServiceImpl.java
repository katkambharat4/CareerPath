package com.careerpath.service.impl;

import com.careerpath.dto.CompanyDto;
import com.careerpath.dto.PageResponse;
import com.careerpath.entity.Company;
import com.careerpath.exception.ConflictException;
import com.careerpath.exception.ResourceNotFoundException;
import com.careerpath.repository.CompanyRepository;
import com.careerpath.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    @Override
    @Transactional
    public CompanyDto.CompanyResponse createCompany(CompanyDto.CompanyRequest request) {
        if (companyRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new ConflictException("Company already exists with name: " + request.getName());
        }

        Company company = Company.builder()
                .name(request.getName().trim())
                .industry(request.getIndustry())
                .location(request.getLocation())
                .website(request.getWebsite())
                .description(request.getDescription())
                .build();

        Company saved = companyRepository.save(company);
        return mapToCompanyResponse(saved);
    }

    @Override
    @Transactional
    public CompanyDto.CompanyResponse updateCompany(Long id, CompanyDto.CompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));

        if (!company.getName().equalsIgnoreCase(request.getName().trim()) &&
                companyRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new ConflictException("Another company exists with name: " + request.getName());
        }

        company.setName(request.getName().trim());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        company.setDescription(request.getDescription());

        Company updated = companyRepository.save(company);
        return mapToCompanyResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDto.CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));
        return mapToCompanyResponse(company);
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found with ID: " + id);
        }
        companyRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CompanyDto.CompanyResponse> getAllCompanies(String query, Pageable pageable) {
        Page<Company> page = companyRepository.searchCompanies(query, pageable);
        List<CompanyDto.CompanyResponse> content = page.getContent().stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());

        return PageResponse.<CompanyDto.CompanyResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto.CompanyResponse> getAllCompaniesList() {
        return companyRepository.findAll().stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    private CompanyDto.CompanyResponse mapToCompanyResponse(Company company) {
        return CompanyDto.CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .industry(company.getIndustry())
                .location(company.getLocation())
                .website(company.getWebsite())
                .description(company.getDescription())
                .totalJobs(company.getJobs() != null ? company.getJobs().size() : 0)
                .createdAt(company.getCreatedAt())
                .build();
    }
}
