package com.pettalk.controller;

import com.pettalk.common.Result;
import com.pettalk.dto.FollowRequest;
import com.pettalk.service.FollowService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping
    public Result<Map<String, Object>> follow(@RequestBody FollowRequest request) {
        return Result.success(followService.follow(request));
    }

    @DeleteMapping
    public Result<Map<String, Object>> unfollow(
            @RequestParam Long followerId,
            @RequestParam Long followeeId) {
        return Result.success(followService.unfollow(followerId, followeeId));
    }
}
