package com.pettalk.service;

import com.pettalk.dto.PostDetailVO;

public interface PostDetailService {

    PostDetailVO getDetail(Long postId, Long currentUserId);
}
