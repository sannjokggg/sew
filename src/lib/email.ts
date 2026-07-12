import nodemailer from "nodemailer";

const SITE_URL = process.env.NEXTAUTH_URL || "https://www.sewago.org";
const LOGO_URL = `${SITE_URL}/header.png`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function emailWrapper(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  ${preheader ? `<meta name="description" content="${preheader}" />` : ""}
  <title>SewaGo</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  ${preheader ? `<div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ""}

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Main Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Accent Bar -->
          <tr>
            <td style="height:4px;background-color:#B8F25E;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding:32px 40px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-right:12px;">
                    <a href="${SITE_URL}" target="_blank" style="text-decoration:none;">
                      <img src="${LOGO_URL}" alt="SewaGo" width="48" height="48" style="display:block;width:48px;height:48px;object-fit:contain;border-radius:12px;" />
                    </a>
                  </td>
                  <td align="left" valign="middle">
                    <a href="${SITE_URL}" target="_blank" style="text-decoration:none;">
                      <span style="font-size:24px;font-weight:700;color:#1a2e1a;letter-spacing:-0.5px;">SewaGo</span>
                    </a>
                    <br />
                    <span style="font-size:11px;color:#6B6B6B;letter-spacing:0.5px;text-transform:uppercase;">Social Service Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="height:1px;background-color:#f3f4f6;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#1a2e1a;">
                <!-- Top Accent Line -->
                <tr>
                  <td style="height:4px;background-color:#B8F25E;font-size:0;line-height:0;">&nbsp;</td>
                </tr>

                <!-- Footer Content -->
                <tr>
                  <td style="padding:32px 40px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <!-- Brand Column -->
                        <td valign="top" width="50%" style="padding-right:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-bottom:8px;">
                                <img src="${LOGO_URL}" alt="SewaGo" width="32" height="32" style="display:block;width:32px;height:32px;object-fit:contain;border-radius:8px;" />
                              </td>
                            </tr>
                          </table>
                          <span style="font-size:18px;font-weight:700;color:#B8F25E;">SewaGo</span>
                          <br />
                          <span style="font-size:11px;color:#a3a3a3;letter-spacing:0.5px;text-transform:uppercase;">Social Service Platform</span>
                          <p style="margin:12px 0 0;font-size:12px;color:#a3a3a3;line-height:16px;">
                            Empowering communities through exchange, events, donations, and sustainability. Together for a better tomorrow.
                          </p>
                        </td>

                        <!-- Contact Column -->
                        <td valign="top" width="50%" style="padding-left:16px;">
                          <span style="font-size:12px;font-weight:700;color:#B8F25E;text-transform:uppercase;letter-spacing:1px;">Contact Us</span>
                          <p style="margin:10px 0 0;font-size:13px;color:#e5e5e5;line-height:20px;">
                            <strong style="color:#ffffff;">Sanjok Gahrti</strong><br />
                            <span style="color:#a3a3a3;">Admin, SewaGo Nepal</span>
                          </p>
                          <p style="margin:10px 0 0;font-size:12px;color:#a3a3a3;line-height:20px;">
                            <a href="mailto:support@sewago.org" style="color:#B8F25E;text-decoration:none;">support@sewago.org</a>
                          </p>
                          <p style="margin:4px 0 0;font-size:12px;color:#a3a3a3;line-height:20px;">
                            <a href="tel:+9779868597841" style="color:#a3a3a3;text-decoration:none;">+977 9868597841</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Quick Links -->
                <tr>
                  <td style="padding:0 40px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="height:1px;background-color:rgba(255,255,255,0.1);font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                    <p style="margin:12px 0 0;font-size:11px;color:#737373;line-height:18px;text-align:center;">
                      <a href="${SITE_URL}/marketplace" style="color:#a3a3a3;text-decoration:none;margin:0 8px;">Marketplace</a>
                      <span style="color:#404040;">|</span>
                      <a href="${SITE_URL}/events" style="color:#a3a3a3;text-decoration:none;margin:0 8px;">Events</a>
                      <span style="color:#404040;">|</span>
                      <a href="${SITE_URL}/about" style="color:#a3a3a3;text-decoration:none;margin:0 8px;">About</a>
                      <span style="color:#404040;">|</span>
                      <a href="${SITE_URL}/dashboard/donations" style="color:#a3a3a3;text-decoration:none;margin:0 8px;">Donate</a>
                    </p>
                  </td>
                </tr>

                <!-- Social Icons -->
                <tr>
                  <td align="center" style="padding:0 40px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- LinkedIn -->
                        <td style="padding:0 4px;">
                          <a href="#" target="_blank" style="text-decoration:none;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="width:32px;height:32px;background-color:rgba(255,255,255,0.1);border-radius:50%;text-align:center;vertical-align:middle;">
                                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE5IDBoLTE0Yy0yLjc2MSAwLTUgMi4yMzktNSA1djE0YzAgMi43NjEgMi4yMzkgNSA1IDVoMTRjMi43NjIgMCA1LTIuMjM5IDUtNXYtMTRjMC0yLjc2MS0yLjIzOC01LTUtNXptLTExIDE5aC0zdi0xMWgzdjExem0tMS41LTEyLjI2OGMtLjk2NiAwLTEuNzUtLjc5LTEuNzUtMS43NjRzLjc4NC0xLjc2NCAxLjc1LTEuNzY0IDEuNzUuNzkgMS43NSAxLjc2NC0uNzgzIDEuNzY0LTEuNzUgMS43NjR6bTEzLjUgMTIuMjY4aC0zdi01LjYwNGMwLTMuMzY4LTQtMy4xMTMtNCAwdjUuNjA0aC0zdi0xMWgzdjEuNzY1YzEuMzk2LTIuNTg2IDctMi43NzcgNyAyLjQ3NnY2Ljc1OXoiLz48L3N2Zz4=" alt="LinkedIn" width="14" height="14" style="display:block;margin:9px auto;" />
                                </td>
                              </tr>
                            </table>
                          </a>
                        </td>
                        <!-- Instagram -->
                        <td style="padding:0 4px;">
                          <a href="#" target="_blank" style="text-decoration:none;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="width:32px;height:32px;background-color:rgba(255,255,255,0.1);border-radius:50%;text-align:center;vertical-align:middle;">
                                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIuMTYzYzMuMjA0IDAgMy41ODQuMDEyIDQuODUuMDcgMy4yNTIuMTQ4IDQuNzcxIDEuNjkxIDQuOTE5IDQuOTE5LjA1OCAxLjI2NS4wNjkgMS42NDUuMDY5IDQuODQ5IDAgMy4yMDUtLjAxMiAzLjU4NC0uMDY5IDQuODQ5LS4xNDkgMy4yMjUtMS42NjQgNC43NzEtNC45MTkgNC45MTktMS4yNjYuMDU4LTEuNjQ0LjA3LTQuODUuMDctMy4yMDQgMC0zLjU4NC0uMDEyLTQuODQ5LS4wNy0zLjI2LS4xNDktNC43NzEtMS42OTktNC45MTktNC45Mi0uMDU4LTEuMjY1LS4wNy0xLjY0NC0uMDctNC44NDkgMC0zLjIwNC4wMTMtMy41ODMuMDctNC44NDkuMTQ5LTMuMjI3IDEuNjY0LTQuNzcxIDQuOTE5LTQuOTE5IDEuMjY2LS4wNTcgMS42NDUtLjA2OSA0Ljg0OS0uMDY5em0wLTIuMTYzYy0zLjI1OSAwLTMuNjY3LjAxNC00Ljk0Ny4wNzItNC4zNTguMi02Ljc4IDIuNjE4LTYuOTggNi45OC0uMDU5IDEuMjgxLS4wNzMgMS42ODktLjAzIDQuOTQ4IDAgMy4yNTkuMDE0IDMuNjY4LjA3MiA0Ljk0OC4yIDQuMzU4IDIuNjE4IDYuNzggNi45OCA2Ljk4IDEuMjgxLjA1OCAxLjY4OS4wNzIgNC45NDguMDcyIDMuMjU5IDAgMy42NjgtLjAxNCA0Ljk0OC0uMDcyIDQuMzU0LS4yIDYuNzgyLTIuNjE4IDYuOTc5LTYuOTguMDU5LTEuMjguMDczLTEuNjg5LjA3My00Ljk0OCAwLTMuMjU5LS4wMTQtMy42NjYtLjA3Mi00Ljk0Ny0uMTk2LTQuMzU0LTIuNjE3LTYuNzgtNi45NzktNi45OC0xLjI4MS0uMDU5LTEuNjktLjA3My00Ljk0OS0uMDczem0wIDUuODM4Yy0zLjQwMyAwLTYuMTYyIDIuNzU5LTYuMTYyIDYuMTYyczIuNzU5IDYuMTYzIDYuMTYyIDYuMTYzIDYuMTYyLTIuNzU5IDYuMTYyLTYuMTYzYzAtMy40MDMtMi43NTktNi4xNjItNi4xNjItNi4xNjJ6bTAgMTAuMTYyYy0yLjIwOSAwLTQtMS43OS00LTQgMC0yLjIwOSAxLjc5MS00IDQtNHM0IDEuNzkxIDQgNGMwIDIuMjEtMS43OTEgNC00IDR6bTYuNDA2LTExLjg0NS0uNzk2IDAtMS40NDEuNjQ1LTEuNDQxIDEuNDQgLjY0NSAxLjQ0IDEuNDQxIDEuNDRjLjc5NSAwIDEuNDM5LS42NDUgMS40MzktMS40NHMtLjY0NC0xLjQ0LTEuNDM5LTEuNDR6Ii8+PC9zdmc+" alt="Instagram" width="14" height="14" style="display:block;margin:9px auto;" />
                                </td>
                              </tr>
                            </table>
                          </a>
                        </td>
                        <!-- Facebook -->
                        <td style="padding:0 4px;">
                          <a href="#" target="_blank" style="text-decoration:none;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="width:32px;height:32px;background-color:rgba(255,255,255,0.1);border-radius:50%;text-align:center;vertical-align:middle;">
                                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTkgOGgtM3Y0aDN2MTJoNXYtMTJoMy42NDJsLjM1OC00aC00di0xLjY2N2MwLS45NTUuMTkyLTEuMzMzIDEuMTE1LTEuMzMzSDIydi01aC0zLjgwOGMtMy41OTYgMC01LjE5MiAxLjU4My01LjE5MiA0LjYxNXYzLjM4NXoiLz48L3N2Zz4=" alt="Facebook" width="14" height="14" style="display:block;margin:9px auto;" />
                                </td>
                              </tr>
                            </table>
                          </a>
                        </td>
                        <!-- YouTube -->
                        <td style="padding:0 4px;">
                          <a href="#" target="_blank" style="text-decoration:none;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="width:32px;height:32px;background-color:rgba(255,255,255,0.1);border-radius:50%;text-align:center;vertical-align:middle;">
                                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE5LjYxNSAzLjE4NGMtMy42MDQtLjI0Ni0xMS42MzEtLjI0NS0xNS4yMyAwLTMuODk3LjI2Ni00LjM1NiAyLjYyLTQuMzg1IDguODE2LjAyOSA2LjE4NS40ODQgOC41NDkgNC4zODUgOC44MTYgMy42LjI0NSAxMS42MjYuMjQ2IDE1LjIzIDAgMy44OTctLjI2NiA0LjM1Ni0yLjYyIDQuMzg1LTguODE2LS4wMjktNi4xODUtLjQ4NC04LjU0OS00LjM4NS04LjgxNnptLTEwLjYxNSAxMi44MTZ2LTgsOCAzLjk5My04IDQuMDA3eiIvPjwvc3ZnPg==" alt="YouTube" width="14" height="14" style="display:block;margin:9px auto;" />
                                </td>
                              </tr>
                            </table>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Copyright -->
                <tr>
                  <td style="padding:0 40px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="height:1px;background-color:rgba(255,255,255,0.1);font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                    <p style="margin:12px 0 0;font-size:11px;color:#737373;text-align:center;line-height:16px;">
                      &copy; ${new Date().getFullYear()} SewaGo. All Rights Reserved.
                      <br />
                      Crafted by <strong style="color:#a3a3a3;">Solves Lab</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEmailOtp(to: string, otp: string): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[MOCK EMAIL] OTP for ${to}: ${otp}`);
    return true;
  }

  const content = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:0 0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:64px;height:64px;background-color:#1a2e1a;border-radius:50%;text-align:center;vertical-align:middle;">
                <img src="${LOGO_URL}" alt="SewaGo" width="40" height="40" style="display:block;margin:12px auto;border-radius:50%;" />
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 0 8px;">
          <h2 style="margin:0;font-size:22px;font-weight:700;color:#1a2e1a;">Verify Your Email</h2>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 0 28px;">
          <p style="margin:0;font-size:14px;color:#6B6B6B;line-height:20px;">
            Use the code below to verify your email address on SewaGo.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 0 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:#f8f8f8;border:2px dashed #B8F25E;border-radius:12px;padding:16px 36px;">
                <span style="font-size:36px;font-weight:800;color:#1a2e1a;letter-spacing:10px;font-family:'Courier New',monospace;">${otp}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0 0 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="height:1px;background-color:#f3f4f6;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:8px 0 0;">
          <p style="margin:0;font-size:12px;color:#9A9A9A;line-height:18px;">
            This code expires in <strong style="color:#6B6B6B;">5 minutes</strong>. If you didn't request this, please ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"SewaGo" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your SewaGo Verification Code",
      html: emailWrapper(content, `Your verification code is ${otp}. It expires in 5 minutes.`),
    });
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    console.log(`[MOCK EMAIL] OTP for ${to}: ${otp}`);
    return true;
  }
}

export { emailWrapper };
