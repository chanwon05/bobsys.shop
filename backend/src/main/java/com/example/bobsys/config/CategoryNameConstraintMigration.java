package com.example.bobsys.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.*;

@Component
public class CategoryNameConstraintMigration implements ApplicationRunner {
    private final DataSource dataSource;

    public CategoryNameConstraintMigration(DataSource dataSource) { this.dataSource = dataSource; }

    @Override
    public void run(ApplicationArguments args) throws SQLException {
        try (var connection = dataSource.getConnection()) {
            if (!"MySQL".equalsIgnoreCase(connection.getMetaData().getDatabaseProductName())) return;
            Map<String, List<String>> indexes = new LinkedHashMap<>();
            try (var rows = connection.getMetaData().getIndexInfo(connection.getCatalog(), null, "categories", true, false)) {
                while (rows.next()) {
                    String index = rows.getString("INDEX_NAME");
                    String column = rows.getString("COLUMN_NAME");
                    if (index != null && column != null) {
                        indexes.computeIfAbsent(index, ignored -> new ArrayList<>()).add(column.toLowerCase(Locale.ROOT));
                    }
                }
            }
            // ddl-auto=update adds the new constraint but leaves the old name-only index behind.
            // Install page/name uniqueness before removing the obsolete index; retain all rows.
            try (var statement = connection.createStatement()) {
                if (indexes.values().stream().noneMatch(columns -> columns.size() == 2
                        && columns.containsAll(List.of("page_path", "name")))) {
                    statement.execute("ALTER TABLE categories ADD CONSTRAINT uk_categories_page_name UNIQUE (page_path, name)");
                }
                for (var index : indexes.entrySet()) {
                    if (index.getValue().equals(List.of("name"))) {
                        statement.execute("ALTER TABLE categories DROP INDEX `" + index.getKey().replace("`", "``") + "`");
                    }
                }
            }
        }
    }
}
