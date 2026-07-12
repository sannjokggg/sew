import { NextResponse } from "next/server";
import { emailWrapper } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const { default: nodemailer } = await import("nodemailer");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ionos.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const content = `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding:0 0 20px;">
            <h2 style="margin:0;font-size:20px;font-weight:700;color:#1a2e1a;">New Contact Message</h2>
            <p style="margin:6px 0 0;font-size:13px;color:#6B6B6B;">You received a new message through the SewaGo contact form.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f8f8;border-radius:10px;border:1px solid #f0f0f0;">
              <tr>
                <td style="padding:20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0 0 12px;">
                        <span style="font-size:11px;font-weight:700;color:#B8F25E;text-transform:uppercase;letter-spacing:1px;">From</span>
                        <br />
                        <span style="font-size:14px;font-weight:600;color:#1a2e1a;">${name}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 12px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td width="50%" valign="top" style="padding-right:8px;">
                              <span style="font-size:11px;font-weight:700;color:#B8F25E;text-transform:uppercase;letter-spacing:1px;">Email</span>
                              <br />
                              <a href="mailto:${email}" style="font-size:13px;color:#1a2e1a;text-decoration:none;">${email}</a>
                            </td>
                            <td width="50%" valign="top" style="padding-left:8px;">
                              <span style="font-size:11px;font-weight:700;color:#B8F25E;text-transform:uppercase;letter-spacing:1px;">Phone</span>
                              <br />
                              <span style="font-size:13px;color:#1a2e1a;">${phone || "Not provided"}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0;">&nbsp;</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:12px 0 0;">
                        <span style="font-size:11px;font-weight:700;color:#B8F25E;text-transform:uppercase;letter-spacing:1px;">Message</span>
                        <p style="margin:6px 0 0;font-size:13px;color:#202124;line-height:20px;white-space:pre-wrap;">${message}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#1a2e1a;border-radius:10px;">
              <tr>
                <td style="padding:14px 20px;">
                  <p style="margin:0;font-size:12px;color:#a3a3a3;text-align:center;line-height:18px;">
                    Reply directly to <a href="mailto:${email}" style="color:#B8F25E;text-decoration:none;font-weight:600;">${email}</a> to respond to this message.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"SewaGo Contact" <${process.env.SMTP_USER || "noreply@sewago.org"}>`,
      to: "support@sewago.org",
      subject: `New Contact Message from ${name}`,
      html: emailWrapper(content, `New message from ${name}: ${message.substring(0, 100)}...`),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
