import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendBriefStatusEmail(to: string, clientName: string, briefTitle: string, status: string, reason?: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS missing. Skipping email.");
    return;
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: #333;">Smart Brief Update</h2>
      <p>Hello ${clientName},</p>
      <p>Your brief <strong>"${briefTitle}"</strong> has had its status updated to: <strong style="color: #0066cc;">${status.replace("_", " ")}</strong>.</p>
      ${reason ? `<p style="background: #f4f4f4; padding: 10px; border-left: 4px solid #ccc;"><strong>Reason:</strong> ${reason}</p>` : ""}
      <p style="margin-top: 30px; font-size: 12px; color: gray;">If you have any questions, please contact support.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Smart Brief" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Brief status updated: ${status}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send status email:", error);
  }
}

export async function sendEmployeeAssignmentEmail(to: string, employeeName: string, briefTitle: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">New Project Assigned</h2>
      <p>Hello ${employeeName},</p>
      <p>You have been assigned to a new brief: <strong>"${briefTitle}"</strong>.</p>
      <p>Please log in to your dashboard to view the documentation and begin production.</p>
      <p style="margin-top: 30px; font-size: 12px; color: gray;">This is an automated notification from Smart Brief Management.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Smart Brief" <${process.env.EMAIL_USER}>`,
      to,
      subject: `New Project Assigned: ${briefTitle}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send assignment email:", error);
  }
}

export async function sendAdminNewBriefEmail(to: string, clientName: string, briefTitle: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; color: #333;">
      <h2 style="color: #0d9488;">New Brief Submitted</h2>
      <p>A new brief has been submitted for review by <strong>${clientName}</strong>.</p>
      <p>Project Title: <strong>"${briefTitle}"</strong></p>
      <p>Please review the details and accept or refuse the project from your admin panel.</p>
      <p style="margin-top: 30px; font-size: 12px; color: gray;">Smart Brief Automated Oversight.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Smart Brief" <${process.env.EMAIL_USER}>`,
      to,
      subject: `New Brief Submission: ${briefTitle}`,
      html,
    });
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}
