package com.pettalk.service;

import com.pettalk.common.PageResult;
import com.pettalk.dto.ChannelVO;
import com.pettalk.dto.FeedItemVO;

import java.util.List;

public interface ChannelService {

    List<ChannelVO> listChannels(Long currentUserId);

    List<ChannelVO> getHomeChannels(Long currentUserId);

    List<ChannelVO> listMyChannels(Long currentUserId);

    ChannelVO getChannel(Long channelId, Long currentUserId);

    PageResult<FeedItemVO> getChannelPosts(Long channelId, long page, long size, Long currentUserId);

    ChannelVO joinChannel(Long channelId, Long currentUserId);

    ChannelVO leaveChannel(Long channelId, Long currentUserId);
}
