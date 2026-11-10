package com.pettalk.dto;

import lombok.Data;

import java.util.List;

@Data
public class PostUpdateRequest {
    private Long petId;
    private Long channelId;
    private String content;
    private List<String> images;
}
