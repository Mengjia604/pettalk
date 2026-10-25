package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pettalk.dto.FollowRequest;
import com.pettalk.entity.Follow;
import com.pettalk.mapper.FollowMapper;
import com.pettalk.mapper.UserMapper;
import com.pettalk.service.FollowService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class FollowServiceImpl extends ServiceImpl<FollowMapper, Follow> implements FollowService {

    private final UserMapper userMapper;

    public FollowServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public Map<String, Object> follow(FollowRequest request) {
        validateUsers(request.getFollowerId(), request.getFolloweeId());

        Follow existing = lambdaQuery()
                .eq(Follow::getFollowerId, request.getFollowerId())
                .eq(Follow::getFolloweeId, request.getFolloweeId())
                .one();

        if (existing == null) {
            try {
                Follow follow = new Follow();
                follow.setFollowerId(request.getFollowerId());
                follow.setFolloweeId(request.getFolloweeId());
                save(follow);
            } catch (DuplicateKeyException ignored) {
                // 并发重复关注时保持幂等
            }
        }
        return Map.of("following", true);
    }

    @Override
    @Transactional
    public Map<String, Object> unfollow(Long followerId, Long followeeId) {
        validateUsers(followerId, followeeId);
        baseMapper.delete(Wrappers.<Follow>lambdaQuery()
                .eq(Follow::getFollowerId, followerId)
                .eq(Follow::getFolloweeId, followeeId));
        return Map.of("following", false);
    }

    private void validateUsers(Long followerId, Long followeeId) {
        if (followerId == null || followerId <= 0 || followeeId == null || followeeId <= 0) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
        if (followerId.equals(followeeId)) {
            throw new IllegalArgumentException("不能关注自己");
        }
        if (userMapper.selectById(followerId) == null || userMapper.selectById(followeeId) == null) {
            throw new IllegalArgumentException("用户不存在");
        }
    }
}
