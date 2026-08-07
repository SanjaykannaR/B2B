// Service for: Nodemailer email wrapper
// Module: Backend Services (Module 6) | Owner: Developer 1
// Sends HTML emails for overdue delivery notifications via SMTP

import nodemailer, { Transporter } from 'nodemailer';
import env from '../config/env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[EmailService] SMTP not configured — skipping email to ${to}: ${subject}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: `"B2B Logistics" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('[EmailService] Failed to send email:', (err as Error).message);
    return false;
  }
}

export function overdueEmailTemplate(manifest: {
  trackingId: string;
  origin: string;
  destination: string;
  windowClose: Date;
}): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e6ef;border-radius:12px;">
    <h2 style="color:#1B2A4A;margin:0 0 8px;">Delivery Overdue Alert</h2>
    <p style="color:#5A6178;margin:0 0 16px;">A shipment has missed its scheduled delivery window.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#5A6178;">Tracking ID</td><td style="padding:6px 0;font-weight:bold;color:#1A1D26;">${manifest.trackingId}</td></tr>
      <tr><td style="padding:6px 0;color:#5A6178;">Route</td><td style="padding:6px 0;font-weight:bold;color:#1A1D26;">${manifest.origin} → ${manifest.destination}</td></tr>
      <tr><td style="padding:6px 0;color:#5A6178;">Delivery Window Closed</td><td style="padding:6px 0;font-weight:bold;color:#1A1D26;">${manifest.windowClose.toLocaleString()}</td></tr>
    </table>
    <p style="color:#5A6178;margin:16px 0 0;">The manifest has been marked as <strong>Delayed</strong>. Please review operations.</p>
  </div>`;
}

export default { sendEmail, overdueEmailTemplate };
