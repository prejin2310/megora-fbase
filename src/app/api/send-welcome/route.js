import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name } = body || {};

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Only proceed for gmail addresses (per request)
    const isGmail = String(email).toLowerCase().endsWith("@gmail.com");
    if (!isGmail) {
      return NextResponse.json({ ok: true, skipped: true, reason: "not-gmail" });
    }

    const subject = "Welcome to Megora Jewels";
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111827;">
        <h2 style="margin-bottom:0.25rem">Welcome${name ? `, ${name}` : ""} 🎉</h2>
        <p style="color:#6b7280; margin-top:0.25rem">Thanks for creating an account at Megora Jewels. We're glad to have you.</p>
        <p style="margin-top:0.5rem; color:#6b7280">If you have any questions, reply to this email and we'll help.</p>
      </div>
    `;

    await sendEmail(email, subject, html);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/send-welcome error", err);
    return NextResponse.json({ error: err?.message || "unknown" }, { status: 500 });
  }
}
