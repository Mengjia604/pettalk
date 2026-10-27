package com.pettalk.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentVO {
    private Long id;
    private Long postId;
    private Long userId;
    private String content;
    private LocalDateTime createTime;
    private String nickname;
    private String avatar;
}
