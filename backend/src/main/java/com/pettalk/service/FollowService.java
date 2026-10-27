package com.pettalk.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.pettalk.dto.FollowRequest;
import com.pettalk.entity.Follow;

import java.util.Map;

public interface FollowService extends IService<Follow> {

    Map<String, Object> follow(FollowRequest request);

    Map<String, Object> unfollow(Long followerId, Long followeeId);
}
