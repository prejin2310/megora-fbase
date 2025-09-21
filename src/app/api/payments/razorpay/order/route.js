import Razorpay from "razorpay"

export const runtime = "nodejs"

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, currency = "INR", notes } = body || {}

    if (!amount || Number.isNaN(Number(amount))) {
      return new Response(
        JSON.stringify({ message: "Amount is required to create a Razorpay order." }),
        { status: 400 }
      )
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({
          message: "Razorpay credentials are missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        }),
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: `megora_${Date.now()}`,
      notes,
    })

    return new Response(JSON.stringify(order), { status: 200 })
  } catch (error) {
    console.error("razorpay-order", error)
    return new Response(
      JSON.stringify({ message: "Unable to create Razorpay order." }),
      { status: 500 }
    )
  }
}
