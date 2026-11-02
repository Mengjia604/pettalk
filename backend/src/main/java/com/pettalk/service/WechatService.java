package com.pettalk.service;

import com.pettalk.config.WechatProperties;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Service
public class WechatService {

    private final WechatProperties properties;
    private final RestClient restClient = RestClient.create();

    public WechatService(WechatProperties properties) {
        this.properties = properties;
    }

    public WechatSession exchangeCode(String code) {
        if (!StringUtils.hasText(code)) {
            throw new IllegalArgumentException("登录 code 不能为空");
        }

        if (properties.isMockEnabled()) {
            String openid = code.startsWith("mock_") ? code.substring("mock_".length()) : "mock_local_user";
            return new WechatSession(openid, null);
        }

        if (!StringUtils.hasText(properties.getAppSecret())) {
            throw new IllegalStateException("未配置微信 AppSecret，无法完成登录");
        }

        URI uri = UriComponentsBuilder.fromHttpUrl(properties.getCode2SessionUrl())
                .queryParam("appid", properties.getAppId())
                .queryParam("secret", properties.getAppSecret())
                .queryParam("js_code", code)
                .queryParam("grant_type", "authorization_code")
                .build()
                .encode()
                .toUri();

        Map<String, Object> body;
        try {
            body = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });
        } catch (RestClientException e) {
            throw new IllegalStateException("微信登录服务暂时不可用，请稍后重试", e);
        }

        if (body == null) {
            throw new IllegalStateException("微信登录服务返回为空");
        }

        Object errcode = body.get("errcode");
        if (errcode instanceof Number number && number.intValue() != 0) {
            throw new IllegalArgumentException("微信登录失败：" + body.getOrDefault("errmsg", "未知错误"));
        }

        String openid = body.get("openid") instanceof String value ? value : null;
        if (!StringUtils.hasText(openid)) {
            throw new IllegalArgumentException("微信登录失败：未获取到 openid");
        }
        String sessionKey = body.get("session_key") instanceof String value ? value : null;
        return new WechatSession(openid, sessionKey);
    }

    public record WechatSession(String openid, String sessionKey) {
    }
}
