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

    @NotNull
    @Positive
    private Long categoryId;

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
