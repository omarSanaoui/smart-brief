import { Resend } from 'resend'

const FROM = 'Smart Brief <onboarding@resend.dev>'
const getResend = () => new Resend(process.env.RESEND_API_KEY)

function layout(content: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0F1528;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1528;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#141824;border-radius:16px 16px 0 0;padding:24px 36px;border-bottom:3px solid #414CC4;">
            <span style="color:#67CFB1;font-size:20px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">SMART</span>
            <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:4px;text-transform:uppercase;"> BRIEF</span>
            <span style="color:rgba(255,255,255,0.35);font-size:11px;margin-left:10px;letter-spacing:1px;vertical-align:middle;">by Agence 47</span>
          </td>
        </tr>
        <tr>
          <td style="background:#1A2238;padding:36px;border-radius:0 0 16px 16px;">
            ${content}
            <p style="color:rgba(255,255,255,0.25);font-size:11px;margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
              Ceci est un message automatique. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">©2026 Agence 47 · Smart Brief · contact@agence47.ma</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendVerificationEmail(email: string, code: string) {
    const digits = code.split('').map(d =>
        `<span style="display:inline-block;width:44px;height:52px;line-height:52px;text-align:center;background:#0F1528;border:1px solid #2E3A5C;border-radius:10px;color:#ffffff;font-size:26px;font-weight:900;font-family:monospace;margin:0 3px;">${d}</span>`
    ).join('')

    const content = `
        <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px;letter-spacing:1px;">Vérification de votre email</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 28px;line-height:1.6;">
            Utilisez le code ci-dessous pour finaliser votre inscription. Il expire dans <strong style="color:#ffffff;">10 minutes</strong>.
        </p>
        <div style="text-align:center;margin:0 0 28px;">${digits}</div>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;margin:0;">Ne partagez ce code avec personne.</p>
    `

    await getResend().emails.send({
        from: FROM,
        to: email,
        subject: `${code} — Code de vérification Smart Brief`,
        html: layout(content),
    })
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    const content = `
        <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px;letter-spacing:1px;">Réinitialisation du mot de passe</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;line-height:1.6;">
            Nous avons reçu une demande de réinitialisation de mot de passe.<br>
            Ce lien expire dans <strong style="color:#ffffff;">30 minutes</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
            <a href="${resetLink}" style="display:inline-block;background:#414CC4;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;">
                Réinitialiser le mot de passe
            </a>
        </div>
        <p style="color:rgba(255,255,255,0.35);font-size:11px;text-align:center;word-break:break-all;margin:0;">
            Si le bouton ne fonctionne pas :<br>
            <a href="${resetLink}" style="color:#67CFB1;text-decoration:none;">${resetLink}</a>
        </p>
    `

    await getResend().emails.send({
        from: FROM,
        to: email,
        subject: `🔐 Réinitialisation de votre mot de passe Smart Brief`,
        html: layout(content),
    })
}
