package com.example.bobsys.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 12, scale = 0)
    private BigDecimal singleSidePrice;

    @Column(precision = 12, scale = 0)
    private BigDecimal doubleSidePrice;

    @Column(length = 5000)
    private String description;

    @Column(length = 1000)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Product() {
    }

    public Product(String name, Integer quantity, BigDecimal singleSidePrice, BigDecimal doubleSidePrice, String imageUrl , Category category){
        this.name = name;
        this.quantity= quantity;
        this.singleSidePrice = singleSidePrice;
        this.doubleSidePrice = doubleSidePrice;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

    public Integer getQuantity(){
        return quantity;
    }

    public void setQuantity(Integer quantity){
        this.quantity = quantity;
    }

    public BigDecimal getSingleSidePrice(){
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
