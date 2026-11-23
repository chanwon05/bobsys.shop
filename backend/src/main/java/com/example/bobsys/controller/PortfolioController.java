package com.example.bobsys.controller;

import com.example.bobsys.entity.Portfolio;
import com.example.bobsys.repository.PortfolioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PortfolioController {
    private final PortfolioRepository portfolios;

    public PortfolioController(PortfolioRepository portfolios) { this.portfolios = portfolios; }

    public record PortfolioRequest(@NotBlank @Size(max = 200) String name,
                                   @NotBlank @Size(max = 1000)
                                   @Pattern(regexp = "/api/images/[0-9a-f-]{36}\\.(jpg|png)") String imageUrl,
                                   @Size(max = 5000) String description,
                                   @Size(max = 2000) String linkUrl) { }

    @GetMapping("/portfolios")
    public List<Portfolio> list() { return portfolios.findAllByOrderByIdDesc(); }

    @PostMapping("/admin/portfolios")
    @ResponseStatus(HttpStatus.CREATED)
    public Portfolio create(@Valid @RequestBody PortfolioRequest request) {
        return save(new Portfolio(), request);
    }

    @PutMapping("/admin/portfolios/{id}")
    public Portfolio update(@PathVariable Long id, @Valid @RequestBody PortfolioRequest request) {
        return save(find(id), request);
    }

    @DeleteMapping("/admin/portfolios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { portfolios.delete(find(id)); }

    private Portfolio save(Portfolio portfolio, PortfolioRequest request) {
        String linkUrl = request.linkUrl() == null ? "" : request.linkUrl().trim();
        if (!linkUrl.isEmpty()) {
            try {
                var uri = java.net.URI.create(linkUrl);
                if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                        || uri.getHost() == null || uri.getUserInfo() != null) {
                    throw new IllegalArgumentException();
                }
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "http:// 또는 https://로 시작하는 올바른 연결 URL을 입력해 주세요.");
            }
        }
        portfolio.setName(request.name().trim());
        portfolio.setImageUrl(request.imageUrl());
        portfolio.setDescription(request.description() == null ? "" : request.description().trim());
        portfolio.setLinkUrl(linkUrl.isEmpty() ? null : linkUrl);
        return portfolios.save(portfolio);
    }

    private Portfolio find(Long id) {
        return portfolios.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "포트폴리오를 찾을 수 없습니다."));
    }
}
