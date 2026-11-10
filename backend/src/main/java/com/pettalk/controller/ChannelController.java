package com.pettalk.controller;

import com.pettalk.common.PageResult;
import com.pettalk.common.Result;
import com.pettalk.dto.ChannelVO;
import com.pettalk.dto.FeedItemVO;
import com.pettalk.service.ChannelService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/channel")
public class ChannelController {

    private final ChannelService channelService;

    public ChannelController(ChannelService channelService) {
        this.channelService = channelService;
    }

    @GetMapping("/list")
    public Result<List<ChannelVO>> list(@RequestParam(required = false) Long currentUserId) {
        return Result.success(channelService.listChannels(currentUserId));
    }

    @GetMapping("/home")
    public Result<List<ChannelVO>> home(@RequestParam(required = false) Long currentUserId) {
        return Result.success(channelService.getHomeChannels(currentUserId));
    }

    @GetMapping("/mine")
    public Result<List<ChannelVO>> mine(@RequestParam(required = false) Long currentUserId) {
        return Result.success(channelService.listMyChannels(currentUserId));
    }

    @GetMapping("/{channelId}")
    public Result<ChannelVO> detail(@PathVariable Long channelId,
                                    @RequestParam(required = false) Long currentUserId) {
        return Result.success(channelService.getChannel(channelId, currentUserId));
    }

    @GetMapping("/{channelId}/posts")
    public Result<PageResult<FeedItemVO>> posts(
            @PathVariable Long channelId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") long size,
            @RequestParam(required = false) Long currentUserId) {
        return Result.success(channelService.getChannelPosts(channelId, page, size, currentUserId));
    }

    @PostMapping("/{channelId}/join")
    public Result<ChannelVO> join(@PathVariable Long channelId,
                                  @RequestAttribute("currentUserId") Long currentUserId) {
        return Result.success(channelService.joinChannel(channelId, currentUserId));
    }

    @DeleteMapping("/{channelId}/join")
    public Result<ChannelVO> leave(@PathVariable Long channelId,
                                   @RequestAttribute("currentUserId") Long currentUserId) {
        return Result.success(channelService.leaveChannel(channelId, currentUserId));
    }
}
