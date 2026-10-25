package com.example.petserver.post.dto;

import lombok.Data;
import java.util.List;

@Data
public class PostCreateDTO {
    private String content;
    private List<String> images;
    private Long petId;
}