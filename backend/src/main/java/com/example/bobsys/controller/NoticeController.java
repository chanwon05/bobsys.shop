package com.example.bobsys.controller;

import com.example.bobsys.entity.Notice;
import com.example.bobsys.repository.NoticeRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class NoticeController {
    private final NoticeRepository notices;

    public NoticeController(NoticeRepository notices) { this.notices = notices; }

    public record NoticeRequest(@NotBlank @Size(max = 200) String title,
                                @NotBlank @Size(max = 10000) String content) { }

    @GetMapping("/notices")
    public List<Notice> list() { return notices.findAllByOrderByCreatedAtDescIdDesc(); }

    @PostMapping("/admin/notices")
    @ResponseStatus(HttpStatus.CREATED)
    public Notice create(@Valid @RequestBody NoticeRequest request) {
        return save(new Notice(), request);
    }

    @PutMapping("/admin/notices/{id}")
    public Notice update(@PathVariable Long id, @Valid @RequestBody NoticeRequest request) {
        return save(find(id), request);
    }

    @DeleteMapping("/admin/notices/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { notices.delete(find(id)); }

    private Notice save(Notice notice, NoticeRequest request) {
        notice.setTitle(request.title().trim());
        notice.setContent(request.content().trim());
        return notices.save(notice);
    }

    private Notice find(Long id) {
        return notices.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "공지사항을 찾을 수 없습니다."));
    }
}
