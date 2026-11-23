package com.example.bobsys.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 5000)
    private String description;

    @NotNull
    @Min(1)
    private Integer quantity;

    @DecimalMin("0")
    @Digits(integer = 12, fraction = 0)
    private BigDecimal singleSidePrice;

    @DecimalMin("0")
    @Digits(integer = 12, fraction = 0)
    private BigDecimal doubleSidePrice;

    @Size(max = 1000)
    private String imageUrl;

    @Positive
    private Long categoryId;

    @Pattern(regexp = "/(page|card(/sample)?|(banner|leaflet|sticker)(/samples)?|envelope|catalog|paper_magnet|name_tag|promotional_item|property)")
    private String pagePath;

    public String getPagePath() { return pagePath; }
    public void setPagePath(String pagePath) { this.pagePath = pagePath; }

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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSingleSidePrice() {
        return singleSidePrice;
    }

    public void setSingleSidePrice(BigDecimal singleSidePrice) {
        this.singleSidePrice = singleSidePrice;
    }

    public BigDecimal getDoubleSidePrice() {
        return doubleSidePrice;
    }

    public void setDoubleSidePrice(BigDecimal doubleSidePrice) {
        this.doubleSidePrice = doubleSidePrice;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

}
