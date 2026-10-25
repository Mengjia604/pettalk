package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pettalk.entity.Post;
import com.pettalk.entity.PostLike;
import com.pettalk.mapper.PostLikeMapper;
import com.pettalk.mapper.PostMapper;
import com.pettalk.mapper.UserMapper;
import com.pettalk.service.PostLikeService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class PostLikeServiceImpl extends ServiceImpl<PostLikeMapper, PostLike> implements PostLikeService {

    private final PostMapper postMapper;
    private final UserMapper userMapper;

    public PostLikeServiceImpl(PostMapper postMapper, UserMapper userMapper) {
        this.postMapper = postMapper;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public Map<String, Object> like(Long postId, Long userId) {
        validatePostAndUser(postId, userId);

        PostLike existing = lambdaQuery()
                .eq(PostLike::getPostId, postId)
                .eq(PostLike::getUserId, userId)
                .one();

        if (existing == null) {
            try {
                PostLike like = new PostLike();
                like.setPostId(postId);
                like.setUserId(userId);
                save(like);
                incrementLikeCount(postId, 1);
            } catch (DuplicateKeyException ignored) {
                // 并发重复点赞时保持幂等，不重复增加计数
            }
        }

        Post post = postMapper.selectById(postId);
        return Map.of("liked", true, "likeCount", post.getLikeCount() == null ? 0 : post.getLikeCount());
    }

    @Override
    @Transactional
    public Map<String, Object> unlike(Long postId, Long userId) {
        validatePostAndUser(postId, userId);

        int deleted = baseMapper.delete(Wrappers.<PostLike>lambdaQuery()
                .eq(PostLike::getPostId, postId)
                .eq(PostLike::getUserId, userId));

        if (deleted > 0) {
            incrementLikeCount(postId, -1);
        }

        Post post = postMapper.selectById(postId);
        return Map.of("liked", false, "likeCount", post.getLikeCount() == null ? 0 : post.getLikeCount());
    }

    private void validatePostAndUser(Long postId, Long userId) {
        if (postId == null || postId <= 0) {
            throw new IllegalArgumentException("动态 ID 不能为空");
        }
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
        if (postMapper.selectById(postId) == null) {
            throw new IllegalArgumentException("动态不存在");
        }
        if (userMapper.selectById(userId) == null) {
            throw new IllegalArgumentException("用户不存在");
        }
    }

    private void incrementLikeCount(Long postId, int delta) {
        String sql = delta > 0
                ? "like_count = like_count + 1"
                : "like_count = GREATEST(like_count - 1, 0)";
        postMapper.update(null, Wrappers.<Post>lambdaUpdate()
                .eq(Post::getId, postId)
                .setSql(sql));
    }
}
