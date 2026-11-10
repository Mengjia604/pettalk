package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pettalk.common.PageResult;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.dto.PostCreateRequest;
import com.pettalk.dto.PostUpdateRequest;
import com.pettalk.entity.Channel;
import com.pettalk.entity.ChannelMember;
import com.pettalk.entity.Comment;
import com.pettalk.entity.Follow;
import com.pettalk.entity.Post;
import com.pettalk.entity.PostLike;
import com.pettalk.entity.User;
import com.pettalk.mapper.ChannelMapper;
import com.pettalk.mapper.ChannelMemberMapper;
import com.pettalk.mapper.CommentMapper;
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

    private final ChannelMapper channelMapper;
    private final ChannelMemberMapper channelMemberMapper;
    private final CommentMapper commentMapper;
    private final PostLikeMapper postLikeMapper;
    private final UserMapper userMapper;
    private final FollowMapper followMapper;

    public PostServiceImpl(ChannelMapper channelMapper,
                           ChannelMemberMapper channelMemberMapper,
                           CommentMapper commentMapper,
                           PostLikeMapper postLikeMapper,
                           UserMapper userMapper,
                           FollowMapper followMapper) {
        this.channelMapper = channelMapper;
        this.channelMemberMapper = channelMemberMapper;
        this.commentMapper = commentMapper;
        this.postLikeMapper = postLikeMapper;
        this.userMapper = userMapper;
        this.followMapper = followMapper;
    }

    @Override
    @Transactional
    public Long publish(PostCreateRequest request, Long currentUserId) {
        if (currentUserId == null) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }
        if (request == null) {
            throw new IllegalArgumentException("请求参数不能为空");
        }

        String content = normalizeContent(request.getContent());
        List<String> images = normalizeImages(request.getImages());
        validateContentAndImages(content, images);
        validateChannelForPublish(request.getChannelId(), currentUserId);

        Post post = new Post();
        post.setUserId(currentUserId);
        post.setPetId(request.getPetId());
        post.setChannelId(request.getChannelId());
        post.setContent(content);
        post.setImages(images);
        post.setLikeCount(0);
        post.setCommentCount(0);
        save(post);
        return post.getId();
    }

    @Override
    public PageResult<FeedItemVO> getFeed(long page, long size, Long currentUserId, String keyword) {
        return queryFeed(page, size, currentUserId, keyword, null, false);
    }

    @Override
    public PageResult<FeedItemVO> getHotFeed(long page,
                                             long size,
                                             Long currentUserId,
                                             String keyword,
                                             Long channelId) {
        return queryFeed(page, size, currentUserId, keyword, channelId, true);
    }

    @Override
    public PageResult<FeedItemVO> getChannelFeed(Long channelId,
                                                 long page,
                                                 long size,
                                                 Long currentUserId) {
        if (channelId == null || channelId <= 0) {
            throw new IllegalArgumentException("频道 ID 不正确");
        }
        return queryFeed(page, size, currentUserId, null, channelId, false);
    }

    private PageResult<FeedItemVO> queryFeed(long page,
                                             long size,
                                             Long currentUserId,
                                             String keyword,
                                             Long channelId,
                                             boolean hot) {
        long current = Math.max(page, 1);
        long pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        String searchKeyword = normalizeKeyword(keyword);
        IPage<Post> postPage = lambdaQuery()
                .like(searchKeyword != null, Post::getContent, searchKeyword)
                .eq(channelId != null, Post::getChannelId, channelId)
                .orderByDesc(hot, Post::getLikeCount)
                .orderByDesc(hot, Post::getCommentCount)
                .orderByDesc(Post::getCreateTime)
                .orderByDesc(Post::getId)
                .page(new Page<>(current, pageSize));

        List<Post> posts = postPage.getRecords();
        Map<Long, User> authorMap = loadAuthors(posts);
        Map<Long, Channel> channelMap = loadChannels(posts);
        Set<Long> likedPostIds = loadLikedPostIds(posts, currentUserId);
        List<FeedItemVO> list = posts.stream()
                .map(post -> toFeedItemVO(
                        post,
                        authorMap.get(post.getUserId()),
                        post.getChannelId() == null ? null : channelMap.get(post.getChannelId()),
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

        Channel channel = post.getChannelId() == null
                ? null
                : channelMapper.selectById(post.getChannelId());
        return toFeedItemVO(post, author, channel, liked, following);
    }

    @Override
    @Transactional
    public FeedItemVO updatePost(Long postId, PostUpdateRequest request, Long currentUserId) {
        Post existing = requirePost(postId);
        requireOwner(existing, currentUserId, "无权修改该动态");
        if (request == null) {
            throw new IllegalArgumentException("请求参数不能为空");
        }

        String content = request.getContent() == null
                ? normalizeContent(existing.getContent())
                : normalizeContent(request.getContent());
        List<String> images = request.getImages() == null
                ? normalizeImages(existing.getImages())
                : normalizeImages(request.getImages());
        validateContentAndImages(content, images);

        Post update = new Post();
        update.setId(postId);
        update.setContent(content);
        update.setImages(images);
        if (request.getPetId() != null) {
            if (request.getPetId() <= 0) {
                throw new IllegalArgumentException("宠物 ID 不正确");
            }
            update.setPetId(request.getPetId());
        }
        if (request.getChannelId() != null) {
            validateChannelForPublish(request.getChannelId(), currentUserId);
            update.setChannelId(request.getChannelId());
        }
        updateById(update);
        return getDetail(postId, currentUserId);
    }

    @Override
    @Transactional
    public Map<String, Object> deletePost(Long postId, Long currentUserId) {
        Post existing = requirePost(postId);
        requireOwner(existing, currentUserId, "无权删除该动态");

        List<String> images = existing.getImages() == null
                ? List.of()
                : List.copyOf(existing.getImages());

        commentMapper.delete(Wrappers.<Comment>lambdaQuery()
                .eq(Comment::getPostId, postId));
        postLikeMapper.delete(Wrappers.<PostLike>lambdaQuery()
                .eq(PostLike::getPostId, postId));
        removeById(postId);

        return Map.of("id", postId, "images", images);
    }

    private Post requirePost(Long postId) {
        if (postId == null || postId <= 0) {
            throw new IllegalArgumentException("动态 ID 不能为空");
        }
        Post post = getById(postId);
        if (post == null) {
            throw new IllegalArgumentException("动态不存在");
        }
        return post;
    }

    private void requireOwner(Post post, Long currentUserId, String message) {
        if (currentUserId == null || !Objects.equals(post.getUserId(), currentUserId)) {
            throw new IllegalArgumentException(message);
        }
    }

    private String normalizeContent(String content) {
        if (content == null) {
            return null;
        }
        String trimmed = content.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }
        String trimmed = keyword.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return trimmed.length() > 50 ? trimmed.substring(0, 50) : trimmed;
    }

    private List<String> normalizeImages(List<String> images) {
        if (images == null) {
            return List.of();
        }
        List<String> normalized = images.stream()
                .filter(image -> image != null && !image.isBlank())
                .map(String::trim)
                .toList();
        if (normalized.size() > MAX_IMAGE_COUNT) {
            throw new IllegalArgumentException("最多只能上传9张图片");
        }
        return normalized;
    }

    private void validateContentAndImages(String content, List<String> images) {
        if (content == null && images.isEmpty()) {
            throw new IllegalArgumentException("动态内容和图片不能同时为空");
        }
    }

    private void validateChannelForPublish(Long channelId, Long currentUserId) {
        if (channelId == null) {
            return;
        }
        if (channelId <= 0 || channelMapper.selectById(channelId) == null) {
            throw new IllegalArgumentException("频道不存在");
        }
        long memberCount = channelMemberMapper.selectCount(Wrappers.<ChannelMember>lambdaQuery()
                .eq(ChannelMember::getChannelId, channelId)
                .eq(ChannelMember::getUserId, currentUserId));
        if (memberCount == 0) {
            throw new IllegalArgumentException("请先加入频道后再发帖");
        }
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

    private Map<Long, Channel> loadChannels(List<Post> posts) {
        List<Long> channelIds = posts.stream()
                .map(Post::getChannelId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (channelIds.isEmpty()) {
            return Map.of();
        }
        return channelMapper.selectBatchIds(channelIds).stream()
                .collect(Collectors.toMap(Channel::getId, Function.identity()));
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
                                    Channel channel,
                                    Boolean liked,
                                    Boolean following) {
        FeedItemVO vo = new FeedItemVO();
        vo.setId(post.getId());
        vo.setUserId(post.getUserId());
        vo.setPetId(post.getPetId());
        vo.setChannelId(post.getChannelId());
        vo.setChannelName(channel == null ? null : channel.getName());
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
