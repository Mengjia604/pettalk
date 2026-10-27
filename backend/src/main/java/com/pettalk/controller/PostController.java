package com.pettalk.controller;

import com.pettalk.common.PageResult;
import com.pettalk.common.Result;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.dto.PostCreateRequest;
import com.pettalk.service.PostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/post")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public Result<Map<String, Long>> publish(@RequestBody PostCreateRequest request) {
        Long id = postService.publish(request);
        return Result.success(Map.of("id", id));
    }

    @GetMapping("/feed")
    public Result<PageResult<FeedItemVO>> getFeed(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) Long currentUserId) {
        return Result.success(postService.getFeed(page, size, currentUserId));
    }

    @GetMapping("/{postId}")
    public Result<FeedItemVO> getDetail(
            @PathVariable Long postId,
            @RequestParam(required = false) Long userId) {
        return Result.success(postService.getDetail(postId, userId));
    }
}
