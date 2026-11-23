package com.example.bobsys.config;

import com.example.bobsys.repository.CategoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class CategoryPagePathMigration implements ApplicationRunner {
    private final CategoryRepository categories;

    public CategoryPagePathMigration(CategoryRepository categories) { this.categories = categories; }

    @Override
    public void run(ApplicationArguments args) { categories.migratePropertyPagePath(); }
}
