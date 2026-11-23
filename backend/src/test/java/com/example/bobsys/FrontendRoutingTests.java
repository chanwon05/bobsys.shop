package com.example.bobsys;

import com.example.bobsys.config.FrontendConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class FrontendRoutingTests {
    @Value("${local.server.port}")
    private int port;

    private HttpResponse<String> get(String path) throws Exception {
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(
                URI.create("http://127.0.0.1:" + port + path)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void frontendRoutesServeHtmlIncludingAdminDeepLinks() throws Exception {
        for (String route : FrontendConfig.ROUTES) {
            var response = get(route.replace("{id}", "1"));
            assertEquals(200, response.statusCode(), route);
            assertTrue(response.body().contains("id=\"root\""), route);
        }
        assertEquals(200, get("/index.html").statusCode());
    }

    @Test
    void frontendAccessDoesNotExposeAdminApiOrConfiguration() throws Exception {
        for (String path : new String[]{"/api/admin/products", "/api/auth/me", "/api/unknown", "/application.properties", "/.env"}) {
            var response = get(path);
            assertTrue(response.statusCode() == 401 || response.statusCode() == 403, path);
            assertFalse(response.body().contains("id=\"root\""), path);
        }
    }
}
