package com.example.bobsys.controller;

import com.example.bobsys.dto.*;
import com.example.bobsys.entity.*;
import com.example.bobsys.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CatalogService catalog;

    public AdminController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/dashboard")
    public Map<String, Long> dashboard() { return catalog.getCounts(); }

    @GetMapping("/users")
    public List<User> users() { return catalog.getUsers(); }

    @GetMapping("/products")
    public List<Product> products() { return catalog.getProducts(); }

    @GetMapping("/products/{id}")
    public Product product(@PathVariable Long id) { return catalog.getProduct(id); }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(@Valid @RequestBody ProductRequest request) {
        return catalog.saveProduct(null, request);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return catalog.saveProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) { catalog.deleteProduct(id); }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public Category createCategory(@Valid @RequestBody CategoryRequest request) {
        return catalog.saveCategory(null, request);
    }

    @PutMapping("/categories/{id}")
    public Category updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return catalog.saveCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) { catalog.deleteCategory(id); }
}

