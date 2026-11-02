package com.example.petserver.post;

import com.example.petserver.common.PageResult;
import com.example.petserver.post.dto.PostCreateDTO;
import com.example.petserver.post.vo.FeedItemVO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostMapper postMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 发布动态逻辑
    public Long create(Long userId, PostCreateDTO dto) {
        boolean emptyContent = dto.getContent() == null || dto.getContent().trim().isEmpty();
        boolean emptyImages = dto.getImages() == null || dto.getImages().isEmpty();
        if (emptyContent && emptyImages) {
            throw new IllegalArgumentException("内容和图片不能同时为空");
        }
        if (dto.getImages() != null && dto.getImages().size() > 9) {
            throw new IllegalArgumentException("最多只能上传9张图片");
        }

        Post post = new Post();
        post.setUserId(userId);
        post.setPetId(dto.getPetId());
        post.setContent(emptyContent ? "" : dto.getContent().trim());

        try {
            // 把前端传来的图片数组转成 JSON 字符串存入数据库
            post.setImages(objectMapper.writeValueAsString(
                    dto.getImages() == null ? new ArrayList<>() : dto.getImages()));
        } catch (Exception e) {
            throw new IllegalArgumentException("图片格式错误");
        }

        postMapper.insert(post);
        return post.getId();
    }

    // 获取信息流逻辑
    public PageResult<FeedItemVO> feed(int page, int size) {
        if (page < 1) page = 1;
        if (size < 1 || size > 50) size = 10;

        int offset = (page - 1) * size;
        List<Post> posts = postMapper.selectFeed(offset, size);
        long total = postMapper.countAll();

        List<FeedItemVO> list = new ArrayList<>();
        for (Post p : posts) {
            FeedItemVO vo = new FeedItemVO();
            vo.setId(p.getId());
            vo.setUserId(p.getUserId());
            vo.setContent(p.getContent());
            vo.setLikeCount(p.getLikeCount());
            vo.setCommentCount(p.getCommentCount());
            vo.setCreatedAt(p.getCreatedAt());
            try {
                // 把数据库里的 JSON 字符串转回数组给前端
                vo.setImages(objectMapper.readValue(
                        p.getImages() == null ? "[]" : p.getImages(),
                        new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                vo.setImages(new ArrayList<>());
            }
            list.add(vo);
        }

        boolean hasMore = (long) page * size < total;
        return new PageResult<>(list, page, size, hasMore);
    }

    // 获取单条详情
    public FeedItemVO detail(Long id) {
        Post p = postMapper.selectById(id);
        if (p == null) {
            throw new IllegalArgumentException("动态不存在");
        }
        FeedItemVO vo = new FeedItemVO();
        vo.setId(p.getId());
        vo.setUserId(p.getUserId());
        vo.setContent(p.getContent());
        vo.setLikeCount(p.getLikeCount());
        vo.setCommentCount(p.getCommentCount());
        vo.setCreatedAt(p.getCreatedAt());
        try {
            vo.setImages(objectMapper.readValue(
                    p.getImages() == null ? "[]" : p.getImages(),
                    new TypeReference<List<String>>() {}));
        } catch (Exception e) {
            vo.setImages(new ArrayList<>());
        }
        return vo;
    }
}