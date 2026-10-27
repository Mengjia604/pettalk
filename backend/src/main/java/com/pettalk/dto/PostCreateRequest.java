package com.pettalk.dto;

import lombok.Data;

import java.util.List;

@Data
public class PostCreateRequest {
    private Long userId;
    private Long petId;
    private String content;
    private List<String> images;
}
