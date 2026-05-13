import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function emailWrapper(title, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:12px;max-width:480px;width:100%;">
        <tr><td style="padding:40px 40px 8px 40px;">
          <h1 style="color:#a855f7;margin:0 0 4px 0;font-size:28px;">ProxyToro</h1>
        </td></tr>
        <tr><td style="padding:8px 40px 32px 40px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f9f9f9;border-radius:0 0 12px 12px;">
          <p style="color:#999;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function buttonHtml(url, label) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center" bgcolor="#9333ea" style="border-radius:8px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
          href="${url}" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="10%" stroke="f" fillcolor="#9333ea">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${label}</center>
        </v:roundrect>
        <![endif]-->
        <a href="${url}" target="_blank" style="background-color:#9333ea;border-radius:8px;color:#ffffff;display:inline-block;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;line-height:46px;text-align:center;text-decoration:none;padding:0 30px;min-width:160px;mso-hide:all;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
  <p style="color:#888;font-size:12px;word-break:break-all;margin-top:8px;">
    If the button doesn't work, copy this link:<br>
    <a href="${url}" style="color:#9333ea;">${url}</a>
  </p>`
}

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${(process.env.BACKEND_URL || '').trim()}/api/auth/verify/${token}`
  await resend.emails.send({
    from: 'ProxyToro <support@proxytoro.com>',
    to: email,
    subject: 'Verify your ProxyToro account',
    html: emailWrapper('Verify your email', `
      <h2 style="color:#111;margin:0 0 12px 0;">Verify your email</h2>
      <p style="color:#555;margin:0 0 8px 0;">Thanks for signing up! Click the button below to verify your email address.</p>
      ${buttonHtml(verifyUrl, 'Verify Email')}
    `)
  })
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${(process.env.FRONTEND_URL || '').trim()}/reset-password?token=${token}`
  await resend.emails.send({
    from: 'ProxyToro <support@proxytoro.com>',
    to: email,
    subject: 'Reset your ProxyToro password',
    html: emailWrapper('Reset your password', `
      <h2 style="color:#111;margin:0 0 12px 0;">Reset your password</h2>
      <p style="color:#555;margin:0 0 8px 0;">Click the button below to reset your password. This link expires in 1 hour.</p>
      ${buttonHtml(resetUrl, 'Reset Password')}
    `)
  })
}
