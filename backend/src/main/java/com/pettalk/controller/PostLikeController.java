package com.pettalk.controller;

import com.pettalk.common.Result;
import com.pettalk.dto.LikeRequest;
import com.pettalk.service.PostLikeService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/post/{postId}/like")
public class PostLikeController {

    private final PostLikeService postLikeService;

    public PostLikeController(PostLikeService postLikeService) {
        this.postLikeService = postLikeService;
    }

    @PostMapping
    public Result<Map<String, Object>> like(@PathVariable Long postId, @RequestBody LikeRequest request) {
        return Result.success(postLikeService.like(postId, request.getUserId()));
    }

    @DeleteMapping
    public Result<Map<String, Object>> unlike(@PathVariable Long postId, @RequestParam Long userId) {
        return Result.success(postLikeService.unlike(postId, userId));
    }
}
