package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.pettalk.dto.PostDetailVO;
import com.pettalk.entity.Follow;
import com.pettalk.entity.Post;
import com.pettalk.entity.PostLike;
import com.pettalk.entity.User;
import com.pettalk.mapper.FollowMapper;
import com.pettalk.mapper.PostLikeMapper;
import com.pettalk.mapper.PostMapper;
import com.pettalk.mapper.UserMapper;
import com.pettalk.service.PostDetailService;
import org.springframework.stereotype.Service;

@Service
public class PostDetailServiceImpl implements PostDetailService {

    private final PostMapper postMapper;
    private final UserMapper userMapper;
    private final PostLikeMapper postLikeMapper;
    private final FollowMapper followMapper;

    public PostDetailServiceImpl(PostMapper postMapper,
                                 UserMapper userMapper,
                                 PostLikeMapper postLikeMapper,
                                 FollowMapper followMapper) {
        this.postMapper = postMapper;
        this.userMapper = userMapper;
        this.postLikeMapper = postLikeMapper;
        this.followMapper = followMapper;
    }

    @Override
    public PostDetailVO getDetail(Long postId, Long currentUserId) {
        if (postId == null || postId <= 0) {
            throw new IllegalArgumentException("动态 ID 不能为空");
        }
        if (currentUserId != null && currentUserId <= 0) {
            throw new IllegalArgumentException("当前用户 ID 不正确");
        }

        Post post = postMapper.selectById(postId);
        if (post == null) {
            throw new IllegalArgumentException("动态不存在");
        }

        User author = userMapper.selectById(post.getUserId());
        Boolean liked = null;
        Boolean following = null;
        if (currentUserId != null) {
            liked = postLikeMapper.selectCount(Wrappers.<PostLike>lambdaQuery()
                    .eq(PostLike::getPostId, postId)
                    .eq(PostLike::getUserId, currentUserId)) > 0;
            if (!currentUserId.equals(post.getUserId())) {
                following = followMapper.selectCount(Wrappers.<Follow>lambdaQuery()
                        .eq(Follow::getFollowerId, currentUserId)
                        .eq(Follow::getFolloweeId, post.getUserId())) > 0;
            } else {
                following = false;
            }
        }

        PostDetailVO result = new PostDetailVO();
        result.setId(post.getId());
        result.setUserId(post.getUserId());
        result.setPetId(post.getPetId());
        result.setContent(post.getContent());
        result.setImages(post.getImages());
        result.setLikeCount(post.getLikeCount());
        result.setCommentCount(post.getCommentCount());
        result.setCreateTime(post.getCreateTime());
        result.setUpdateTime(post.getUpdateTime());
        result.setNickname(author == null ? null : author.getNickname());
        result.setAvatar(author == null ? null : author.getAvatar());
        result.setLiked(liked);
        result.setFollowing(following);
        return result;
    }
}
