import { Resend } from "resend";

const getResend = () => new Resend(process.env.RESEND_API_KEY);
const FROM = "Smart Brief <onboarding@resend.dev>";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Accepté",
  REFUSED: "Refusé",
  IN_PROGRESS: "En cours de production",
  COMPLETED: "Terminé",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  ACCEPTED: "#67CFB1",
  REFUSED: "#EF4444",
  IN_PROGRESS: "#414CC4",
  COMPLETED: "#10B981",
};

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
              Ceci est un message automatique de la plateforme Smart Brief.
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
</html>`;
}

export async function sendBriefStatusEmail(to: string, clientName: string, briefTitle: string, status: string, reason?: string) {
  if (!process.env.RESEND_API_KEY) return;

  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || "#414CC4";
  const isAccepted = status === "ACCEPTED";
  const isRefused = status === "REFUSED";
  const isCompleted = status === "COMPLETED";

  let headline = "Mise à jour de votre brief";
  let subtext = "Le statut de votre projet a été mis à jour.";
  if (isAccepted) { headline = "Votre projet a été accepté !"; subtext = "Notre équipe a examiné votre brief et est prête à démarrer."; }
  else if (isRefused) { headline = "Suite à votre brief"; subtext = "Après examen, nous ne sommes pas en mesure d'accepter ce projet pour le moment."; }
  else if (isCompleted) { headline = "Votre projet est terminé !"; subtext = "L'équipe a finalisé la production de votre projet. Merci de nous faire confiance."; }

  const content = `
    <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px;">${headline}</h2>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">${clientName}</strong>,</p>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 24px;line-height:1.6;">${subtext}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1528;border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr><td>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 4px;text-transform:uppercase;">Projet</p>
        <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 16px;">${briefTitle}</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 4px;text-transform:uppercase;">Statut</p>
        <span style="display:inline-block;background:${statusColor}22;color:${statusColor};font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;">${statusLabel}</span>
      </td></tr>
    </table>
    ${reason ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1528;border-left:3px solid ${statusColor};padding:16px;margin-bottom:24px;"><tr><td><p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 6px;text-transform:uppercase;">Commentaire</p><p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;line-height:1.6;">${reason}</p></td></tr></table>` : ""}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to,
      subject: `${isAccepted ? "✅" : isRefused ? "❌" : isCompleted ? "🎉" : "📋"} Votre brief "${briefTitle}" — ${statusLabel}`,
      html: layout(content),
    });
    if (error) throw new Error(JSON.stringify(error));
  } catch (error) {
    console.error("[EMAIL] Failed to send status email:", error);
  }
}

export async function sendEmployeeAssignmentEmail(to: string, employeeName: string, briefTitle: string) {
  if (!process.env.RESEND_API_KEY) return;

  const content = `
    <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px;">Nouveau projet assigné</h2>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">${employeeName}</strong>,</p>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 24px;line-height:1.6;">Vous avez été assigné(e) à un nouveau projet. Consultez votre tableau de bord pour démarrer la production.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1528;border-radius:12px;padding:20px;">
      <tr><td>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 4px;text-transform:uppercase;">Projet</p>
        <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0;">${briefTitle}</p>
      </td></tr>
    </table>
  `;

  try {
    const { error } = await getResend().emails.send({ from: FROM, to, subject: `🚀 Nouveau projet assigné : ${briefTitle}`, html: layout(content) });
    if (error) throw new Error(JSON.stringify(error));
  } catch (error) {
    console.error("[EMAIL] Failed to send assignment email:", error);
  }
}

export async function sendAdminNewBriefEmail(to: string, clientName: string, briefTitle: string) {
  if (!process.env.RESEND_API_KEY) return;

  const content = `
    <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 8px;">Nouveau brief soumis</h2>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">Un client vient de soumettre un nouveau projet.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1528;border-radius:12px;padding:20px;">
      <tr><td>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 4px;text-transform:uppercase;">Client</p>
        <p style="color:#ffffff;font-size:15px;font-weight:700;margin:0 0 16px;">${clientName}</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 4px;text-transform:uppercase;">Projet</p>
        <p style="color:#ffffff;font-size:15px;font-weight:700;margin:0 0 16px;">${briefTitle}</p>
        <span style="display:inline-block;background:#F59E0B22;color:#F59E0B;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;">En attente de validation</span>
      </td></tr>
    </table>
  `;

  try {
    const { error } = await getResend().emails.send({ from: FROM, to, subject: `📬 Nouveau brief : ${briefTitle} — ${clientName}`, html: layout(content) });
    if (error) throw new Error(JSON.stringify(error));
  } catch (error) {
    console.error("[EMAIL] Failed to send admin notification email:", error);
  }
}
