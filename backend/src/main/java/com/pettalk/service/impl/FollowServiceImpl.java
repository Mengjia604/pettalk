package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pettalk.common.PageResult;
import com.pettalk.dto.FollowRequest;
import com.pettalk.dto.UserSummaryVO;
import com.pettalk.entity.Follow;
import com.pettalk.entity.User;
import com.pettalk.mapper.FollowMapper;
import com.pettalk.mapper.UserMapper;
import com.pettalk.service.FollowService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FollowServiceImpl extends ServiceImpl<FollowMapper, Follow> implements FollowService {

    private static final long MAX_PAGE_SIZE = 50;

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

    @Override
    public PageResult<UserSummaryVO> listFollowing(Long userId, Long currentUserId, long page, long size) {
        return listUsers(userId, currentUserId, page, size, true);
    }

    @Override
    public PageResult<UserSummaryVO> listFollowers(Long userId, Long currentUserId, long page, long size) {
        return listUsers(userId, currentUserId, page, size, false);
    }

    private PageResult<UserSummaryVO> listUsers(Long userId,
                                                Long currentUserId,
                                                long page,
                                                long size,
                                                boolean followingList) {
        validateUserId(userId);
        if (currentUserId != null && currentUserId <= 0) {
            throw new IllegalArgumentException("当前用户 ID 不正确");
        }
        if (userMapper.selectById(userId) == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        long current = Math.max(page, 1);
        long pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        LambdaQueryWrapper<Follow> query = Wrappers.<Follow>lambdaQuery()
                .orderByDesc(Follow::getCreateTime)
                .orderByDesc(Follow::getId);
        if (followingList) {
            query.eq(Follow::getFollowerId, userId);
        } else {
            query.eq(Follow::getFolloweeId, userId);
        }
        IPage<Follow> followPage = baseMapper.selectPage(new Page<>(current, pageSize), query);

        List<Long> targetIds = followPage.getRecords().stream()
                .map(follow -> followingList ? follow.getFolloweeId() : follow.getFollowerId())
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (targetIds.isEmpty()) {
            return new PageResult<>(List.of(), current, pageSize, followPage.getTotal(), false);
        }

        Map<Long, User> userMap = userMapper.selectBatchIds(targetIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity(), (left, right) -> left));

        Set<Long> followedIds = Set.of();
        if (currentUserId != null) {
            followedIds = lambdaQuery()
                    .eq(Follow::getFollowerId, currentUserId)
                    .in(Follow::getFolloweeId, targetIds)
                    .list().stream()
                    .map(Follow::getFolloweeId)
                    .collect(Collectors.toSet());
        }
        Set<Long> currentFollowedIds = followedIds;

        List<UserSummaryVO> list = targetIds.stream()
                .map(userMap::get)
                .filter(Objects::nonNull)
                .map(user -> toUserSummary(user, currentUserId, currentFollowedIds))
                .toList();

        return new PageResult<>(
                list,
                current,
                pageSize,
                followPage.getTotal(),
                current * pageSize < followPage.getTotal());
    }

    private UserSummaryVO toUserSummary(User user, Long currentUserId, Set<Long> followedIds) {
        UserSummaryVO vo = new UserSummaryVO();
        vo.setId(user.getId());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setCover(user.getCover());
        vo.setBio(user.getBio());
        vo.setCreateTime(user.getCreateTime());
        if (currentUserId == null) {
            vo.setFollowing(null);
        } else {
            vo.setFollowing(!currentUserId.equals(user.getId())
                    && followedIds.contains(user.getId()));
        }
        return vo;
    }

    private void validateUsers(Long followerId, Long followeeId) {
        validateUserId(followerId);
        validateUserId(followeeId);
        if (followerId.equals(followeeId)) {
            throw new IllegalArgumentException("不能关注自己");
        }
        if (userMapper.selectById(followerId) == null || userMapper.selectById(followeeId) == null) {
            throw new IllegalArgumentException("用户不存在");
        }
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
    }
}
