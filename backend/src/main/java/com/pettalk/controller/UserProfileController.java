package com.pettalk.controller;

import com.pettalk.common.PageResult;
import com.pettalk.common.Result;
import com.pettalk.dto.UserSummaryVO;
import com.pettalk.dto.UserProfileVO;
import com.pettalk.dto.UserProfileUpdateRequest;
import com.pettalk.service.FollowService;
import com.pettalk.service.UserProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final FollowService followService;

    public UserProfileController(UserProfileService userProfileService,
                                 FollowService followService) {
        this.userProfileService = userProfileService;
        this.followService = followService;
    }

    @GetMapping("/{userId}/profile")
    public Result<UserProfileVO> getProfile(
            @PathVariable Long userId,
            @RequestParam(required = false) Long currentUserId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size) {
        return Result.success(userProfileService.getProfile(userId, currentUserId, page, size));
    }

    @PutMapping("/profile")
    public Result<UserSummaryVO> updateProfile(
            @RequestBody UserProfileUpdateRequest request,
            @RequestAttribute("currentUserId") Long currentUserId) {
        return Result.success(userProfileService.updateProfile(currentUserId, request));
    }

    @GetMapping("/{userId}/following")
    public Result<PageResult<UserSummaryVO>> getFollowing(
            @PathVariable Long userId,
            @RequestParam(required = false) Long currentUserId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size) {
        return Result.success(followService.listFollowing(userId, currentUserId, page, size));
    }

    @GetMapping("/{userId}/followers")
    public Result<PageResult<UserSummaryVO>> getFollowers(
            @PathVariable Long userId,
            @RequestParam(required = false) Long currentUserId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size) {
        return Result.success(followService.listFollowers(userId, currentUserId, page, size));
    }
}
