package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pettalk.dto.UserProfileVO;
import com.pettalk.dto.UserSummaryVO;
import com.pettalk.entity.Follow;
import com.pettalk.entity.Pet;
import com.pettalk.entity.Post;
import com.pettalk.entity.User;
import com.pettalk.mapper.FollowMapper;
import com.pettalk.mapper.PetMapper;
import com.pettalk.mapper.PostMapper;
import com.pettalk.mapper.UserMapper;
import com.pettalk.service.UserProfileService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private static final long MAX_PAGE_SIZE = 50;

    private final UserMapper userMapper;
    private final PetMapper petMapper;
    private final PostMapper postMapper;
    private final FollowMapper followMapper;

    public UserProfileServiceImpl(UserMapper userMapper,
                                  PetMapper petMapper,
                                  PostMapper postMapper,
                                  FollowMapper followMapper) {
        this.userMapper = userMapper;
        this.petMapper = petMapper;
        this.postMapper = postMapper;
        this.followMapper = followMapper;
    }

    @Override
    public UserProfileVO getProfile(Long userId, Long currentUserId, long page, long size) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
        if (currentUserId != null && currentUserId <= 0) {
            throw new IllegalArgumentException("当前用户 ID 不正确");
        }

        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }

        long current = Math.max(page, 1);
        long pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        UserSummaryVO summary = new UserSummaryVO();
        summary.setId(user.getId());
        summary.setNickname(user.getNickname());
        summary.setAvatar(user.getAvatar());
        summary.setBio(user.getBio());
        summary.setCreateTime(user.getCreateTime());

        List<Pet> pets = petMapper.selectList(Wrappers.<Pet>lambdaQuery()
                .eq(Pet::getUserId, userId)
                .orderByDesc(Pet::getCreateTime)
                .orderByDesc(Pet::getId));

        long postCount = postMapper.selectCount(Wrappers.<Post>lambdaQuery()
                .eq(Post::getUserId, userId));
        long followingCount = followMapper.selectCount(Wrappers.<Follow>lambdaQuery()
                .eq(Follow::getFollowerId, userId));
        long followerCount = followMapper.selectCount(Wrappers.<Follow>lambdaQuery()
                .eq(Follow::getFolloweeId, userId));

        Boolean following = null;
        if (currentUserId != null) {
            following = !currentUserId.equals(userId)
                    && followMapper.selectCount(Wrappers.<Follow>lambdaQuery()
                    .eq(Follow::getFollowerId, currentUserId)
                    .eq(Follow::getFolloweeId, userId)) > 0;
        }

        IPage<Post> posts = postMapper.selectPage(new Page<>(current, pageSize),
                Wrappers.<Post>lambdaQuery()
                        .eq(Post::getUserId, userId)
                        .orderByDesc(Post::getCreateTime)
                        .orderByDesc(Post::getId));

        UserProfileVO result = new UserProfileVO();
        result.setUser(summary);
        result.setPets(pets);
        result.setPostCount(postCount);
        result.setFollowingCount(followingCount);
        result.setFollowerCount(followerCount);
        result.setFollowing(following);
        result.setPosts(posts);
        return result;
    }
}
