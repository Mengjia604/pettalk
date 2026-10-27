package com.pettalk.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.pettalk.common.PageResult;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.dto.PostCreateRequest;
import com.pettalk.entity.Post;

public interface PostService extends IService<Post> {

    Long publish(PostCreateRequest request);

    PageResult<FeedItemVO> getFeed(long page, long size, Long currentUserId);

    FeedItemVO getDetail(Long postId, Long currentUserId);
}
