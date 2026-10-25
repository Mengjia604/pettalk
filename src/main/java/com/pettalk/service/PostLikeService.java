package com.pettalk.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.pettalk.entity.PostLike;

import java.util.Map;

public interface PostLikeService extends IService<PostLike> {

    Map<String, Object> like(Long postId, Long userId);

    Map<String, Object> unlike(Long postId, Long userId);
}
