package com.example.petserver.post.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FeedItemVO {
    private Long id;
    private Long userId;
    private String content;
    private List<String> images; // 转成数组返回给前端
    private Integer likeCount;
    private Integer commentCount;
    private LocalDateTime createdAt;
}