package com.example.bobsys;

import com.example.bobsys.config.CategoryNameConstraintMigration;
import org.junit.jupiter.api.Test;
import javax.sql.DataSource;
import java.sql.*;
import static org.mockito.Mockito.*;

class CategoryNameConstraintMigrationTests {
    @Test
    void replacesOnlyTheOldNameIndexAfterAddingPageConstraint() throws Exception {
        var source = mock(DataSource.class);
        var connection = mock(Connection.class);
        var metadata = mock(DatabaseMetaData.class);
        var rows = mock(ResultSet.class);
        var statement = mock(Statement.class);
        when(source.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metadata);
        when(metadata.getDatabaseProductName()).thenReturn("MySQL");
        when(connection.getCatalog()).thenReturn("test");
        when(metadata.getIndexInfo("test", null, "categories", true, false)).thenReturn(rows);
        when(connection.createStatement()).thenReturn(statement);
        when(rows.next()).thenReturn(true, true, false);
        when(rows.getString("INDEX_NAME")).thenReturn("PRIMARY", "old_name_unique");
        when(rows.getString("COLUMN_NAME")).thenReturn("id", "name");
        new CategoryNameConstraintMigration(source).run(null);
        var order = inOrder(statement);
        order.verify(statement).execute("ALTER TABLE categories ADD CONSTRAINT uk_categories_page_name UNIQUE (page_path, name)");
        order.verify(statement).execute("ALTER TABLE categories DROP INDEX `old_name_unique`");
        verify(statement, times(2)).execute(anyString());
    }

    @Test
    void leavesAlreadyMigratedIndexesUntouched() throws Exception {
        var source = mock(DataSource.class);
        var connection = mock(Connection.class);
        var metadata = mock(DatabaseMetaData.class);
        var rows = mock(ResultSet.class);
        var statement = mock(Statement.class);
        when(source.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metadata);
        when(metadata.getDatabaseProductName()).thenReturn("MySQL");
        when(connection.getCatalog()).thenReturn("test");
        when(metadata.getIndexInfo("test", null, "categories", true, false)).thenReturn(rows);
        when(connection.createStatement()).thenReturn(statement);
        when(rows.next()).thenReturn(true, true, true, false);
        when(rows.getString("INDEX_NAME")).thenReturn("PRIMARY", "uk_categories_page_name", "uk_categories_page_name");
        when(rows.getString("COLUMN_NAME")).thenReturn("id", "page_path", "name");
        new CategoryNameConstraintMigration(source).run(null);
        verify(statement, never()).execute(anyString());
    }
}
