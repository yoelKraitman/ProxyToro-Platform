import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify/${token}`

  await resend.emails.send({
    from: 'ProxyToro <onboarding@resend.dev>',
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
