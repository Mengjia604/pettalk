package com.pettalk.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.pettalk.common.Result;
import com.pettalk.dto.CommentCreateRequest;
import com.pettalk.dto.CommentVO;
import com.pettalk.service.CommentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/comment")
    public Result<CommentVO> create(@RequestBody CommentCreateRequest request) {
        return Result.success(commentService.create(request));
    }

    @GetMapping("/post/{postId}/comments")
    public Result<IPage<CommentVO>> listByPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size) {
        return Result.success(commentService.listByPostId(postId, page, size));
    }
}
