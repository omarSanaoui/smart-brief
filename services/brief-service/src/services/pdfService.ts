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
  PENDING: "#F59E0B",
  ACCEPTED: "#67CFB1",
  REFUSED: "#EF4444",
  IN_PROGRESS: "#414CC4",
  COMPLETED: "#10B981",
};

const PURPLE = "#414CC4";
const TEAL = "#67CFB1";
const DARK = "#141824";
const GRAY = "#64748B";
const TEXT = "#334155";

function sectionHeader(doc: PDFKit.PDFDocument, title: string, margin: number) {
  doc.moveDown(0.8);
  doc.fillColor(TEAL).fontSize(9).font("Helvetica-Bold")
    .text(title.toUpperCase(), margin, doc.y, { characterSpacing: 1.5 });
  const lineY = doc.y + 3;
  doc.moveTo(margin, lineY).lineTo(margin + 50, lineY)
    .strokeColor(TEAL).lineWidth(2).stroke();
  doc.moveDown(0.6);
}

function infoRow(doc: PDFKit.PDFDocument, label: string, value: string, margin: number, contentWidth: number) {
  const y = doc.y;
  doc.fillColor(GRAY).fontSize(9).font("Helvetica")
    .text(label, margin, y, { width: 110, continued: false });
  doc.fillColor(TEXT).font("Helvetica-Bold").fontSize(9)
    .text(value, margin + 115, y, { width: contentWidth - 115 });
  doc.moveDown(0.4);
}

export async function createBriefPdf(
  brief: any,
  client: UserSnapshot | null,
  assignees: UserSnapshot[],
  role: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    // ── HEADER BAR ──────────────────────────────────────────────
    doc.rect(0, 0, pageWidth, 72).fill(DARK);
    doc.rect(0, 69, pageWidth, 3).fill(PURPLE);

    doc.fillColor(TEAL).fontSize(18).font("Helvetica-Bold")
      .text("SMART", margin, 22, { continued: true, characterSpacing: 3 });
    doc.fillColor("#ffffff").text(" BRIEF", { continued: false, characterSpacing: 3 });

    doc.fillColor("rgba(255,255,255,0.35)").fontSize(8).font("Helvetica")
      .text("BY AGENCE 47  ·  PLATEFORME DE GESTION DE PROJETS", margin, 46, { characterSpacing: 1 });

    // ── BRIEF TITLE + STATUS ─────────────────────────────────────
    const titleY = 90;
    doc.fillColor(DARK).fontSize(20).font("Helvetica-Bold")
      .text(brief.title, margin, titleY, { width: contentWidth - 100 });

    const statusLabel = STATUS_LABELS[brief.status] || brief.status;
    const statusColor = STATUS_COLORS[brief.status] || PURPLE;
    const statusX = pageWidth - margin - 90;

    doc.roundedRect(statusX, titleY, 90, 22, 11).fill(statusColor + "22");
    doc.fillColor(statusColor).fontSize(8).font("Helvetica-Bold")
      .text(statusLabel.toUpperCase(), statusX, titleY + 7, { width: 90, align: "center", characterSpacing: 1 });

    doc.moveDown(0.3);
    doc.fillColor(GRAY).fontSize(8).font("Helvetica")
      .text(`Soumis le ${new Date(brief.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}`, margin);

    doc.moveTo(margin, doc.y + 6).lineTo(pageWidth - margin, doc.y + 6)
      .strokeColor("#E2E8F0").lineWidth(0.5).stroke();

    // ── CLIENT INFO ───────────────────────────────────────────────
    sectionHeader(doc, "Informations Client", margin);
    if (client) {
      infoRow(doc, "Nom complet", `${client.firstName} ${client.lastName}`, margin, contentWidth);
      if (role !== "CLIENT") infoRow(doc, "Email", client.email, margin, contentWidth);
    } else {
      infoRow(doc, "Nom complet", "Inconnu", margin, contentWidth);
    }

    // ── PROJECT DETAILS ───────────────────────────────────────────
    sectionHeader(doc, "Détails du Projet", margin);
    infoRow(doc, "Type de service", PROJECT_TYPE_LABELS[brief.projectType] || brief.projectType, margin, contentWidth);
    infoRow(doc, "Budget estimé", brief.budgetRange, margin, contentWidth);
    infoRow(doc, "Date limite", new Date(brief.deadline).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }), margin, contentWidth);
    if (brief.statusReason) infoRow(doc, "Motif du statut", brief.statusReason, margin, contentWidth);

    // ── DESCRIPTION ───────────────────────────────────────────────
    sectionHeader(doc, "Description du Projet", margin);
    doc.fillColor(TEXT).fontSize(10).font("Helvetica")
      .text(brief.description, margin, doc.y, { width: contentWidth, align: "justify", lineGap: 3 });

    // ── FEATURES ─────────────────────────────────────────────────
    if (brief.features?.length) {
      sectionHeader(doc, "Caractéristiques demandées", margin);
      brief.features.forEach((f: string) => {
        const y = doc.y;
        doc.circle(margin + 4, y + 5, 3).fill(TEAL);
        doc.fillColor(TEXT).font("Helvetica").fontSize(10)
          .text(f, margin + 14, y, { width: contentWidth - 14, lineGap: 2 });
      });
      doc.moveDown(0.3);
    }

    // ── ATTACHMENTS ───────────────────────────────────────────────
    if (brief.attachments?.length) {
      sectionHeader(doc, "Pièces jointes", margin);
      brief.attachments.forEach((name: string) => {
        const y = doc.y;
        doc.circle(margin + 4, y + 5, 3).fill(PURPLE);
        doc.fillColor(TEXT).font("Helvetica").fontSize(10)
          .text(name, margin + 14, y, { width: contentWidth - 14, lineGap: 2 });
      });
      doc.moveDown(0.3);
    }

    // ── TEAM (admin/employee only) ────────────────────────────────
    if (role !== "CLIENT") {
      sectionHeader(doc, "Équipe Assignée", margin);
      if (assignees.length) {
        assignees.forEach(emp => {
          const y = doc.y;
          doc.circle(margin + 4, y + 5, 3).fill(TEAL);
          doc.fillColor(TEXT).font("Helvetica").fontSize(10)
            .text(`${emp.firstName} ${emp.lastName}  ·  ${emp.email}`, margin + 14, y, { width: contentWidth - 14 });
        });
      } else {
        doc.fillColor(GRAY).fontSize(10).text("Non assigné", margin);
      }
      doc.moveDown(0.3);
    }

    // ── FOOTER ────────────────────────────────────────────────────
    const footerY = doc.page.height - 44;
    doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY)
      .strokeColor("#E2E8F0").lineWidth(0.5).stroke();
    doc.fillColor(GRAY).fontSize(8).font("Helvetica")
      .text(
        `Généré le ${new Date().toLocaleDateString("fr-FR")}  ·  Smart Brief by Agence 47  ·  contact@agence47.ma`,
        margin, footerY + 8,
        { width: contentWidth, align: "center" }
      );

    doc.end();
  });
}
