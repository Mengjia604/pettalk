package com.pettalk.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.pettalk.common.PageResult;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.dto.PostCreateRequest;
import com.pettalk.dto.PostUpdateRequest;
import com.pettalk.entity.Post;

import java.util.Map;

public interface PostService extends IService<Post> {

    Long publish(PostCreateRequest request, Long currentUserId);

    PageResult<FeedItemVO> getFeed(long page, long size, Long currentUserId, String keyword);

    PageResult<FeedItemVO> getHotFeed(long page,
                                      long size,
                                      Long currentUserId,
                                      String keyword,
                                      Long channelId);

    PageResult<FeedItemVO> getChannelFeed(Long channelId, long page, long size, Long currentUserId);

    FeedItemVO getDetail(Long postId, Long currentUserId);

    FeedItemVO updatePost(Long postId, PostUpdateRequest request, Long currentUserId);

    Map<String, Object> deletePost(Long postId, Long currentUserId);
}
