package com.pettalk.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.pettalk.common.PageResult;
import com.pettalk.dto.ChannelVO;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.entity.Channel;
import com.pettalk.entity.ChannelMember;
import com.pettalk.entity.Post;
import com.pettalk.mapper.ChannelMapper;
import com.pettalk.mapper.ChannelMemberMapper;
import com.pettalk.mapper.PostMapper;
import com.pettalk.service.ChannelService;
import com.pettalk.service.PostService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChannelServiceImpl implements ChannelService {

    private static final List<String> DEFAULT_RECOMMENDED_CODES = List.of("cat", "dog");

    private final ChannelMapper channelMapper;
    private final ChannelMemberMapper channelMemberMapper;
    private final PostMapper postMapper;
    private final PostService postService;

    public ChannelServiceImpl(ChannelMapper channelMapper,
                              ChannelMemberMapper channelMemberMapper,
                              PostMapper postMapper,
                              PostService postService) {
        this.channelMapper = channelMapper;
        this.channelMemberMapper = channelMemberMapper;
        this.postMapper = postMapper;
        this.postService = postService;
    }

    @Override
    public List<ChannelVO> listChannels(Long currentUserId) {
        List<Channel> channels = channelMapper.selectList(Wrappers.<Channel>lambdaQuery()
                .orderByAsc(Channel::getSortOrder)
                .orderByAsc(Channel::getId));
        return toChannelVOs(channels, currentUserId);
    }

    @Override
    public List<ChannelVO> getHomeChannels(Long currentUserId) {
        List<Channel> joinedChannels = loadJoinedChannels(currentUserId);
        if (!joinedChannels.isEmpty()) {
            return toChannelVOs(joinedChannels, currentUserId);
        }

        List<Channel> recommended = channelMapper.selectList(Wrappers.<Channel>lambdaQuery()
                .in(Channel::getCode, DEFAULT_RECOMMENDED_CODES)
                .orderByAsc(Channel::getSortOrder)
                .orderByAsc(Channel::getId));
        if (!recommended.isEmpty()) {
            return toChannelVOs(recommended, currentUserId);
        }
        return toChannelVOs(channelMapper.selectList(Wrappers.<Channel>lambdaQuery()
                .orderByAsc(Channel::getSortOrder)
                .orderByAsc(Channel::getId)
                .last("LIMIT 2")), currentUserId);
    }

    @Override
    public List<ChannelVO> listMyChannels(Long currentUserId) {
        return toChannelVOs(loadJoinedChannels(currentUserId), currentUserId);
    }

    @Override
    public ChannelVO getChannel(Long channelId, Long currentUserId) {
        Channel channel = requireChannel(channelId);
        return toChannelVO(channel, isJoined(channelId, currentUserId));
    }

    @Override
    public PageResult<FeedItemVO> getChannelPosts(Long channelId,
                                                  long page,
                                                  long size,
                                                  Long currentUserId) {
        requireChannel(channelId);
        return postService.getChannelFeed(channelId, page, size, currentUserId);
    }

    @Override
    public ChannelVO joinChannel(Long channelId, Long currentUserId) {
        Channel channel = requireChannel(channelId);
        requireUser(currentUserId);
        if (!isJoined(channelId, currentUserId)) {
            ChannelMember member = new ChannelMember();
            member.setChannelId(channelId);
            member.setUserId(currentUserId);
            try {
                channelMemberMapper.insert(member);
            } catch (DuplicateKeyException ignored) {
                // 并发重复加入时保持幂等
            }
        }
        return toChannelVO(channel, true);
    }

    @Override
    public ChannelVO leaveChannel(Long channelId, Long currentUserId) {
        Channel channel = requireChannel(channelId);
        requireUser(currentUserId);
        channelMemberMapper.delete(Wrappers.<ChannelMember>lambdaQuery()
                .eq(ChannelMember::getChannelId, channelId)
                .eq(ChannelMember::getUserId, currentUserId));
        return toChannelVO(channel, false);
    }

    private List<Channel> loadJoinedChannels(Long currentUserId) {
        if (currentUserId == null) {
            return List.of();
        }
        List<Long> channelIds = channelMemberMapper.selectList(Wrappers.<ChannelMember>lambdaQuery()
                        .eq(ChannelMember::getUserId, currentUserId))
                .stream()
                .map(ChannelMember::getChannelId)
                .distinct()
                .toList();
        if (channelIds.isEmpty()) {
            return List.of();
        }
        return channelMapper.selectList(Wrappers.<Channel>lambdaQuery()
                .in(Channel::getId, channelIds)
                .orderByAsc(Channel::getSortOrder)
                .orderByAsc(Channel::getId));
    }

    private List<ChannelVO> toChannelVOs(List<Channel> channels, Long currentUserId) {
        Set<Long> joinedIds = loadJoinedChannelIds(currentUserId);
        return channels.stream()
                .map(channel -> toChannelVO(channel, joinedIds.contains(channel.getId())))
                .toList();
    }

    private Set<Long> loadJoinedChannelIds(Long currentUserId) {
        if (currentUserId == null) {
            return Set.of();
        }
        return channelMemberMapper.selectList(Wrappers.<ChannelMember>lambdaQuery()
                        .eq(ChannelMember::getUserId, currentUserId))
                .stream()
                .map(ChannelMember::getChannelId)
                .collect(Collectors.toSet());
    }

    private Channel requireChannel(Long channelId) {
        if (channelId == null || channelId <= 0) {
            throw new IllegalArgumentException("频道 ID 不正确");
        }
        Channel channel = channelMapper.selectById(channelId);
        if (channel == null) {
            throw new IllegalArgumentException("频道不存在");
        }
        return channel;
    }

    private void requireUser(Long currentUserId) {
        if (currentUserId == null) {
            throw new IllegalArgumentException("请先登录");
        }
    }

    private boolean isJoined(Long channelId, Long currentUserId) {
        if (currentUserId == null) {
            return false;
        }
        return channelMemberMapper.selectCount(Wrappers.<ChannelMember>lambdaQuery()
                .eq(ChannelMember::getChannelId, channelId)
                .eq(ChannelMember::getUserId, currentUserId)) > 0;
    }

    private ChannelVO toChannelVO(Channel channel, boolean joined) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        ChannelVO vo = new ChannelVO();
        vo.setId(channel.getId());
        vo.setCode(channel.getCode());
        vo.setName(channel.getName());
        vo.setDescription(channel.getDescription());
        vo.setPostCount(postMapper.selectCount(Wrappers.<Post>lambdaQuery()
                .eq(Post::getChannelId, channel.getId())));
        vo.setTodayPostCount(postMapper.selectCount(Wrappers.<Post>lambdaQuery()
                .eq(Post::getChannelId, channel.getId())
                .ge(Post::getCreateTime, todayStart)));
        vo.setMemberCount(channelMemberMapper.selectCount(Wrappers.<ChannelMember>lambdaQuery()
                .eq(ChannelMember::getChannelId, channel.getId())));
        vo.setJoined(joined);
        return vo;
    }
}
