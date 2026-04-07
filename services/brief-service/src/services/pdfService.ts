import PDFDocument from "pdfkit";
import { UserSnapshot } from "../utils/authClient.js";

export async function createBriefPdf(brief: any, client: UserSnapshot | null, assignees: UserSnapshot[], role: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("Smart Brief", { align: "center" }).moveDown();

    // Client Info
    doc.fontSize(14).text("Client Information", { underline: true }).moveDown(0.5);
    if (client) {
      doc.fontSize(12).text(`Name: ${client.firstName} ${client.lastName}`);
      if (role !== "CLIENT") doc.text(`Email: ${client.email}`);
    } else {
      doc.fontSize(12).text(`Name: Unknown`);
    }
    doc.moveDown();

    // Employee Assignments (hidden from clients)
    if (role !== "CLIENT") {
      doc.fontSize(14).text("Assignments", { underline: true }).moveDown(0.5);
      if (assignees.length) {
        assignees.forEach(emp => doc.fontSize(12).text(`- ${emp.firstName} ${emp.lastName} (${emp.email})`));
      } else {
        doc.fontSize(12).text("Not assigned");
      }
      doc.moveDown();
    }

    // Brief Data
    doc.fontSize(14).text("Brief Details", { underline: true }).moveDown(0.5);
    doc.fontSize(12).text(`Title: ${brief.title}`);
    doc.text(`Project Type: ${brief.projectType.replace("_", " ")}`);
    doc.text(`Status: ${brief.status.replace("_", " ")}`);
    if (brief.statusReason) doc.text(`Reason: ${brief.statusReason}`);
    doc.text(`Budget: ${brief.budgetRange}`);
    doc.text(`Deadline: ${new Date(brief.deadline).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text("Description:").moveDown(0.2);
    doc.fontSize(11).text(brief.description).moveDown();

    if (brief.features?.length) {
      doc.fontSize(12).text("Features:").moveDown(0.2);
      brief.features.forEach((f: string) => doc.fontSize(11).text(`- ${f}`));
      doc.moveDown();
    }

    doc.end();
  });
}
