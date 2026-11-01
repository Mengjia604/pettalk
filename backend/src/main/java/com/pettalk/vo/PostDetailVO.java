package com.pettalk.vo;

import com.pettalk.entity.Post;
import java.util.List;

public class PostDetailVO {
    private Post post;
    private Long likeCount;
    private Boolean isLiked;
    private Integer commentTotal;
    private List<CommentVO> commentList;

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;
    }

    public Boolean getLiked() {
        return isLiked;
    }

    public void setLiked(Boolean liked) {
        isLiked = liked;
    }

    public Integer getCommentTotal() {
        return commentTotal;
    }

    public void setCommentTotal(Integer commentTotal) {
        this.commentTotal = commentTotal;
    }

    public List<CommentVO> getCommentList() {
        return commentList;
    }

    public void setCommentList(List<CommentVO> commentList) {
        this.commentList = commentList;
    }
}
