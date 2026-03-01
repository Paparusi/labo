import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Labo <noreply@labo.vn>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping (no RESEND_API_KEY):', { to, subject })
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('[Email] Failed to send:', error)
  }
}

// ==================== Email Templates ====================

interface EmailTemplate {
  subject: string
  html: string
}

export function welcomeEmail(name: string, role: 'worker' | 'factory'): EmailTemplate {
  const isFactory = role === 'factory'
  const roleText = isFactory ? 'nhà máy' : 'công nhân'
  const dashboardUrl = isFactory ? '/factory/dashboard' : '/worker/dashboard'

  return {
    subject: 'Chào mừng đến với Labo!',
    html: emailLayout(`
      <h2 style="color: #059669; margin-bottom: 16px;">Chào mừng ${name}!</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản ${roleText} trên Labo.</p>
      <p>Labo là nền tảng kết nối công nhân với nhà máy dựa trên vị trí địa lý, giúp bạn ${isFactory ? 'tìm được công nhân phù hợp nhanh chóng' : 'tìm được việc làm gần nhà'}.</p>
      <p><strong>Bước tiếp theo:</strong></p>
      <ul>
        <li>${isFactory ? 'Hoàn thiện hồ sơ công ty' : 'Hoàn thiện hồ sơ cá nhân'}</li>
        <li>${isFactory ? 'Đăng tin tuyển dụng đầu tiên' : 'Cập nhật kỹ năng và vị trí'}</li>
      </ul>
      ${buttonHtml('Bắt đầu ngay', dashboardUrl)}
    `),
  }
}

export function newApplicationEmail(
  factoryName: string,
  jobTitle: string,
  workerName: string,
): EmailTemplate {
  return {
    subject: `Ứng viên mới cho "${jobTitle}"`,
    html: emailLayout(`
      <h2 style="color: #059669; margin-bottom: 16px;">Ứng viên mới!</h2>
      <p>Xin chào ${factoryName},</p>
      <p><strong>${workerName}</strong> vừa ứng tuyển vào vị trí <strong>${jobTitle}</strong>.</p>
      <p>Hãy xem hồ sơ ứng viên và phản hồi sớm nhất có thể.</p>
      ${buttonHtml('Xem ứng viên', '/factory/jobs')}
    `),
  }
}

export function applicationStatusEmail(
  workerName: string,
  jobTitle: string,
  factoryName: string,
  status: 'accepted' | 'rejected',
): EmailTemplate {
  const isAccepted = status === 'accepted'

  return {
    subject: isAccepted
      ? 'Chúc mừng! Đơn ứng tuyển được chấp nhận'
      : 'Cập nhật đơn ứng tuyển',
    html: emailLayout(`
      <h2 style="color: ${isAccepted ? '#059669' : '#6b7280'}; margin-bottom: 16px;">
        ${isAccepted ? 'Chúc mừng!' : 'Thông báo'}
      </h2>
      <p>Xin chào ${workerName},</p>
      <p>Đơn ứng tuyển vị trí <strong>${jobTitle}</strong> tại <strong>${factoryName}</strong> đã ${isAccepted ? 'được chấp nhận' : 'không được chấp nhận'}.</p>
      ${isAccepted ? '<p>Nhà máy sẽ liên hệ với bạn sớm. Bạn cũng có thể nhắn tin trực tiếp qua Labo.</p>' : '<p>Đừng nản chí! Có nhiều cơ hội việc làm khác đang chờ bạn.</p>'}
      ${buttonHtml(isAccepted ? 'Xem tin nhắn' : 'Tìm việc khác', isAccepted ? '/worker/messages' : '/worker/jobs')}
    `),
  }
}

export function newMessageEmail(
  recipientName: string,
  senderName: string,
): EmailTemplate {
  return {
    subject: `Tin nhắn mới từ ${senderName}`,
    html: emailLayout(`
      <h2 style="color: #059669; margin-bottom: 16px;">Tin nhắn mới</h2>
      <p>Xin chào ${recipientName},</p>
      <p><strong>${senderName}</strong> vừa gửi cho bạn một tin nhắn trên Labo.</p>
      ${buttonHtml('Đọc tin nhắn', '/worker/messages')}
    `),
  }
}

// ==================== Email Layout ====================

function emailLayout(content: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const year = new Date().getFullYear()

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; padding: 40px 0;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #059669; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Labo</h1>
        </div>
        <div style="padding: 32px 24px;">
          ${content}
        </div>
        <div style="padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af;">
          <p>&copy; ${year} Labo. Tìm việc gần, Tuyển dụng nhanh.</p>
          <p><a href="${appUrl}/terms" style="color: #059669;">Điều khoản</a> · <a href="${appUrl}/privacy" style="color: #059669;">Bảo mật</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

function buttonHtml(text: string, path: string): string {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}${path}`

  return `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${url}" style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">${text}</a>
    </div>
  `
}
