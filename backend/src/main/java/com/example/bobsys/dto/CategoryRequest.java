package com.example.bobsys.dto;

import jakarta.validation.constraints.*;

public class CategoryRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotBlank
    @Pattern(regexp = "/(page|card(/sample)?|(banner|leaflet|sticker)(/samples)?|envelope|catalog|paper_magnet|name_tag|promotional_item|property)")
    private String pagePath;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPagePath() {
        return pagePath;
    }

    public void setPagePath(String pagePath) {
        this.pagePath = pagePath;
    }

}

