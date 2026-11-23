package com.example.bobsys.repository;

import com.example.bobsys.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByNameIgnoreCase(String name);

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("update Category c set c.pagePath = '/property' where c.pagePath = '/propery'")
    int migratePropertyPagePath();
}
