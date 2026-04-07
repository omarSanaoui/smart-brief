import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export async function sendVerificationEmail(email: string, code: string) {
    await transporter.sendMail({
        from: `"Smart Brief" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your verification code",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2>Verify your email</h2>
        <p>Use the code below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 10px;
          background: #f4f4f4;
          padding: 20px;
          text-align: center;
          border-radius: 8px;
          margin: 20px 0;
        ">
          ${code}
        </div>
        <p style="color: #888; font-size: 13px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
    })

}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    await transporter.sendMail({
        from: `"Smart Brief" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset your password",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2>Password reset request</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to continue. This link expires in <strong>30 minutes</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}" style="
            display: inline-block;
            background: #414CC4;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 18px;
            border-radius: 8px;
            font-weight: 700;
          ">Reset Password</a>
        </p>
        <p style="font-size: 13px; color: #666; word-break: break-all;">If the button does not work, use this link:<br/>${resetLink}</p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
    })
}