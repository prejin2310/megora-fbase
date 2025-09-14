import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Send email (generic helper)
export async function sendEmail(to, subject, html) {
  try {
    const data = await resend.emails.send({
      from: "Megora Jewels <megorajewels@gmail.com>",
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

// Example: Order confirmation
export async function sendOrderConfirmation(userEmail, orderId) {
  return sendEmail(
    userEmail,
    "Your Megora Jewels Order Confirmation",
    `<h2>Thank you for your order</h2>
     <p>Your order ID is <b>${orderId}</b>.</p>
     <p>We’ll notify you when it ships.</p>`
  );
}
