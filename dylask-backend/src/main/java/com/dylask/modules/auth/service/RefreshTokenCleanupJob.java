package com.dylask.modules.auth.service;

import com.dylask.modules.auth.repository.RefreshTokenRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Component
public class RefreshTokenCleanupJob {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenCleanupJob(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Tự động dọn dẹp các Refresh Token đã hết hạn hoặc đã bị thu hồi (is_revoked = true).
     *
     * Chu kỳ chạy: Mỗi 7 ngày một lần vào lúc 03:00 sáng Chủ Nhật (thời điểm lưu lượng truy cập thấp nhất).
     * Lý do: Refresh Token có thời hạn tối đa là 7 ngày; việc gom lại dọn dẹp hàng tuần giúp giảm thiểu
     * số lượng thao tác ghi/xóa (I/O) không cần thiết trên bảng refresh_tokens của CSDL MySQL.
     */
    @Scheduled(cron = "${app.refresh-token.cleanup-cron:0 0 3 ? * SUN}")
    @Transactional
    public void cleanupExpiredTokens() {
        // 1. Ghi log khởi động tiến trình dọn dẹp định kỳ
        log.info("Bắt đầu tiến trình dọn dẹp Refresh Token hết hạn hoặc bị thu hồi (chu kỳ 7 ngày)...");

        // 2. Thực thi câu lệnh DELETE các token có expires_at < hiện tại HOẶC is_revoked = true
        int deletedCount = refreshTokenRepository.deleteExpiredOrRevokedTokens(Instant.now());

        // 3. Ghi log tổng kết số lượng bản ghi đã được giải phóng khỏi CSDL
        log.info("Hoàn tất dọn dẹp: Đã xóa {} Refresh Token không còn hiệu lực.", deletedCount);
    }
}
