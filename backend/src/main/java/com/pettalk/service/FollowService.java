package com.pettalk.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.pettalk.common.PageResult;
import com.pettalk.dto.FollowRequest;
import com.pettalk.dto.UserSummaryVO;
import com.pettalk.entity.Follow;

import java.util.Map;

public interface FollowService extends IService<Follow> {

    Map<String, Object> follow(FollowRequest request);

    Map<String, Object> unfollow(Long followerId, Long followeeId);

    PageResult<UserSummaryVO> listFollowing(Long userId, Long currentUserId, long page, long size);

    PageResult<UserSummaryVO> listFollowers(Long userId, Long currentUserId, long page, long size);
}
