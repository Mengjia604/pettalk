package com.pettalk.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.pettalk.dto.CommentCreateRequest;
import com.pettalk.dto.CommentVO;
import com.pettalk.entity.Comment;

public interface CommentService extends IService<Comment> {

    CommentVO create(CommentCreateRequest request);

    IPage<CommentVO> listByPostId(Long postId, long page, long size);
}
