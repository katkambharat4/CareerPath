package com.careerpath.service;

import com.careerpath.dto.CompanyDto;
import com.careerpath.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CompanyService {
    CompanyDto.CompanyResponse createCompany(CompanyDto.CompanyRequest request);
    CompanyDto.CompanyResponse updateCompany(Long id, CompanyDto.CompanyRequest request);
    CompanyDto.CompanyResponse getCompanyById(Long id);
    void deleteCompany(Long id);
    PageResponse<CompanyDto.CompanyResponse> getAllCompanies(String query, Pageable pageable);
    List<CompanyDto.CompanyResponse> getAllCompaniesList();
}
