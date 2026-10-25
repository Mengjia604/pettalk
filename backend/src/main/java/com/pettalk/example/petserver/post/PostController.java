package com.example.petserver.post;

import com.example.petserver.common.PageResult;
import com.example.petserver.common.Result;
import com.example.petserver.post.dto.PostCreateDTO;
import com.example.petserver.post.vo.FeedItemVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/post")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // 1. 发布动态
    @PostMapping
    public Result<Map<String, Long>> create(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestBody PostCreateDTO dto) {
        // 本周临时方案：先看请求头 X-User-Id，没有就默认用户1
        Long userId = headerUserId == null ? 1L : headerUserId;
        Long id = postService.create(userId, dto);
        return Result.ok(Map.of("id", id));
    }

    // 2. 首页信息流
    @GetMapping("/feed")
    public Result<PageResult<FeedItemVO>> feed(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.ok(postService.feed(page, size));
    }

    // 3. 动态详情 (方便3号对接)
    @GetMapping("/{id}")
    public Result<FeedItemVO> detail(@PathVariable Long id) {
        return Result.ok(postService.detail(id));
    }
}