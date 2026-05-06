import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify/${token}`

  await resend.emails.send({
    from: 'ProxyToro <support@proxytoro.com>',
    to: email,
    subject: 'Verify your ProxyToro account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #a855f7; margin-bottom: 8px;">ProxyToro</h1>
        <h2 style="color: #111; margin-bottom: 16px;">Verify your email</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Thanks for signing up! Click the button below to verify your email address.
        </p>
        <a href="${verifyUrl}"
          style="background: #9333ea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `
  })
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: 'ProxyToro <support@proxytoro.com>',
    to: email,
    subject: 'Reset your ProxyToro password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #a855f7; margin-bottom: 8px;">ProxyToro</h1>
        <h2 style="color: #111; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
          style="background: #9333ea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can ignore this email. Your password won't change.
        </p>
      </div>
    `
  })
}
