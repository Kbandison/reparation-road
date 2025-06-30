import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "<onboarding@resend.dev>"; // Use your verified sender for testing
const OWNER_EMAIL = "kevin@reparationroad.org"; // Your email
const SITE_URL = "https://reparationroad.org";
const ICO_URL = `${SITE_URL}/Reparation Road-01.png`;

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // ---- HTML for owner notification ----
    const ownerHtml = `
      <body style="margin:0;padding:0;background:#f6f3ec;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6f3ec" style="width:100%;background:#f6f3ec;padding:0;margin:0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fffbe6;border-radius:16px;box-shadow:0 4px 20px #ead9bc2c;padding:0;margin:32px 0;">
                <tr>
                  <td style="padding:40px 32px 32px 32px;font-family:Inter,Arial,sans-serif;color:#2d230f;">
                    <img src="${ICO_URL}" width="56" height="56" alt="Reparation Road" style="display:block;margin-bottom:24px;margin-left:auto;margin-right:auto;" />
                    <h2 style="color:#276A35;font-size:2rem;margin:0 0 24px 0;text-align:center;">New Contact Message</h2>
                    <table style="margin:0 auto 20px auto;background:#fff;border-radius:8px;padding:0;font-size:1rem;width:90%;box-shadow:0 2px 8px #e2d4bc22;">
                      <tr>
                        <td style="padding:12px 14px 12px 0;color:#7b471c;"><b>Name:</b></td>
                        <td style="padding:12px 0;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 14px 12px 0;color:#7b471c;"><b>Email:</b></td>
                        <td style="padding:12px 0;">${email}</td>
                      </tr>
                    </table>
                    <p style="margin:18px 0 12px 0;"><b>Message:</b><br>${message}</p>
                    <div style="text-align:center;margin:30px 0 0 0;">
                      <a href="mailto:${email}" style="display:inline-block;background:#7b471c;color:white;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:600;box-shadow:0 2px 8px #e2d4bc33;">Reply to Customer</a>
                    </div>
                    <p style="margin:32px 0 0 0;font-size:1rem;color:#a78962;text-align:center;">Reparation Road Admin Notification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    `;

    // ---- HTML for customer confirmation ----
    const customerHtml = `
      <body style="margin:0;padding:0;background:#f6f3ec;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6f3ec" style="width:100%;background:#f6f3ec;padding:0;margin:0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fffbe6;border-radius:16px;box-shadow:0 4px 20px #ead9bc2c;padding:0;margin:32px 0;">
                <tr>
                  <td style="padding:40px 32px 32px 32px;font-family:Inter,Arial,sans-serif;color:#2d230f;">
                    <img src="${ICO_URL}" width="56" height="56" alt="Reparation Road" style="display:block;margin-bottom:24px;margin-left:auto;margin-right:auto;" />
                    <h2 style="color:#7b471c;font-size:2rem;margin:0 0 24px 0;text-align:center;">Thank You for Contacting Us!</h2>
                    <p style="font-size:1.12rem;line-height:1.6;margin-bottom:20px;text-align:center;">
                      Hi ${name},<br>
                      We’ve received your message and will reply soon.<br>
                    </p>
                    <table style="margin:0 auto 20px auto;background:#fff;border-radius:8px;padding:0;font-size:1rem;width:90%;box-shadow:0 2px 8px #e2d4bc22;">
                    </table>
                    <p style="margin:18px 0 16px 0;"><b>Your message:</b><br>${message}</p>
                    <div style="text-align:center;">
                      <a href="${SITE_URL}" style="display:inline-block;background:#276A35;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;box-shadow:0 2px 8px #e2d4bc33;margin:20px 0 0 0;">Return to Reparation Road</a>
                    </div>
                    <p style="margin:32px 0 0 0;font-size:1rem;color:#a78962;text-align:center;">Reparation Road Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    `;

    // ---- Send owner notification ----
    await resend.emails.send({
      from: `RR Inquiry ${FROM_EMAIL}`,
      to: [OWNER_EMAIL],
      subject: "New Inquiry",
      headers: { "X-Entity-Ref-ID": ICO_URL },
      replyTo: email, // enables "Reply" in inbox to go to the customer
      html: ownerHtml,
    });

    // ---- Send confirmation to customer (optional) ----
    await resend.emails.send({
      from: `Reparation Road ${FROM_EMAIL}`,
      to: [email],
      subject: "We've Received Your Message",
      headers: { "X-Entity-Ref-ID": ICO_URL },
      html: customerHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Route Error (Contact):", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
