package com.example.bobsys.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FrontendConfig implements WebMvcConfigurer {
    public static final String[] ROUTES = {
            "/", "/about", "/location", "/privacy", "/products", "/notice",
            "/page", "/portfolio", "/card", "/banner", "/leaflet", "/sticker",
            "/envelope", "/catalog", "/paper_magnet", "/name_tag", "/promotional_item", "/property",
            "/card/sample", "/card/samples", "/banner/samples", "/leaflet/samples", "/sticker/samples",
            "/admin", "/admin/products", "/admin/products/add", "/admin/products/edit/{id}",
            "/admin/samples", "/admin/samples/add", "/admin/samples/edit/{id}",
            "/admin/portfolios", "/admin/categories", "/admin/users", "/admin/notices"
    };

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String route : ROUTES) {
            registry.addViewController(route).setViewName("forward:/index.html");
        }
    }
}
