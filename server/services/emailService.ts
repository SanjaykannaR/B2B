import nodemailer from 'nodemailer';
import env from '../config/env';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter | null => {
  if (!env.smtp.user || !env.smtp.pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
};

/**
 * Nodemailer wrapper. Soft-fails in development when SMTP creds are missing —
 * logs the would-be email instead of throwing.
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] Skipped (no SMTP creds): "${subject}" → ${to}`);
    return;
  }
  try {
    await t.sendMail({ from: `"B2B Logistics" <${env.smtp.user}>`, to, subject, html });
    console.log(`[email] Sent: "${subject}" → ${to}`);
  } catch (err) {
    console.error('[email] Failed to send:', err instanceof Error ? err.message : err);
  }
};
