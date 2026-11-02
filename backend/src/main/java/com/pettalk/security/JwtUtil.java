package com.pettalk.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pettalk.config.JwtProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String BEARER_HEADER = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

    private final JwtProperties properties;
    private final ObjectMapper objectMapper;

    public JwtUtil(JwtProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void validateSecret() {
        String secret = properties.getSecret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT 密钥长度不能少于 32 字节");
        }
    }

    public String createToken(Long userId, String openid) {
        if (userId == null) {
            throw new IllegalArgumentException("用户 ID 不能为空");
        }

        long now = Instant.now().getEpochSecond();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", String.valueOf(userId));
        payload.put("openid", openid);
        payload.put("iat", now);
        payload.put("exp", now + properties.getExpireMinutes() * 60);

        String header = encodeJson(BEARER_HEADER);
        String body = encodeJson(payload);
        String content = header + "." + body;
        return content + "." + sign(content);
    }

    public JwtPrincipal parseToken(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("登录凭证不能为空");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("登录凭证格式错误");
        }

        String content = parts[0] + "." + parts[1];
        byte[] expected = sign(content).getBytes(StandardCharsets.US_ASCII);
        byte[] actual = parts[2].getBytes(StandardCharsets.US_ASCII);
        if (!MessageDigest.isEqual(expected, actual)) {
            throw new IllegalArgumentException("登录凭证无效");
        }

        try {
            JsonNode payload = objectMapper.readTree(Base64.getUrlDecoder().decode(parts[1]));
            long expireAt = payload.path("exp").asLong(0);
            if (expireAt <= Instant.now().getEpochSecond()) {
                throw new IllegalArgumentException("登录已过期，请重新登录");
            }

            long userId = Long.parseLong(payload.path("sub").asText());
            if (userId <= 0) {
                throw new IllegalArgumentException("登录凭证无效");
            }
            return new JwtPrincipal(userId, payload.path("openid").asText(null));
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("登录凭证无效");
        }
    }

    private String encodeJson(Object value) {
        try {
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception e) {
            throw new IllegalStateException("生成登录凭证失败", e);
        }
    }

    private String sign(String content) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(
                    properties.getSecret().getBytes(StandardCharsets.UTF_8),
                    HMAC_ALGORITHM
            ));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("生成登录凭证失败", e);
        }
    }
}
