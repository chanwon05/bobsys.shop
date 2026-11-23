package com.example.bobsys.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;

@Service
public class ProductImageService {

    private final Path directory;

    public ProductImageService(@Value("${app.upload-directory:uploads/products}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
    }

    public String save(MultipartFile file) {
        if (file.isEmpty()) throw invalid("이미지 파일을 선택해 주세요.");
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "이미지는 최대 5MB까지 업로드할 수 있습니다.");
        }
        Path destination = null;
        try (var stream = file.getInputStream();
             var input = ImageIO.createImageInputStream(stream)) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw invalid("올바른 JPG 또는 PNG 이미지 파일을 선택해 주세요.");
            var reader = readers.next();
            try {
                reader.setInput(input);
                String format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!format.equals("jpeg") && !format.equals("png")) {
                    throw invalid("JPG 또는 PNG 이미지만 지원합니다.");
                }
                if ((long) reader.getWidth(0) * reader.getHeight(0) > 40_000_000) {
                    throw invalid("이미지 해상도는 4천만 화소 이하로 선택해 주세요.");
                }
                var image = reader.read(0);
                Files.createDirectories(directory);
                String filename = UUID.randomUUID() + (format.equals("jpeg") ? ".jpg" : ".png");
                destination = directory.resolve(filename);
                // 원본 이름을 사용하지 않고 이미지 내용만 다시 인코딩하여 저장합니다.
                if (!ImageIO.write(image, format, destination.toFile())) {
                    throw new IOException("Image writer unavailable");
                }
                return "/api/images/" + filename;
            } finally {
                reader.dispose();
            }
        } catch (javax.imageio.IIOException exception) {
            throw invalid("손상된 이미지 파일입니다. 다른 파일을 선택해 주세요.");
        } catch (IOException exception) {
            if (destination != null) {
                try { Files.deleteIfExists(destination); } catch (IOException ignored) { }
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지를 저장하지 못했습니다. 다시 시도해 주세요.");
        }
    }

    public Resource get(String filename) {
        if (!filename.matches("[0-9a-f-]{36}\\.(jpg|png)")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다.");
        }
        Path path = directory.resolve(filename).normalize();
        if (!path.startsWith(directory) || !Files.isRegularFile(path)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다.");
        }
        try {
            return new UrlResource(path.toUri());
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다.");
        }
    }

    private ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
