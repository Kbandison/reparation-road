import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Customize these as needed:
const FROM_EMAIL = "kbandison@gmail.com"; // Use your verified sender
const OWNER_EMAIL = "kbandison@gmail.com"; // Where you receive bookings
const SITE_URL = "https://reparationroad.org";
const ICO_URL = `${SITE_URL}/favicon.ico`;

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date"); // format: YYYY-MM-DD
  if (!dateParam) return NextResponse.json({ times: [] });

  const { data, error } = await supabase.from("bookings").select("date, time");

  if (error) return NextResponse.json({ times: [] });

  // Only match bookings for that date (loose ISO match)
  const times = data
    .filter((row) => row.date && row.date.startsWith(dateParam))
    .map((row) => row.time);

  return NextResponse.json({ times });
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, sessionType, date, time } = await req.json();

    // Save to Supabase bookings table
    const { error } = await supabase.from("bookings").insert([
      {
        name,
        email,
        message,
        session_type: sessionType,
        date, // ISO date string, e.g. "2025-07-01"
        time, // e.g. "11:30 AM"
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Email to customer
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Your Booking with Reparation Road",
      headers: {
        "X-Entity-Ref-ID": ICO_URL,
      },
      html: `
        <div style="font-family:Inter,Arial,sans-serif">
          <img src="${ICO_URL}" width="32" height="32" alt="Reparation Road" style="vertical-align:middle;"/>
          <h2 style="color:#276A35;">Thank you for your booking!</h2>
          <p>Hello <b>${name}</b>,<br/>
          We've received your booking for <b>${sessionType}</b> on <b>${date} at ${time}</b>.</p>
          <p>Your message: <br/>${message}</p>
          <p>We'll contact you soon to confirm your session.<br/><br/>Reparation Road Team</p>
        </div>
      `,
    });

    // Email to owner/admin
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [OWNER_EMAIL],
      subject: "New Booking Request (Reparation Road)",
      headers: {
        "X-Entity-Ref-ID": ICO_URL,
      },
      html: `
        <div style="font-family:Inter,Arial,sans-serif">
          <img src="${ICO_URL}" width="32" height="32" alt="Reparation Road" style="vertical-align:middle;"/>
          <h2 style="color:#276A35;">New Booking Received</h2>
          <p><b>Name:</b> ${name}<br/>
          <b>Email:</b> ${email}<br/>
          <b>Session Type:</b> ${sessionType}<br/>
          <b>Date & Time:</b> ${date} at ${time}</p>
          <p><b>Message:</b><br/>${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
