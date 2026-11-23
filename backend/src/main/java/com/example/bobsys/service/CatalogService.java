package com.example.bobsys.service;

import com.example.bobsys.dto.CategoryRequest;
import com.example.bobsys.dto.ProductRequest;
import com.example.bobsys.entity.*;
import com.example.bobsys.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final UserRepository users;

    public CatalogService(ProductRepository products, CategoryRepository categories, UserRepository users) {
        this.products = products;
        this.categories = categories;
        this.users = users;
    }

    public List<Product> getProducts() {
        return products.findAll();
    }

    public List<Category> getCategories() {
        return categories.findAll();
    }

    public List<User> getUsers() {
        return users.findAll();
    }

    public Map<String, Long> getCounts() {
        return Map.of("products", products.count(), "categories", categories.count(), "users", users.count());
    }

    public Product getProduct(Long id) {
        return products.findById(id).orElseThrow(() -> missing("상품"));
    }

    private Category getCategory(Long id) {
        return categories.findById(id).orElseThrow(() -> missing("카테고리"));
    }

    @Transactional
    public Product saveProduct(Long id, ProductRequest request) {
        Category category = request.getCategoryId() == null ? null : getCategory(request.getCategoryId());
        String pagePath = request.getPagePath() != null ? request.getPagePath()
                : category == null ? null : category.getPagePath();
        if (pagePath == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "페이지를 선택해 주세요.");
        }
        boolean sample = java.util.Arrays.asList("/card/sample", "/banner/samples", "/leaflet/samples", "/sticker/samples")
                .contains(pagePath);
        if (sample && (category == null || !pagePath.equals(category.getPagePath()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "선택한 샘플 페이지의 카테고리를 선택해 주세요.");
        }
        if (!sample && request.getSingleSidePrice() == null && request.getDoubleSidePrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "가격을 최소 하나 입력해 주세요.");
        }
        Product product = id == null ? new Product() : getProduct(id);
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setQuantity(request.getQuantity());
        product.setSingleSidePrice(sample ? null : request.getSingleSidePrice());
        product.setDoubleSidePrice(sample ? null : request.getDoubleSidePrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
        product.setPagePath(sample ? null : request.getPagePath());
        if (request.getPagePath() != null && !sample) product.setCategory(null);
        return products.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        products.delete(getProduct(id));
    }

    @Transactional
    public Category saveCategory(Long id, CategoryRequest request) {
        Category category = id == null ? new Category() : getCategory(id);
        String name = request.getName().trim();
        if (categories.findAll().stream().anyMatch(existing ->
                request.getPagePath().equals(existing.getPagePath())
                        && existing.getName().equalsIgnoreCase(name) && !existing.getId().equals(id))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이 페이지에 이미 등록된 카테고리 이름입니다.");
        }
        category.setName(name);
        category.setDescription(request.getDescription());
        category.setPagePath(request.getPagePath());
        return categories.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategory(id);
        if (products.existsByCategoryId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "상품이 있는 카테고리는 삭제할 수 없습니다. 상품을 먼저 이동하거나 삭제해 주세요.");
        }
        categories.delete(category);
    }

    private ResponseStatusException missing(String name) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, name + "을 찾을 수 없습니다.");
    }
}

