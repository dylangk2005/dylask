package com.dylask.common.config;

import com.dylask.common.config.security.CustomOAuth2UserService;
import com.dylask.common.config.security.JwtAuthenticationEntryPoint;
import com.dylask.common.config.security.JwtAuthenticationFilter;
import com.dylask.common.config.security.OAuth2AuthenticationFailureHandler;
import com.dylask.common.config.security.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Cấu hình bảo mật tập trung cho toàn bộ ứng dụng Dylask.
 * Kết hợp cơ chế xác thực kép:
 * 1. Stateless JWT Filter cho các RESTful API endpoints.
 * 2. OAuth2 Authorization Code Flow với Google và GitHub cho đăng nhập mạng xã hội.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    public SecurityConfig(
            CorsConfigurationSource corsConfigurationSource,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
            OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
        this.oAuth2AuthenticationFailureHandler = oAuth2AuthenticationFailureHandler;
    }

    /**
     * Thiết lập chuỗi lọc bảo mật SecurityFilterChain.
     * Áp dụng SessionCreationPolicy.IF_REQUIRED để lưu trữ tạm thời `state` CSRF
     * trong quá trình bắt tay OAuth2 với Google/GitHub, trong khi các API thông thường
     * hoàn toàn không phụ thuộc session nhờ JwtAuthenticationFilter.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Cấu hình CORS và tắt CSRF cho REST API
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Xử lý ngoại lệ khi chưa được xác thực
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))

            // 3. Quản lý Session: Cho phép tạo Session tạm thời để lưu state OAuth2
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

            // 4. Phân quyền các endpoint công khai và bảo vệ
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/auth/register",
                    "/auth/verify-email",
                    "/auth/resend-verification",
                    "/auth/login",
                    "/auth/refresh",
                    "/auth/logout",
                    "/oauth2/**",
                    "/login/oauth2/**",
                    "/error",
                    "/public/**"
                ).permitAll()
                .anyRequest().authenticated()
            )

            // 5. Cấu hình luồng đăng nhập OAuth2 (Google & GitHub)
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authEndpoint -> authEndpoint
                    .baseUri("/oauth2/authorization")
                )
                .redirectionEndpoint(redirectionEndpoint -> redirectionEndpoint
                    .baseUri("/login/oauth2/code/*")
                )
                .userInfoEndpoint(userInfoEndpoint -> userInfoEndpoint
                    .userService(customOAuth2UserService)
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
            )

            // 6. Gắn JwtAuthenticationFilter trước UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

