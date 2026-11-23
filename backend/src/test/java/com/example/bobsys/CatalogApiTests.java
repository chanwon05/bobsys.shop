package com.example.bobsys;

import com.example.bobsys.repository.CategoryRepository;
import com.example.bobsys.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class CatalogApiTests {

    @Value("${local.server.port}")
    private int port;

    @Autowired
    private ProductRepository products;

    @Autowired
    private CategoryRepository categories;

    @Autowired
    private javax.sql.DataSource dataSource;

    private final HttpClient client = HttpClient.newHttpClient();

    @Autowired
    private com.example.bobsys.repository.UserRepository users;
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwords;
    @Autowired
    private org.springframework.security.oauth2.jwt.JwtEncoder encoder;
    private String token;
    @Autowired
    private com.example.bobsys.repository.NoticeRepository notices;
    @Autowired
    private com.example.bobsys.repository.PortfolioRepository portfolios;

    @BeforeEach
    void clearCatalog() throws Exception {
        try (var connection = dataSource.getConnection()) {
            assertTrue(connection.getMetaData().getURL().startsWith("jdbc:h2:mem:bobsys-test"),
                    "테스트 데이터 정리는 전용 H2 메모리 DB에서만 허용됩니다.");
        }
        products.deleteAll();
        portfolios.deleteAll();
        notices.deleteAll();
        categories.deleteAll();
        users.deleteAll();
        var admin = new com.example.bobsys.entity.User();
        admin.setName("Test admin");
        admin.setUsername("admin");
        admin.setPasswordHash(passwords.encode("test-password"));
        admin.setRole("ADMIN");
        users.save(admin);
        var login = raw("POST", "/api/auth/login", "{\"username\":\"admin\",\"password\":\"test-password\"}", null);
        assertEquals(200, login.statusCode(), login.body());
        var match = Pattern.compile("\"accessToken\":\"([^\"]+)\"").matcher(login.body());
        assertTrue(match.find(), login.body());
        token = match.group(1);
    }

    @Test
    void savesPriceProductsByPageWithoutCategories() throws Exception {
        String body = "{\"name\":\"가격 상품\",\"quantity\":100,\"singleSidePrice\":10000,\"pagePath\":\"/card\"}";
        var created = call("POST", "/api/admin/products", body);
        assertEquals(201, created.statusCode(), created.body());
        long productId = id(created.body());
        assertNull(products.findById(productId).orElseThrow().getCategory());
        assertEquals("/card", products.findById(productId).orElseThrow().getPagePath());
        assertEquals(0, categories.count());
        var updated = call("PUT", "/api/admin/products/" + productId, body.replace("/card", "/banner"));
        assertEquals(200, updated.statusCode(), updated.body());
        assertEquals("/banner", products.findById(productId).orElseThrow().getPagePath());
        assertTrue(raw("GET", "/api/products", null, null).body().contains("\"pagePath\":\"/banner\""));
        assertEquals(400, call("POST", "/api/admin/products", body.replace("10000", "null")).statusCode());
        assertEquals(400, call("POST", "/api/admin/products", body.replace("/card", "/unknown")).statusCode());
        assertEquals(400, call("POST", "/api/admin/products", body.replace(",\"pagePath\":\"/card\"", "")).statusCode());
    }

    @Test
    void requiresMatchingCategoryOnlyForSamples() throws Exception {
        var category = call("POST", "/api/admin/categories", "{\"name\":\"샘플 분류\",\"pagePath\":\"/card/sample\"}");
        long categoryId = id(category.body());
        String body = "{\"name\":\"샘플\",\"quantity\":1,\"pagePath\":\"/card/sample\"}";
        assertEquals(400, call("POST", "/api/admin/products", body).statusCode());
        String categorized = body.replace("}", ",\"categoryId\":" + categoryId + "}");
        var created = call("POST", "/api/admin/products", categorized);
        assertEquals(201, created.statusCode(), created.body());
        assertNull(products.findById(id(created.body())).orElseThrow().getSingleSidePrice());
        assertEquals(400, call("POST", "/api/admin/products", categorized.replace("/card/sample", "/banner/samples")).statusCode());
    }

    @Test
    void preservesLegacyProductPageWhenRemovingCategoryOnEdit() throws Exception {
        long categoryId = createCategory("기존 명함");
        var category = categories.findById(categoryId).orElseThrow();
        var legacy = new com.example.bobsys.entity.Product("기존 상품", 100, java.math.BigDecimal.TEN, null, null, category);
        long productId = products.save(legacy).getId();
        assertEquals("/card", products.findById(productId).orElseThrow().getPagePath());
        String body = "{\"name\":\"기존 상품\",\"quantity\":100,\"singleSidePrice\":10,\"pagePath\":\"/card\"}";
        assertEquals(200, call("PUT", "/api/admin/products/" + productId, body).statusCode());
        assertNull(products.findById(productId).orElseThrow().getCategory());
        assertEquals("/card", products.findById(productId).orElseThrow().getPagePath());
    }

    @Test
    void createsOneOrTwoPricesAndRemovesOptionalPriceOnUpdate() throws Exception {
        long categoryId = createCategory("명함");
        var created = call("POST", "/api/admin/products", product(categoryId, "0", "null"));
        assertEquals(201, created.statusCode(), created.body());
        long productId = id(created.body());
        assertNull(products.findById(productId).orElseThrow().getDoubleSidePrice());

        var updated = call("PUT", "/api/admin/products/" + productId, product(categoryId, "20000", "25000"));
        assertEquals(200, updated.statusCode(), updated.body());
        assertNotNull(products.findById(productId).orElseThrow().getDoubleSidePrice());

        updated = call("PUT", "/api/admin/products/" + productId, product(categoryId, "null", "25000"));
        assertEquals(200, updated.statusCode(), updated.body());
        assertNull(products.findById(productId).orElseThrow().getSingleSidePrice());
        assertEquals(204, call("DELETE", "/api/admin/products/" + productId, null).statusCode());
        assertEquals(404, call("GET", "/api/admin/products/" + productId, null).statusCode());
    }

    @Test
    void managesProductsOnSeparatePriceAndSamplePages() throws Exception {
        String[] pricePaths = {"/card", "/banner", "/leaflet", "/sticker"};
        String[] samplePaths = {"/card/sample", "/banner/samples", "/leaflet/samples", "/sticker/samples"};
        for (int index = 0; index < pricePaths.length; index++) {
            var priceCategory = call("POST", "/api/admin/categories",
                    "{\"name\":\"가격 분류 " + index + "\",\"pagePath\":\"" + pricePaths[index] + "\"}");
            var sampleCategory = call("POST", "/api/admin/categories",
                    "{\"name\":\"샘플 분류 " + index + "\",\"pagePath\":\"" + samplePaths[index] + "\"}");
            assertEquals(201, priceCategory.statusCode(), priceCategory.body());
            assertEquals(201, sampleCategory.statusCode(), sampleCategory.body());
            var priceProduct = call("POST", "/api/admin/products", product(id(priceCategory.body()), "10000", "null"));
            var sampleProduct = call("POST", "/api/admin/products", product(id(sampleCategory.body()), "null", "null"));
            assertEquals(201, priceProduct.statusCode(), priceProduct.body());
            assertEquals(201, sampleProduct.statusCode(), sampleProduct.body());
            assertNull(products.findById(id(sampleProduct.body())).orElseThrow().getSingleSidePrice());
            assertNull(products.findById(id(sampleProduct.body())).orElseThrow().getDoubleSidePrice());
            var fetched = call("GET", "/api/admin/products/" + id(sampleProduct.body()), null);
            assertEquals(200, fetched.statusCode());
            assertTrue(fetched.body().contains("\"pagePath\":\"" + samplePaths[index] + "\""));
            var updated = call("PUT", "/api/admin/products/" + id(sampleProduct.body()),
                    product(id(sampleCategory.body()), "null", "null"));
            assertEquals(200, updated.statusCode(), updated.body());
            var movedWithoutPrice = call("PUT", "/api/admin/products/" + id(sampleProduct.body()),
                    product(id(priceCategory.body()), "null", "null"));
            assertEquals(400, movedWithoutPrice.statusCode(), movedWithoutPrice.body());
            var pricedSample = call("PUT", "/api/admin/products/" + id(sampleProduct.body()),
                    product(id(sampleCategory.body()), "20000", "30000"));
            assertEquals(200, pricedSample.statusCode(), pricedSample.body());
            assertNull(products.findById(id(sampleProduct.body())).orElseThrow().getSingleSidePrice());
            assertNull(products.findById(id(sampleProduct.body())).orElseThrow().getDoubleSidePrice());
        }
        var publicProducts = raw("GET", "/api/products", null, null);
        assertEquals(200, publicProducts.statusCode());
        assertEquals(8, products.count());
        for (String path : pricePaths) assertTrue(publicProducts.body().contains("\"pagePath\":\"" + path + "\""));
        for (String path : samplePaths) assertTrue(publicProducts.body().contains("\"pagePath\":\"" + path + "\""));
        assertEquals(400, call("POST", "/api/admin/categories",
                "{\"name\":\"잘못된 샘플 경로\",\"pagePath\":\"/banner/sample\"}").statusCode());
    }

    @Test
    void migratesPropertyCategoryAndAcceptsCorrectedPath() throws Exception {
        var category = new com.example.bobsys.entity.Category("기존 부동산", "");
        category.setPagePath("/propery");
        long categoryId = categories.save(category).getId();
        var created = call("POST", "/api/admin/products", product(categoryId, "10000", "null"));
        assertEquals(201, created.statusCode(), created.body());
        new com.example.bobsys.config.CategoryPagePathMigration(categories).run(null);
        assertEquals("/property", categories.findById(categoryId).orElseThrow().getPagePath());
        assertTrue(raw("GET", "/api/products", null, null).body().contains("/property"));
        assertEquals(0, categories.migratePropertyPagePath());
        assertEquals(201, call("POST", "/api/admin/categories", "{\"name\":\"새 부동산\",\"pagePath\":\"/property\"}").statusCode());
        assertEquals(400, call("POST", "/api/admin/categories", "{\"name\":\"잘못된 경로\",\"pagePath\":\"/propery\"}").statusCode());
    }

    @Test
    void rejectsMissingNegativeFractionalPricesAndInvalidQuantity() throws Exception {
        long categoryId = createCategory("명함");
        assertEquals(400, call("POST", "/api/admin/products", product(categoryId, "null", "null")).statusCode());
        assertEquals(400, call("POST", "/api/admin/products", product(categoryId, "-1", "null")).statusCode());
        assertEquals(400, call("POST", "/api/admin/products", product(categoryId, "1.5", "null")).statusCode());
        String invalidQuantity = product(categoryId, "10000", "null").replace("\"quantity\":200", "\"quantity\":0");
        assertEquals(400, call("POST", "/api/admin/products", invalidQuantity).statusCode());
        assertEquals(404, call("POST", "/api/admin/products", product(999999L, "10000", "null")).statusCode());
        assertEquals(0, products.count());
    }

    @Test
    void allowsSameCategoryNameOnDifferentPagesButRejectsSamePageDuplicates() throws Exception {
        long priceId = createCategory("부동산");
        String sample = "{\"name\":\" 부동산 \",\"pagePath\":\"/card/sample\"}";
        var created = call("POST", "/api/admin/categories", sample);
        assertEquals(201, created.statusCode(), created.body());
        long sampleId = id(created.body());
        assertEquals(409, call("POST", "/api/admin/categories", sample).statusCode());
        assertEquals(200, call("PUT", "/api/admin/categories/" + sampleId, sample).statusCode());
        assertEquals(409, call("PUT", "/api/admin/categories/" + sampleId, sample.replace("/card/sample", "/card")).statusCode());
        assertEquals("/card", categories.findById(priceId).orElseThrow().getPagePath());
        assertEquals("/card/sample", categories.findById(sampleId).orElseThrow().getPagePath());
        assertEquals(200, call("PUT", "/api/admin/categories/" + sampleId, sample.replace("/card/sample", "/banner/samples")).statusCode());
        assertEquals(2, categories.count());
        var duplicate = new com.example.bobsys.entity.Category("부동산", "");
        duplicate.setPagePath("/card");
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class, () -> categories.saveAndFlush(duplicate));
        long englishId = createCategory("Estate");
        assertEquals(409, call("POST", "/api/admin/categories", "{\"name\":\" estate \",\"pagePath\":\"/card\"}").statusCode());
        assertTrue(categories.existsById(englishId));
    }

    @Test
    void protectsUsedCategoriesAndRejectsDuplicateRename() throws Exception {
        long first = createCategory("명함");
        long second = createCategory("스티커");
        var duplicate = call("PUT", "/api/admin/categories/" + second,
                "{\"name\":\" 명함 \",\"description\":\"\",\"pagePath\":\"/card\"}");
        assertEquals(409, duplicate.statusCode());
        var renamed = call("PUT", "/api/admin/categories/" + second,
                "{\"name\":\"종이 스티커\",\"description\":\"변경\",\"pagePath\":\"/sticker\"}");
        assertEquals(200, renamed.statusCode());
        assertEquals("/sticker", categories.findById(second).orElseThrow().getPagePath());
        assertEquals(201, call("POST", "/api/admin/products", product(first, "10000", "null")).statusCode());
        assertEquals(409, call("DELETE", "/api/admin/categories/" + first, null).statusCode());
        assertEquals(204, call("DELETE", "/api/admin/categories/" + second, null).statusCode());
    }

    @Test
    void publicCatalogListsProductsWithoutStatus() throws Exception {
        long categoryId = createCategory("명함");
        var created = call("POST", "/api/admin/products", product(categoryId, "10000", "null"));
        assertEquals(201, created.statusCode(), created.body());
        assertFalse(created.body().contains("\"status\""));
        var publicList = raw("GET", "/api/products", null, null);
        var adminList = call("GET", "/api/admin/products", null);
        assertEquals(200, publicList.statusCode());
        assertEquals(200, adminList.statusCode());
        assertEquals(adminList.body(), publicList.body());
        assertTrue(publicList.body().contains("테스트 상품"));
        assertFalse(publicList.body().contains("\"status\""));
        try (var connection = dataSource.getConnection();
             var columns = connection.getMetaData().getColumns(null, null, "PRODUCTS", "STATUS")) {
            assertFalse(columns.next());
        }
    }

    @Test
    void dashboardCountsMatchStoredDataAndUsersAreReadable() throws Exception {
        createCategory("명함");
        var counts = call("GET", "/api/admin/dashboard", null);
        assertEquals(200, counts.statusCode());
        assertTrue(counts.body().contains("\"products\":0"));
        assertTrue(counts.body().contains("\"categories\":1"));
        assertTrue(counts.body().contains("\"users\":1"));
        var response = call("GET", "/api/admin/users", null).body();
        assertTrue(response.contains("\"username\":\"admin\""));
        assertNull(users.findByUsername("admin").orElseThrow().getEmail());
        assertFalse(response.contains("password"));
        assertFalse(response.contains("$2"));
    }

    private long createCategory(String name) throws Exception {
        var response = call("POST", "/api/admin/categories",
                "{\"name\":\"" + name + "\",\"description\":\"테스트\",\"pagePath\":\"/card\"}");
        assertEquals(201, response.statusCode(), response.body());
        return id(response.body());
    }

    @Test
    void adminManagesNoticesAndPublicCanReadFullContent() throws Exception {
        assertEquals("[]", raw("GET", "/api/notices", null, null).body());
        var created = call("POST", "/api/admin/notices", "{\"title\":\"첫 공지\",\"content\":\"첫 줄\\n둘째 줄\"}");
        assertEquals(201, created.statusCode(), created.body());
        long noticeId = id(created.body());
        assertEquals("첫 줄\n둘째 줄", notices.findById(noticeId).orElseThrow().getContent());
        var second = call("POST", "/api/admin/notices", "{\"title\":\"최신 공지\",\"content\":\"내용\"}");
        assertEquals(201, second.statusCode());
        var list = raw("GET", "/api/notices", null, null);
        assertEquals(200, list.statusCode());
        assertTrue(list.body().indexOf("최신 공지") < list.body().indexOf("첫 공지"));
        var updated = call("PUT", "/api/admin/notices/" + noticeId, "{\"title\":\"변경 공지\",\"content\":\"수정 내용\"}");
        assertEquals(200, updated.statusCode());
        assertTrue(raw("GET", "/api/notices", null, null).body().contains("수정 내용"));
        assertEquals(204, call("DELETE", "/api/admin/notices/" + noticeId, null).statusCode());
        assertFalse(notices.existsById(noticeId));
        assertEquals(404, call("DELETE", "/api/admin/notices/" + noticeId, null).statusCode());
        assertEquals(404, call("PUT", "/api/admin/notices/" + noticeId, "{\"title\":\"제목\",\"content\":\"내용\"}").statusCode());
    }

    @Test
    void rejectsInvalidNoticesAndUnauthorizedWrites() throws Exception {
        assertEquals(400, call("POST", "/api/admin/notices", "{\"title\":\"  \",\"content\":\"내용\"}").statusCode());
        assertEquals(400, call("POST", "/api/admin/notices", "{\"title\":\"제목\",\"content\":\"\"}").statusCode());
        assertEquals(400, call("POST", "/api/admin/notices", "{\"title\":\"" + "a".repeat(201) + "\",\"content\":\"내용\"}").statusCode());
        assertEquals(400, call("POST", "/api/admin/notices", "{\"title\":\"제목\",\"content\":\"" + "a".repeat(10001) + "\"}").statusCode());
        for (String method : new String[]{"POST", "PUT", "DELETE"}) {
            String path = "/api/admin/notices" + (method.equals("POST") ? "" : "/1");
            assertEquals(401, raw(method, path, "{}", null).statusCode());
        }
        var admin = users.findByUsername("admin").orElseThrow();
        admin.setRole("USER");
        users.save(admin);
        for (String method : new String[]{"POST", "PUT", "DELETE"}) {
            String path = "/api/admin/notices" + (method.equals("POST") ? "" : "/1");
            assertEquals(403, call(method, path, "{}").statusCode());
        }
        assertEquals(0, notices.count());
    }

    @Test
    void adminManagesPortfoliosAndPublicCanReadThem() throws Exception {
        String imageUrl = "/api/images/00000000-0000-0000-0000-000000000001.png";
        String body = "{\"name\":\" 포트폴리오 이름 \",\"imageUrl\":\"" + imageUrl + "\",\"description\":\" 제작 설명 \"}";
        var created = call("POST", "/api/admin/portfolios", body);
        assertEquals(201, created.statusCode(), created.body());
        long portfolioId = id(created.body());
        assertEquals("포트폴리오 이름", portfolios.findById(portfolioId).orElseThrow().getName());
        assertEquals("제작 설명", portfolios.findById(portfolioId).orElseThrow().getDescription());
        var second = call("POST", "/api/admin/portfolios", body.replace("포트폴리오 이름", "새 포트폴리오"));
        assertEquals(201, second.statusCode());
        var listed = raw("GET", "/api/portfolios", null, null);
        assertEquals(200, listed.statusCode(), listed.body());
        assertTrue(listed.body().contains(imageUrl));
        assertEquals(id(second.body()), id(listed.body()));
        var updated = call("PUT", "/api/admin/portfolios/" + portfolioId, body.replace("제작 설명", "수정 설명"));
        assertEquals(200, updated.statusCode(), updated.body());
        assertEquals(imageUrl, portfolios.findById(portfolioId).orElseThrow().getImageUrl());
        assertTrue(updated.body().contains("수정 설명"));
        assertEquals(204, call("DELETE", "/api/admin/portfolios/" + portfolioId, null).statusCode());
        assertFalse(portfolios.existsById(portfolioId));
        assertEquals(404, call("PUT", "/api/admin/portfolios/" + portfolioId, body).statusCode());
        assertEquals(404, call("DELETE", "/api/admin/portfolios/" + portfolioId, null).statusCode());
    }

    @Test
    void savesUpdatesAndClearsPortfolioLinks() throws Exception {
        String body = "{\"name\":\"링크 테스트\",\"imageUrl\":\"/api/images/00000000-0000-0000-0000-000000000001.png\",\"linkUrl\":\" https://example.com/work?q=1 \"}";
        var created = call("POST", "/api/admin/portfolios", body);
        assertEquals(201, created.statusCode(), created.body());
        long portfolioId = id(created.body());
        assertEquals("https://example.com/work?q=1", portfolios.findById(portfolioId).orElseThrow().getLinkUrl());
        assertTrue(raw("GET", "/api/portfolios", null, null).body().contains("https://example.com/work?q=1"));
        var updated = call("PUT", "/api/admin/portfolios/" + portfolioId, body.replace(" https://example.com/work?q=1 ", "http://example.com"));
        assertEquals(200, updated.statusCode());
        assertEquals("http://example.com", portfolios.findById(portfolioId).orElseThrow().getLinkUrl());
        for (String invalid : new String[]{"javascript:alert(1)", "data:text/html,test", "/relative", "https://", "https://user:pass@example.com", "https://example.com/" + "a".repeat(2000)}) {
            assertEquals(400, call("PUT", "/api/admin/portfolios/" + portfolioId,
                    body.replace(" https://example.com/work?q=1 ", invalid)).statusCode());
        }
        assertEquals("http://example.com", portfolios.findById(portfolioId).orElseThrow().getLinkUrl());
        assertEquals(200, call("PUT", "/api/admin/portfolios/" + portfolioId, body.replace(" https://example.com/work?q=1 ", "")).statusCode());
        assertNull(portfolios.findById(portfolioId).orElseThrow().getLinkUrl());
    }

    @Test
    void rejectsInvalidPortfoliosAndUnauthorizedWrites() throws Exception {
        String body = "{\"name\":\"이름\",\"imageUrl\":\"/api/images/00000000-0000-0000-0000-000000000001.png\",\"description\":\"설명\"}";
        assertEquals(400, call("POST", "/api/admin/portfolios", body.replace("이름", " ")).statusCode());
        assertEquals(400, call("POST", "/api/admin/portfolios", body.replace("이름", "a".repeat(201))).statusCode());
        assertEquals(400, call("POST", "/api/admin/portfolios", body.replace("설명", "a".repeat(5001))).statusCode());
        assertEquals(400, call("POST", "/api/admin/portfolios", "{\"name\":\"이름\"}").statusCode());
        assertEquals(400, call("POST", "/api/admin/portfolios", body.replace("/api/images/", "https://example.com/")).statusCode());
        for (String method : new String[]{"POST", "PUT", "DELETE"}) {
            String path = "/api/admin/portfolios" + (method.equals("POST") ? "" : "/1");
            assertEquals(401, raw(method, path, body, null).statusCode());
        }
        var admin = users.findByUsername("admin").orElseThrow();
        admin.setRole("USER");
        users.save(admin);
        for (String method : new String[]{"POST", "PUT", "DELETE"}) {
            String path = "/api/admin/portfolios" + (method.equals("POST") ? "" : "/1");
            assertEquals(403, call(method, path, body).statusCode());
        }
        assertEquals(0, portfolios.count());
    }

    private String product(long categoryId, String single, String dual) {
        return "{\"name\":\"테스트 상품\",\"description\":\"설명\",\"quantity\":200,"
                + "\"singleSidePrice\":" + single + ",\"doubleSidePrice\":" + dual + ","
                + "\"imageUrl\":\"/images/test.jpg\",\"categoryId\":" + categoryId + "}";
    }

    private long id(String json) {
        var root = new tools.jackson.databind.json.JsonMapper().readTree(json);
        var value = (root.isArray() ? root.get(0) : root).get("id");
        assertNotNull(value, json);
        return value.asLong();
    }

    private HttpResponse<String> call(String method, String path, String json) throws Exception {
        return raw(method, path, json, token);
    }

    @Test
    void protectsAdminAndUploadsButAllowsPublicCatalog() throws Exception {
        for (String path : new String[]{"/api/admin/dashboard", "/api/admin/products", "/api/admin/users", "/api/auth/me"}) {
            assertEquals(401, raw("GET", path, null, null).statusCode(), path);
        }
        assertEquals(401, raw("POST", "/api/admin/categories", "{}", null).statusCode());
        assertEquals(401, raw("POST", "/api/admin/images", null, null).statusCode());
        assertEquals(200, raw("GET", "/api/products", null, null).statusCode());
        assertEquals(200, call("GET", "/api/auth/me", null).statusCode());
    }

    @Test
    void rejectsIncorrectCredentialsAndNonAdminAccounts() throws Exception {
        assertEquals(401, raw("POST", "/api/auth/login", "{\"username\":\"admin\",\"password\":\"wrong\"}", null).statusCode());
        assertEquals(401, raw("POST", "/api/auth/login", "{\"username\":\"missing\",\"password\":\"wrong\"}", null).statusCode());
        var admin = users.findByUsername("admin").orElseThrow();
        admin.setRole("USER");
        users.save(admin);
        assertEquals(401, raw("POST", "/api/auth/login", "{\"username\":\"admin\",\"password\":\"test-password\"}", null).statusCode());
        assertEquals(403, call("GET", "/api/admin/dashboard", null).statusCode());
    }

    @Test
    void rejectsExpiredAndTamperedTokens() throws Exception {
        var now = java.time.Instant.now();
        var claims = org.springframework.security.oauth2.jwt.JwtClaimsSet.builder().issuer("bobsys")
                .subject("admin").issuedAt(now.minusSeconds(7200)).expiresAt(now.minusSeconds(3600)).build();
        String expired = encoder.encode(org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader.with(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build(), claims)).getTokenValue();
        assertEquals(401, raw("GET", "/api/admin/dashboard", null, expired).statusCode());
        String[] parts = token.split("\\.");
        String tampered = parts[0] + "." + parts[1] + "." + (parts[2].startsWith("a") ? "b" : "a") + parts[2].substring(1);
        assertEquals(401, raw("GET", "/api/admin/dashboard", null, tampered).statusCode());
    }

    private HttpResponse<String> raw(String method, String path, String json, String bearer) throws Exception {
        var body = json == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(json);
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .header("Content-Type", "application/json").method(method, body);
        if (bearer != null) request.header("Authorization", "Bearer " + bearer);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}

