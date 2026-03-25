import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInviteEmail({
  to,
  inviteCode,
  role,
  organizationName,
  inviterName,
}: {
  to: string;
  inviteCode: string;
  role: string;
  organizationName: string;
  inviterName: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const signupUrl = `${baseUrl}/signup?code=${inviteCode}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `You're invited to join ${organizationName} on NLschedule`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">You've been invited!</h2>
        <p style="color: #4a4a4a; font-size: 16px;">
          <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role.charAt(0) + role.slice(1).toLowerCase()}</strong>.
        </p>
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #0c4a6e; font-size: 14px;">Your invite code:</p>
          <p style="margin: 0; font-family: monospace; font-size: 24px; font-weight: bold; color: #0369a1;">${inviteCode}</p>
        </div>
        <a href="${signupUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
        <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
          Or copy this link: <a href="${signupUrl}" style="color: #2563eb;">${signupUrl}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          This invitation expires in 7 days.
        </p>
      </div>
    `,
    text: `${inviterName} has invited you to join ${organizationName} as a ${role.charAt(0) + role.slice(1).toLowerCase()}.\n\nYour invite code: ${inviteCode}\n\nSign up here: ${signupUrl}\n\nThis invitation expires in 7 days.`,
  });
}
