/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { Buffer } from "buffer"; // Node.js builtin

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "<booking@reparationroad.org>"; // Use your verified sender
const OWNER_EMAIL = "apaul@reparationroad.org"; // Where you receive bookings
const SITE_URL = "https://reparationroad.org";
const ICO_URL = `${SITE_URL}/Reparation Road-01.png`;

function createICS({
  name,
  email,
  sessionType,
  date, // 'YYYY-MM-DD'
  time, // '10:30 AM'
  durationMinutes = 30,
  description = "",
}: {
  name: string;
  email: string;
  sessionType: string;
  date: string;
  time: string;
  durationMinutes?: number;
  description?: string;
}) {
  // Parse time
  const [_, hourStr, minuteStr, ampm] = time.match(/(\d+):(\d+) (\w+)/) || [];
  let hour = parseInt(hourStr, 10);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const minute = parseInt(minuteStr, 10);

  // Create start/end Date in UTC
  const start = new Date(
    `${date}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00Z`
  );
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formatICS = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const startICS = formatICS(start);
  const endICS = formatICS(end);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Reparation Road//Booking//EN
BEGIN:VEVENT
UID:${start.getTime()}@reparationroad.org
DTSTAMP:${startICS}
DTSTART:${startICS}
DTEND:${endICS}
SUMMARY:Reparation Road ${sessionType === "genealogy" ? "Genealogy Consultation" : "Standard Research"}
DESCRIPTION:${description ? description.replace(/\n/g, " ") : "Your booking with Reparation Road"}
ORGANIZER;CN=Reparation Road:MAILTO:${FROM_EMAIL}
ATTENDEE;CN=${name}:MAILTO:${email}
LOCATION:Online or as discussed
END:VEVENT
END:VCALENDAR`;
}

// ------------------- GET handler: check bookings for a day -------------------
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date"); // format: YYYY-MM-DD
  if (!dateParam) return NextResponse.json({ times: [] });

  // Efficient: Only get bookings for this date
  const { data, error } = await supabase
    .from("bookings")
    .select("time")
    .eq("date", dateParam);

  if (error) return NextResponse.json({ times: [] });

  const times = (data ?? []).map((row) => row.time);

  return NextResponse.json({ times });
}

// ------------------- POST handler: booking and emails ------------------------
export async function POST(req: NextRequest) {
  try {
    const { name, email, message, sessionType, date, time } = await req.json();
    console.log("Received booking request:", {
      name,
      email,
      sessionType,
      date,
      time,
    });

    // Save to Supabase bookings table
    const { error } = await supabase.from("bookings").insert([
      {
        name,
        email,
        message,
        session_type: sessionType,
        date,
        time,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ---- Generate ICS calendar file ----
    const icsContent = createICS({
      name,
      email,
      sessionType,
      date,
      time,
      description: message,
    });
    const icsBase64 = Buffer.from(icsContent, "utf-8").toString("base64");

    // ---- HTML email content ----
    const prettySession =
      sessionType === "genealogy"
        ? "Genealogy Consultation"
        : "Standard Research Package";

    const styledHtml = `
  <body style="margin:0;padding:0;background:#f6f3ec;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6f3ec" style="width:100%;background:#f6f3ec;padding:0;margin:0;">
      <tr>
        <td align="center">
          <!-- Inner table for main content, centered and max-width -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fffbe6;border-radius:16px;box-shadow:0 4px 20px #ead9bc2c;padding:0;margin:32px 0;">
            <tr>
              <td style="padding:40px 32px 32px 32px;font-family:Inter,Arial,sans-serif;color:#2d230f;">
                <img src="${ICO_URL}" width="56" height="56" alt="Reparation Road" style="display:block;margin-bottom:24px;margin-left:auto;margin-right:auto;" />
                <h2 style="color:#7b471c;font-size:2rem;margin:0 0 24px 0;text-align:center;">Thank you for your booking!</h2>
                <p style="font-size:1.12rem;line-height:1.6;margin-bottom:20px;text-align:center;">
                  Hello ${name},<br>
                  We’ve received your booking for:
                </p>
                <table style="margin:0 auto 20px auto;border-radius:8px;padding:0;font-size:1rem;width:90%;box-shadow:0 2px 8px #e2d4bc22;">
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#276A35;"><b>Session:</b></td>
                    <td style="padding:12px 0;">${prettySession}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#276A35;"><b>Date:</b></td>
                    <td style="padding:12px 0;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#276A35;"><b>Time:</b></td>
                    <td style="padding:12px 0;">${time}</td>
                  </tr>
                </table>
                <p style="margin:18px 0 16px 0;"><b>Your message:</b><br>${message}</p>
                <p style="margin:0 0 20px 0;text-align:center;">We’ll contact you soon to confirm your session. You can add this event to your calendar with the attached invite.</p>
                <div style="text-align:center;">
                  <a href="${SITE_URL}" style="display:inline-block;background:#276A35;color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;box-shadow:0 2px 8px #e2d4bc33;margin:20px 0 0 0;">Visit Our Website</a>
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

    const ownerHtml = `
  <body style="margin:0;padding:0;background:#f6f3ec;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f6f3ec" style="width:100%;background:#f6f3ec;padding:0;margin:0;">
      <tr>
        <td align="center">
          <!-- Inner table for main content, centered and max-width -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fffbe6;border-radius:16px;box-shadow:0 4px 20px #ead9bc2c;padding:0;margin:32px 0;">
            <tr>
              <td style="padding:40px 32px 32px 32px;font-family:Inter,Arial,sans-serif;color:#2d230f;">
                <img src="${ICO_URL}" width="56" height="56" alt="Reparation Road" style="display:block;margin-bottom:24px;margin-left:auto;margin-right:auto;" />
                <h2 style="color:#276A35;font-size:2rem;margin:0 0 24px 0;text-align:center;">New Booking Received</h2>
                <table style="margin:0 auto 20px auto;background:#fff;border-radius:8px;padding:0;font-size:1rem;width:90%;box-shadow:0 2px 8px #e2d4bc22;">
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#7b471c;"><b>Name:</b></td>
                    <td style="padding:12px 0;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#7b471c;"><b>Email:</b></td>
                    <td style="padding:12px 0;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#276A35;"><b>Session Type:</b></td>
                    <td style="padding:12px 0;">${prettySession}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#276A35;"><b>Date:</b></td>
                    <td style="padding:12px 0;">${date}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px 12px 0;color:#276A35;"><b>Time:</b></td>
                    <td style="padding:12px 0;">${time}</td>
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

    // ---- Send to customer ----
    const customerRes = await resend.emails.send({
      from: `Reparation Road ${FROM_EMAIL}`,
      to: [email],
      subject: "Your Booking with Reparation Road",
      headers: { "X-Entity-Ref-ID": ICO_URL },
      html: styledHtml,
      attachments: [
        {
          filename: "booking.ics",
          content: icsBase64,
          contentType: "text/calendar",
        },
      ],
    });
    console.log("Resend customer email response:", customerRes);

    // ---- Send to owner/admin ----
    const ownerRes = await resend.emails.send({
      from: `RR New Appt ${FROM_EMAIL}`,
      to: [OWNER_EMAIL],
      subject: "New Booking Received",
      headers: { "X-Entity-Ref-ID": ICO_URL },
      html: ownerHtml,
      attachments: [
        {
          filename: "booking.ics",
          content: icsBase64,
          contentType: "text/calendar",
        },
      ],
    });
    console.log("Resend owner email response:", ownerRes);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
