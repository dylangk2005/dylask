package com.dylask.common.config.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service tùy chỉnh nạp thông tin người dùng từ OAuth2 Provider (Google & GitHub).
 * Giải quyết edge-case GitHub che giấu email riêng tư bằng cách truy vấn trực tiếp
 * endpoint /user/emails với Bearer token của phiên xác thực.
 */
@Service
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final RestClient restClient;

    public CustomOAuth2UserService() {
        this.restClient = RestClient.create();
    }

    /**
     * Nạp và chuẩn hóa thuộc tính người dùng từ OAuth2 Resource Server.
     *
     * @param userRequest Yêu cầu OAuth2 chứa Access Token và cấu hình Registration
     * @return {@link OAuth2User} Đối tượng người dùng đã bổ sung email đầy đủ
     * @throws OAuth2AuthenticationException nếu quá trình xác thực nhà cung cấp thất bại
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. Tải thông tin người dùng cơ bản từ Provider thông qua lớp cha DefaultOAuth2UserService
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // 2. Xử lý trường hợp đặc biệt: GitHub cho phép người dùng đặt email ở chế độ Private
        if ("github".equalsIgnoreCase(registrationId)) {
            Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
            Object emailObj = attributes.get("email");

            if (emailObj == null || emailObj.toString().isBlank()) {
                log.info("Email từ GitHub ở chế độ riêng tư, tiến hành truy xuất qua GitHub API /user/emails...");
                String primaryEmail = fetchGitHubPrimaryEmail(userRequest.getAccessToken().getTokenValue());

                if (primaryEmail != null) {
                    attributes.put("email", primaryEmail);
                    log.info("Đã đồng bộ email chính từ GitHub: {}", primaryEmail);
                } else {
                    String login = (String) attributes.get("login");
                    attributes.put("email", login + "@users.noreply.github.com");
                    log.warn("Không tìm thấy email GitHub, sử dụng fallback email: {}@users.noreply.github.com", login);
                }

                String userNameAttributeName = userRequest.getClientRegistration()
                        .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();
                return new DefaultOAuth2User(oAuth2User.getAuthorities(), attributes, userNameAttributeName);
            }
        }

        return oAuth2User;
    }

    /**
     * Gọi endpoint https://api.github.com/user/emails để truy vấn email chính đã xác thực.
     *
     * @param accessToken Bearer token được GitHub cấp phát
     * @return Địa chỉ email chính hoặc null nếu không tìm thấy
     */
    private String fetchGitHubPrimaryEmail(String accessToken) {
        try {
            List<Map<String, Object>> emails = restClient.get()
                    .uri("https://api.github.com/user/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            if (emails != null) {
                // Ưu tiên 1: Email chính (primary) và đã xác thực (verified)
                for (Map<String, Object> emailEntry : emails) {
                    Boolean primary = (Boolean) emailEntry.get("primary");
                    Boolean verified = (Boolean) emailEntry.get("verified");
                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
                        return (String) emailEntry.get("email");
                    }
                }
                // Ưu tiên 2: Bất kỳ email nào đã được xác thực (verified)
                for (Map<String, Object> emailEntry : emails) {
                    Boolean verified = (Boolean) emailEntry.get("verified");
                    if (Boolean.TRUE.equals(verified)) {
                        return (String) emailEntry.get("email");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Không thể truy xuất email phụ từ GitHub API: {}", e.getMessage());
        }
        return null;
    }
}
