package com.example.bobsys.controller;

import com.example.bobsys.service.ProductImageService;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductImageController {

    private final ProductImageService images;

    public ProductImageController(ProductImageService images) {
        this.images = images;
    }

    @PostMapping(value = "/admin/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        return Map.of("imageUrl", images.save(file));
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> image(@PathVariable String filename) {
        Resource resource = images.get(filename);
        return ResponseEntity.ok()
                .header("X-Content-Type-Options", "nosniff")
                .contentType(filename.endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG)
                .body(resource);
    }
}
