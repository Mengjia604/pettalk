package com.pettalk.controller;

import com.pettalk.common.PageResult;
import com.pettalk.common.Result;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.dto.PostCreateRequest;
import com.pettalk.dto.PostUpdateRequest;
import com.pettalk.service.PostService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestAttribute;
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
    public Result<Map<String, Long>> publish(
            @RequestBody PostCreateRequest request,
            @RequestAttribute("currentUserId") Long currentUserId) {
        Long id = postService.publish(request, currentUserId);
        return Result.success(Map.of("id", id));
    }

    @GetMapping("/feed")
    public Result<PageResult<FeedItemVO>> getFeed(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) Long currentUserId,
            @RequestParam(required = false) String keyword) {
        return Result.success(postService.getFeed(page, size, currentUserId, keyword));
    }

    @GetMapping("/hot")
    public Result<PageResult<FeedItemVO>> getHotFeed(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) Long currentUserId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long channelId) {
        return Result.success(postService.getHotFeed(page, size, currentUserId, keyword, channelId));
    }

    @GetMapping("/{postId}")
    public Result<FeedItemVO> getDetail(
            @PathVariable Long postId,
            @RequestParam(required = false) Long userId) {
        return Result.success(postService.getDetail(postId, userId));
    }

    @PutMapping("/{postId}")
    public Result<FeedItemVO> update(
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request,
            @RequestAttribute("currentUserId") Long currentUserId) {
        return Result.success(postService.updatePost(postId, request, currentUserId));
    }

    @DeleteMapping("/{postId}")
    public Result<Map<String, Object>> delete(
            @PathVariable Long postId,
            @RequestAttribute("currentUserId") Long currentUserId) {
        return Result.success(postService.deletePost(postId, currentUserId));
    }
}
