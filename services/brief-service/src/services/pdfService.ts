import PDFDocument from "pdfkit";
import { UserSnapshot } from "../utils/authClient.js";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  SITE_WEB: "Création & Conception Site Web",
  SEO: "Référencement Naturel SEO",
  GOOGLE_ADS: "Référencement Payant Google",
  SOCIAL_MEDIA: "Médias Sociaux & Campagne",
  PHOTO_VIDEO: "Photographie & Vidéographie",
  EMAIL_MARKETING: "Campagne Courriel Marketing",
  COMMUNITY_MANAGER: "Community Manager",
  BRANDING: "Branding & Identité Visuelle",
  OTHER: "Autre",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Accepté",
  REFUSED: "Refusé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:     "#F59E0B",
  ACCEPTED:    "#67CFB1",
  REFUSED:     "#EF4444",
  IN_PROGRESS: "#60A5FA",
  COMPLETED:   "#10B981",
};

// Website colour palette
const BG_PAGE  = "#0D1321";   // page background
const BG_CARD  = "#1A2238";   // card / section bg
const BG_HEAD  = "#12192B";   // header bar bg
const BORDER   = "#2E3A5C";   // dividers & borders
const PURPLE   = "#6C63FF";   // sbpurple
const TEAL     = "#67CFB1";   // sbteal
const WHITE    = "#FFFFFF";
const WHITE60  = "#99A3B8";   // white/60
const WHITE30  = "#4A5468";   // white/30

function hex(color: string): [number, number, number] {
  const c = color.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}


export async function createBriefPdf(
  brief: any,
  client: UserSnapshot | null,
  assignees: UserSnapshot[],
  role: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W  = doc.page.width;   // 595
    const H  = doc.page.height;  // 842
    const M  = 36;               // outer margin

    // ── FULL PAGE DARK BACKGROUND ──────────────────────────────────
    doc.rect(0, 0, W, H).fill(BG_PAGE);

    // ── HEADER BAR ─────────────────────────────────────────────────
    doc.rect(0, 0, W, 64).fill(BG_HEAD);
    // purple accent line at bottom of header
    doc.rect(0, 61, W, 3).fill(PURPLE);

    // Logo text
    doc.fillColor(TEAL).fontSize(16).font("Helvetica-Bold")
      .text("SMART", M, 20, { continued: true, characterSpacing: 3 });
    doc.fillColor(WHITE).text(" BRIEF", { continued: false, characterSpacing: 3 });

    doc.fillColor(WHITE30).fontSize(7).font("Helvetica")
      .text("BY AGENCE 47  ·  PLATEFORME DE GESTION DE PROJETS", M, 42, { characterSpacing: 1.2 });

    // Export date top-right
    doc.fillColor(WHITE30).fontSize(7).font("Helvetica")
      .text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 0, 42, { width: W - M, align: "right" });

    // ── TITLE + STATUS ROW ─────────────────────────────────────────
    const titleY = 82;
    const statusLabel = STATUS_LABELS[brief.status] || brief.status;
    const statusColor = STATUS_COLORS[brief.status] || PURPLE;
    const badgeW = 88;
    const badgeH = 20;
    const badgeX = W - M - badgeW;

    // Status badge background
    const [sr, sg, sb] = hex(statusColor);
    doc.roundedRect(badgeX, titleY, badgeW, badgeH, 10)
      .fillOpacity(0.15).fill(`rgb(${sr},${sg},${sb})`);
    doc.fillOpacity(1);
    // Badge border
    doc.roundedRect(badgeX, titleY, badgeW, badgeH, 10)
      .strokeColor(statusColor).lineWidth(0.8).stroke();
    doc.fillColor(statusColor).fontSize(7.5).font("Helvetica-Bold")
      .text(statusLabel.toUpperCase(), badgeX, titleY + 6, { width: badgeW, align: "center", characterSpacing: 1 });

    // Brief title
    doc.fillColor(WHITE).fontSize(17).font("Helvetica-Bold")
      .text(brief.title, M, titleY, { width: W - M * 2 - badgeW - 16 });

    // Submitted date
    const submittedStr = `Soumis le ${new Date(brief.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}`;
    doc.fillColor(WHITE60).fontSize(8).font("Helvetica")
      .text(submittedStr, M, doc.y + 4);

    // Divider
    const divY1 = doc.y + 10;
    doc.moveTo(M, divY1).lineTo(W - M, divY1).strokeColor(BORDER).lineWidth(0.5).stroke();

    // ── TWO-COLUMN LAYOUT ──────────────────────────────────────────
    const colY      = divY1 + 14;
    const leftW     = 148;
    const leftX     = M;
    const rightX    = M + leftW + 16;
    const rightW    = W - rightX - M;

    // ── LEFT COLUMN — meta cards ───────────────────────────────────
    let ly = colY;

    const metaCard = (label: string, value: string, color: string = WHITE) => {
      const cardH = 46;
      doc.roundedRect(leftX, ly, leftW, cardH, 6)
        .fillOpacity(1).fill(BG_CARD);
      doc.roundedRect(leftX, ly, leftW, cardH, 6)
        .strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.fillColor(WHITE30).fontSize(7).font("Helvetica-Bold")
        .text(label.toUpperCase(), leftX + 10, ly + 9, { characterSpacing: 1.2, width: leftW - 20 });
      doc.fillColor(color).fontSize(9.5).font("Helvetica-Bold")
        .text(value, leftX + 10, ly + 22, { width: leftW - 20 });
      ly += cardH + 7;
    };

    const clientName = client ? `${client.firstName} ${client.lastName}` : "—";
    metaCard("Client", clientName, WHITE);
    metaCard("Type de service", PROJECT_TYPE_LABELS[brief.projectType] || brief.projectType, TEAL);
    metaCard("Budget estimé", brief.budgetRange, WHITE);
    metaCard("Date limite",
      new Date(brief.deadline).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" }),
      WHITE);

    // Client email (admin/employee only)
    if (role !== "CLIENT" && client?.email) {
      metaCard("Email client", client.email, WHITE60);
    }

    // Team card
    if (role !== "CLIENT") {
      const teamH = Math.max(46, 28 + (assignees.length || 1) * 16);
      doc.roundedRect(leftX, ly, leftW, teamH, 6).fill(BG_CARD);
      doc.roundedRect(leftX, ly, leftW, teamH, 6).strokeColor(BORDER).lineWidth(0.5).stroke();
      doc.fillColor(WHITE30).fontSize(7).font("Helvetica-Bold")
        .text("ÉQUIPE ASSIGNÉE", leftX + 10, ly + 9, { characterSpacing: 1.2, width: leftW - 20 });
      if (assignees.length) {
        assignees.forEach((emp, i) => {
          doc.fillColor(TEAL).fontSize(8).font("Helvetica-Bold")
            .text(`${emp.firstName} ${emp.lastName}`, leftX + 10, ly + 24 + i * 16, { width: leftW - 20 });
        });
      } else {
        doc.fillColor(WHITE30).fontSize(8).font("Helvetica")
          .text("Non assigné", leftX + 10, ly + 24, { width: leftW - 20 });
      }
      ly += teamH + 7;
    }

    // ── RIGHT COLUMN — description + features ─────────────────────
    let ry = colY;

    // Description card
    const descText = brief.description || "Aucune description fournie.";
    const descLines = doc.fontSize(9).heightOfString(descText, { width: rightW - 24, lineGap: 3 });
    const descCardH = descLines + 36;

    doc.roundedRect(rightX, ry, rightW, descCardH, 6).fill(BG_CARD);
    doc.roundedRect(rightX, ry, rightW, descCardH, 6).strokeColor(BORDER).lineWidth(0.5).stroke();

    doc.fillColor(WHITE30).fontSize(7).font("Helvetica-Bold")
      .text("DESCRIPTION DU PROJET", rightX + 12, ry + 10, { characterSpacing: 1.2 });
    doc.fillColor(WHITE60).fontSize(9).font("Helvetica")
      .text(descText, rightX + 12, ry + 24, { width: rightW - 24, lineGap: 3, align: "justify" });

    ry += descCardH + 10;

    // Features card
    if (brief.features?.length) {
      const featH = 26 + brief.features.length * 18;
      doc.roundedRect(rightX, ry, rightW, featH, 6).fill(BG_CARD);
      doc.roundedRect(rightX, ry, rightW, featH, 6).strokeColor(BORDER).lineWidth(0.5).stroke();

      doc.fillColor(WHITE30).fontSize(7).font("Helvetica-Bold")
        .text("FONCTIONNALITÉS DEMANDÉES", rightX + 12, ry + 10, { characterSpacing: 1.2 });

      brief.features.forEach((f: string, i: number) => {
        const fy = ry + 24 + i * 18;
        // dot
        doc.circle(rightX + 18, fy + 5, 2.5).fill(TEAL);
        doc.fillColor(WHITE).fontSize(9).font("Helvetica")
          .text(f, rightX + 28, fy, { width: rightW - 40 });
      });
      ry += featH + 10;
    }

    // Status reason card (refused)
    if (brief.statusReason) {
      const reasonH = doc.fontSize(9).heightOfString(brief.statusReason, { width: rightW - 24, lineGap: 3 }) + 36;
      const refuseColor = STATUS_COLORS["REFUSED"];
      doc.roundedRect(rightX, ry, rightW, reasonH, 6).fill(BG_CARD);
      doc.roundedRect(rightX, ry, rightW, reasonH, 6).strokeColor(refuseColor).lineWidth(0.8).stroke();
      doc.fillColor(refuseColor).fontSize(7).font("Helvetica-Bold")
        .text("MOTIF DU REFUS", rightX + 12, ry + 10, { characterSpacing: 1.2 });
      doc.fillColor(WHITE60).fontSize(9).font("Helvetica")
        .text(brief.statusReason, rightX + 12, ry + 24, { width: rightW - 24, lineGap: 3 });
      ry += reasonH + 10;
    }

    // ── FOOTER ────────────────────────────────────────────────────
    const footerY = H - 32;
    doc.rect(0, footerY - 1, W, 1).fill(BORDER);
    doc.fillColor(WHITE30).fontSize(7.5).font("Helvetica")
      .text(
        `Smart Brief by Agence 47  ·  contact@agence47.ma  ·  Généré le ${new Date().toLocaleDateString("fr-FR")}`,
        M, footerY + 8,
        { width: W - M * 2, align: "center" }
      );

    doc.end();
  });
}
