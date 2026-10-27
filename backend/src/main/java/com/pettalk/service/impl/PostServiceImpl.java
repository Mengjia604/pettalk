package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pettalk.common.PageResult;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.dto.PostCreateRequest;
import com.pettalk.entity.Follow;
import com.pettalk.entity.Post;
import com.pettalk.entity.PostLike;
import com.pettalk.entity.User;
import com.pettalk.mapper.FollowMapper;
import com.pettalk.mapper.PostLikeMapper;
import com.pettalk.mapper.PostMapper;
import com.pettalk.mapper.UserMapper;
import com.pettalk.service.PostService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl extends ServiceImpl<PostMapper, Post> implements PostService {

    private static final long MAX_PAGE_SIZE = 50;
    private static final int MAX_IMAGE_COUNT = 9;

    private final PostLikeMapper postLikeMapper;
    private final UserMapper userMapper;
    private final FollowMapper followMapper;

    public PostServiceImpl(PostLikeMapper postLikeMapper,
                           UserMapper userMapper,
                           FollowMapper followMapper) {
        this.postLikeMapper = postLikeMapper;
        this.userMapper = userMapper;
        this.followMapper = followMapper;
    }

    @Override
    @Transactional
    public Long publish(PostCreateRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }

        String content = request.getContent() == null ? null : request.getContent().trim();
        List<String> images = request.getImages() == null
                ? List.of()
                : request.getImages().stream()
                .filter(image -> image != null && !image.isBlank())
                .toList();

        if (images.size() > MAX_IMAGE_COUNT) {
            throw new IllegalArgumentException("最多只能上传9张图片");
        }
        if ((content == null || content.isEmpty()) && images.isEmpty()) {
            throw new IllegalArgumentException("动态内容和图片不能同时为空");
        }

        Post post = new Post();
        post.setUserId(request.getUserId());
        post.setPetId(request.getPetId());
        post.setContent(content == null || content.isEmpty() ? null : content);
        post.setImages(images);
        post.setLikeCount(0);
        post.setCommentCount(0);
        save(post);
        return post.getId();
    }

    @Override
    public PageResult<FeedItemVO> getFeed(long page, long size, Long currentUserId) {
        long current = Math.max(page, 1);
        long pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        IPage<Post> postPage = lambdaQuery()
                .orderByDesc(Post::getCreateTime)
                .orderByDesc(Post::getId)
                .page(new Page<>(current, pageSize));

        List<Post> posts = postPage.getRecords();
        Map<Long, User> authorMap = loadAuthors(posts);
        Set<Long> likedPostIds = loadLikedPostIds(posts, currentUserId);
        List<FeedItemVO> list = posts.stream()
                .map(post -> toFeedItemVO(
                        post,
                        authorMap.get(post.getUserId()),
                        likedPostIds.contains(post.getId()),
                        null))
                .toList();

        return new PageResult<>(
                list,
                current,
                pageSize,
                postPage.getTotal(),
                current * pageSize < postPage.getTotal());
    }

    @Override
    public FeedItemVO getDetail(Long postId, Long currentUserId) {
        if (postId == null || postId <= 0) {
            throw new IllegalArgumentException("动态 ID 不能为空");
        }
        if (currentUserId != null && currentUserId <= 0) {
            throw new IllegalArgumentException("当前用户 ID 不正确");
        }

        Post post = getById(postId);
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
            if (currentUserId.equals(post.getUserId())) {
                following = false;
            } else {
                following = followMapper.selectCount(Wrappers.<Follow>lambdaQuery()
                        .eq(Follow::getFollowerId, currentUserId)
                        .eq(Follow::getFolloweeId, post.getUserId())) > 0;
            }
        }

        return toFeedItemVO(post, author, liked, following);
    }

    private Map<Long, User> loadAuthors(List<Post> posts) {
        List<Long> userIds = posts.stream()
                .map(Post::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (userIds.isEmpty()) {
            return Map.of();
        }
        return userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private Set<Long> loadLikedPostIds(List<Post> posts, Long currentUserId) {
        if (currentUserId == null || posts.isEmpty()) {
            return Set.of();
        }
        List<Long> postIds = posts.stream()
                .map(Post::getId)
                .filter(Objects::nonNull)
                .toList();
        if (postIds.isEmpty()) {
            return Set.of();
        }
        return postLikeMapper.selectList(Wrappers.<PostLike>lambdaQuery()
                        .eq(PostLike::getUserId, currentUserId)
                        .in(PostLike::getPostId, postIds))
                .stream()
                .map(PostLike::getPostId)
                .collect(Collectors.toSet());
    }

    private FeedItemVO toFeedItemVO(Post post,
                                    User author,
                                    Boolean liked,
                                    Boolean following) {
        FeedItemVO vo = new FeedItemVO();
        vo.setId(post.getId());
        vo.setUserId(post.getUserId());
        vo.setPetId(post.getPetId());
        vo.setContent(post.getContent());
        vo.setImages(post.getImages() == null ? List.of() : post.getImages());
        vo.setLikeCount(post.getLikeCount() == null ? 0 : post.getLikeCount());
        vo.setCommentCount(post.getCommentCount() == null ? 0 : post.getCommentCount());
        vo.setCreatedAt(post.getCreateTime());
        vo.setNickname(author == null ? null : author.getNickname());
        vo.setAvatar(author == null ? null : author.getAvatar());
        vo.setLiked(liked);
        vo.setFollowing(following);
        return vo;
    }
}
