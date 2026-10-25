package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pettalk.dto.CommentCreateRequest;
import com.pettalk.dto.CommentVO;
import com.pettalk.entity.Comment;
import com.pettalk.entity.Post;
import com.pettalk.entity.User;
import com.pettalk.mapper.CommentMapper;
import com.pettalk.mapper.PostMapper;
import com.pettalk.mapper.UserMapper;
import com.pettalk.service.CommentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    private static final long MAX_PAGE_SIZE = 50;

    private final PostMapper postMapper;
    private final UserMapper userMapper;

    public CommentServiceImpl(PostMapper postMapper, UserMapper userMapper) {
        this.postMapper = postMapper;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public CommentVO create(CommentCreateRequest request) {
        validatePostAndUser(request.getPostId(), request.getUserId());

        String content = request.getContent() == null ? null : request.getContent().trim();
        if (content == null || content.isEmpty()) {
            throw new IllegalArgumentException("评论内容不能为空");
        }
        if (content.length() > 512) {
            throw new IllegalArgumentException("评论内容不能超过 512 个字符");
        }

        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setUserId(request.getUserId());
        comment.setContent(content);
        save(comment);

        postMapper.update(null, Wrappers.<Post>lambdaUpdate()
                .eq(Post::getId, request.getPostId())
                .setSql("comment_count = comment_count + 1"));

        return toVO(getById(comment.getId()), userMapper.selectById(request.getUserId()));
    }

    @Override
    public IPage<CommentVO> listByPostId(Long postId, long page, long size) {
        if (postId == null || postId <= 0 || postMapper.selectById(postId) == null) {
            throw new IllegalArgumentException("动态不存在");
        }

        long current = Math.max(page, 1);
        long pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Page<Comment> commentPage = lambdaQuery()
                .eq(Comment::getPostId, postId)
                .orderByDesc(Comment::getCreateTime)
                .orderByDesc(Comment::getId)
                .page(new Page<>(current, pageSize));

        List<Long> userIds = commentPage.getRecords().stream()
                .map(Comment::getUserId)
                .distinct()
                .toList();
        Map<Long, User> userMap = userIds.isEmpty()
                ? Collections.emptyMap()
                : userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity(), (left, right) -> left));

        Page<CommentVO> result = new Page<>(commentPage.getCurrent(), commentPage.getSize(), commentPage.getTotal());
        result.setRecords(commentPage.getRecords().stream()
                .map(comment -> toVO(comment, userMap.get(comment.getUserId())))
                .toList());
        return result;
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

    private CommentVO toVO(Comment comment, User user) {
        CommentVO vo = new CommentVO();
        vo.setId(comment.getId());
        vo.setPostId(comment.getPostId());
        vo.setUserId(comment.getUserId());
        vo.setContent(comment.getContent());
        vo.setCreateTime(comment.getCreateTime());
        vo.setNickname(user == null ? null : user.getNickname());
        vo.setAvatar(user == null ? null : user.getAvatar());
        return vo;
    }
}
