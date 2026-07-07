const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;

export function generateOtp(): string {
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export async function sendWhatsAppOtp(phoneNumber: string, otp: string): Promise<boolean> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const senderNumber = process.env.WHATSAPP_SENDER_NUMBER;

  if (!apiUrl || !apiKey || !senderNumber) {
    console.log(`[MOCK WhatsApp] OTP for ${phoneNumber}: ${otp}`);
    return true;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: `Your verification code is: *${otp}*\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", JSON.stringify(data, null, 2));
      return false;
    }

    console.log("WhatsApp OTP sent successfully:", data.messages?.[0]?.id);
    return true;
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    return false;
  }
}
