package com.example.petserver.post;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Post {
    private Long id;
    private Long userId;
    private Long petId;
    private String content;
    private String images; // 数据库里存 JSON 字符串
    private Integer likeCount;
    private Integer commentCount;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}