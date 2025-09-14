import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { email } = await req.json();

    await sendEmail(
      email,
      "Welcome to Megora Jewels Newsletter",
      `<p>Hi there,</p>
       <p>Thank you for subscribing to our updates! ✨</p>`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
