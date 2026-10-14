package com.dylask.modules.auth.service.impl;

import com.dylask.modules.auth.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:Dylask <no-reply@dylask.dev>}")
    private String fromEmail;

    public EmailServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, int expiryMinutes) {
        // Kiểm tra xem cấu hình SMTP Gmail đã được thiết lập hay chưa
        if (mailSender == null || mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
            log.info("================================================================================");
            log.info("📨 [MÃ XÁC THỰC EMAIL (OTP) DYLASK - CONSOLE MOCK]");
            log.info("Tài khoản: {}", toEmail);
            log.info("👉 Mã OTP 6 chữ số: [{}] (Hạn dùng: {} phút)", otpCode, expiryMinutes);
            log.info("💡 Chưa cấu hình MAIL_USERNAME / MAIL_PASSWORD trong .env. Email chưa gửi qua SMTP.");
            log.info("================================================================================");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

            String senderAddress = (mailUsername != null && !mailUsername.isBlank())
                    ? "Dylask <" + mailUsername.trim() + ">"
                    : fromEmail;
            helper.setFrom(senderAddress);
            helper.setTo(toEmail);
            helper.setSubject("Mã xác thực tài khoản Dylask: " + otpCode);
            helper.setText(buildHtmlEmail(otpCode, expiryMinutes), true);

            mailSender.send(mimeMessage);
            log.info("✅ Đã gửi email xác thực OTP thành công qua Gmail SMTP tới: {}", toEmail);
        } catch (Exception ex) {
            log.error("❌ Lỗi khi gửi email xác thực qua SMTP: {}", ex.getMessage());
            log.info("================================================================================");
            log.info("👉 [MÃ OTP DỰ PHÒNG]: [{}] cho tài khoản: {}", otpCode, toEmail);
            log.info("================================================================================");
        }
    }

    private String buildHtmlEmail(String otpCode, int expiryMinutes) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
                .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .header { background: #0F766E; padding: 28px 24px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
                .content { padding: 32px 28px; text-align: center; }
                .content p { font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 18px; }
                .otp-box { background: #F0FDF4; border: 2px dashed #059669; border-radius: 8px; padding: 18px 24px; display: inline-block; margin: 12px auto 24px; }
                .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #047857; margin-left: 10px; }
                .warning { font-size: 13px; color: #64748b; background: #f1f5f9; padding: 12px; border-radius: 6px; margin-top: 16px; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Dylask Workspace</h1>
                  <p>Hệ sinh thái quản lý công việc Dual-Mode</p>
                </div>
                <div class="content">
                  <p>Chào bạn,</p>
                  <p>Bạn vừa thực hiện đăng ký tài khoản tại <strong>Dylask</strong>. Để hoàn tất kích hoạt tài khoản, vui lòng sử dụng mã xác thực bên dưới:</p>
                  <div class="otp-box">
                    <span class="otp-code">%s</span>
                  </div>
                  <div class="warning">
                    ⏱️ Mã xác thực này có hiệu lực trong vòng <strong>%d phút</strong>.<br>
                    🛡️ Vui lòng không chia sẻ mã này cho bất kỳ ai để bảo vệ tài khoản của bạn.
                  </div>
                </div>
                <div class="footer">
                  © 2026 Dylask Inc. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.
                </div>
              </div>
            </body>
            </html>
            """.formatted(otpCode, expiryMinutes);
    }
}
