package com.pettalk.controller;

import com.pettalk.common.Result;
import com.pettalk.dto.PostDetailVO;
import com.pettalk.service.PostDetailService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/post")
public class PostDetailController {

    private final PostDetailService postDetailService;

    public PostDetailController(PostDetailService postDetailService) {
        this.postDetailService = postDetailService;
    }

    @GetMapping("/{postId}")
    public Result<PostDetailVO> getDetail(
            @PathVariable Long postId,
            @RequestParam(required = false) Long userId) {
        return Result.success(postDetailService.getDetail(postId, userId));
    }
}
