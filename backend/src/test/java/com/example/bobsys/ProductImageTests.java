package com.example.bobsys;

import com.example.bobsys.service.ProductImageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class ProductImageTests {

    @TempDir
    Path directory;

    @Test
    void savesJpegAndPngAndReadsAfterServiceRestart() throws Exception {
        for (String format : new String[]{"jpeg", "png"}) {
            var output = new ByteArrayOutputStream();
            ImageIO.write(new BufferedImage(20, 30, BufferedImage.TYPE_INT_RGB), format, output);
            var service = new ProductImageService(directory.toString());
            String url = service.save(new MockMultipartFile("file", "../../photo", "image/" + format, output.toByteArray()));
            assertTrue(url.startsWith("/api/images/"));
            var resource = new ProductImageService(directory.toString()).get(url.substring("/api/images/".length()));
            try (var input = resource.getInputStream()) {
                var image = ImageIO.read(input);
                assertEquals(20, image.getWidth());
                assertEquals(30, image.getHeight());
            }
        }
    }

    @Test
    void rejectsEmptyFakeAndOversizedImages() {
        var service = new ProductImageService(directory.toString());
        for (byte[] bytes : new byte[][]{new byte[0], "not an image".getBytes(), new byte[5 * 1024 * 1024 + 1]}) {
            assertThrows(ResponseStatusException.class, () -> service.save(
                    new MockMultipartFile("file", "image.png", "image/png", bytes)));
        }
    }

    @Test
    void rejectsTraversalAndMissingFiles() {
        var service = new ProductImageService(directory.toString());
        assertThrows(ResponseStatusException.class, () -> service.get("../application.properties"));
        assertThrows(ResponseStatusException.class, () -> service.get("00000000-0000-0000-0000-000000000000.png"));
    }
}
