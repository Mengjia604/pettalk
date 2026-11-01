package com.pettalk.controller;

import com.pettalk.common.PageResult;
import com.pettalk.common.Result;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.dto.PostCreateRequest;
import com.pettalk.service.PostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/post")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public Result<Map<String, Long>> publish(@RequestBody PostCreateRequest request) {
        Long id = postService.publish(request);
        return Result.success(Map.of("id", id));
    }

    @GetMapping("/feed")
    public Result<PageResult<FeedItemVO>> getFeed(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) Long currentUserId) {
        return Result.success(postService.getFeed(page, size, currentUserId));
    }

    @GetMapping("/{postId}")
    public Result<FeedItemVO> getDetail(
            @PathVariable Long postId,
            @RequestParam(required = false) Long userId) {
        return Result.success(postService.getDetail(postId, userId));
    }
    
    @GetMapping("/post/detail/{postId}")
public Result<PostDetailVO> getPostDetail(@PathVariable Long postId, @RequestParam Long userId) {
    Post post = postService.getById(postId);
    Long likeCount = postLikeService.lambdaQuery()
            .eq(PostLike::getPostId, postId).count();
    boolean isLiked = postLikeService.lambdaQuery()
            .eq(PostLike::getPostId, postId)
            .eq(PostLike::getUserId, userId).exists();
    List<CommentVO> commentList = commentService.getCommentByPostId(postId);

    PostDetailVO vo = new PostDetailVO();
    vo.setPost(post);
    vo.setLikeCount(likeCount);
    vo.setLiked(isLiked);
    vo.setCommentTotal(commentList.size());
    vo.setCommentList(commentList);
    return Result.success(vo);
}
}
