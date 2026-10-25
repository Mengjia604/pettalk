package com.pettalk.controller;

import com.pettalk.common.Result;
import com.pettalk.dto.UserProfileVO;
import com.pettalk.service.UserProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/{userId}/profile")
    public Result<UserProfileVO> getProfile(
            @PathVariable Long userId,
            @RequestParam(required = false) Long currentUserId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size) {
        return Result.success(userProfileService.getProfile(userId, currentUserId, page, size));
    }
}
