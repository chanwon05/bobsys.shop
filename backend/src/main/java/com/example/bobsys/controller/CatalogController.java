package com.example.bobsys.controller;

import com.example.bobsys.entity.Category;
import com.example.bobsys.entity.Product;
import com.example.bobsys.service.CatalogService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/products")
    public List<Product> products() {
        return catalog.getProducts();
    }

    @GetMapping("/categories")
    public List<Category> categories() {
        return catalog.getCategories();
    }
}

