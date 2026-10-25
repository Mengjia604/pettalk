package com.pettalk.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostDetailVO {
    private Long id;
    private Long userId;
    private Long petId;
    private String content;
    private List<String> images;
    private Integer likeCount;
    private Integer commentCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String nickname;
    private String avatar;
    private Boolean liked;
    private Boolean following;
}
