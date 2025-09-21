"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import clsx from "clsx"
import toast from "react-hot-toast"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { inr } from "@/lib/utils"
import AuthSheet from "@/components/auth/AuthSheet"

const FREE_SHIPPING_THRESHOLD = 599
const BASE_DELIVERY_FEE = 50
const EXPRESS_SURCHARGE = 50
const COD_SURCHARGE = 50
const GIFT_WRAP_FEE = 30
const WAREHOUSE_PINCODE = "695010"
const NEIGHBOURING_STATES = ["TAMIL NADU", "KARNATAKA", "ANDHRA PRADESH"]

const DELIVERY_OPTIONS = {
  standard: {
    id: "standard",
    label: "Standard Delivery",
    description: "Arrives in 7-10 business days",
    badge: "Complimentary above Rs 599",
  },
  express: {
    id: "express",
    label: "Express Delivery",
    description: "Priority dispatch within 3-6 days",
    badge: "Adds Rs 50 priority care",
  },
}

const FALLBACK_IMAGE = "/product3.jpg"

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false)
      return
    }

    if (document.querySelector("script[data-razorpay]") || window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.dataset.razorpay = "true"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const generateOrderNumber = () => {
  const segment = Date.now().toString().slice(-6)
  const random = Math.floor(100 + Math.random() * 900)
  return `MG-${segment}${random}`
}

const sanitizePhone = (value = "") => value.replace(/[^0-9+]/g, "")
const sanitizePincode = (value = "") => value.replace(/\\D/g, "").slice(0, 6)
const toTitleCase = (value = "") =>
  value
    .toLowerCase()
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")


export default function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, initializing } = useAuth()
  const { cart, clearCart } = useCart() || { cart: [], clearCart: () => {} }

  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [buyNowItem, setBuyNowItem] = useState(null)
  const [contact, setContact] = useState({ email: "", phone: "" })
  const [shipping, setShipping] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billing, setBilling] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })
  const [deliveryMethod, setDeliveryMethod] = useState("standard")
  const [giftWrap, setGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [submitting, setSubmitting] = useState(false)
  const [pincodeMeta, setPincodeMeta] = useState({ status: "idle", data: null })
  const lookupRef = useRef(null)
  const baseLocationRef = useRef(null)
  const sanitizedShippingPincode = useMemo(() => sanitizePincode(shipping.pincode), [shipping.pincode])

  useEffect(() => {
    if (!initializing && !user) {
      setAuthSheetOpen(true)
    } else {
      setAuthSheetOpen(false)
    }
  }, [initializing, user])

  useEffect(() => {
    if (user?.email) {
      setContact((prev) => ({ ...prev, email: user.email }))
    }
  }, [user?.email])

  useEffect(() => {
    const encoded = searchParams.get("buyNow")
    if (encoded) {
      try {
        const parsed = JSON.parse(decodeURIComponent(encoded))
        setBuyNowItem(parsed)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("buyNow", JSON.stringify(parsed))
        }
      } catch (error) {
        console.error("checkout:invalid-buy-now", error)
      }
    } else if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("buyNow")
      if (cached) {
        try {
          setBuyNowItem(JSON.parse(cached))
        } catch (error) {
          console.error("checkout:invalid-buy-now-cache", error)
          sessionStorage.removeItem("buyNow")
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    let active = true

    if (!sanitizedShippingPincode) {
      setPincodeMeta({ status: "idle", data: null })
      return
    }

    if (sanitizedShippingPincode.length < 6) {
      setPincodeMeta({ status: "incomplete", data: null })
      return
    }

    const lookupPincode = async () => {
      try {
        setPincodeMeta({ status: "loading", data: null })
        if (!lookupRef.current) {
          const lookupModule = await import("india-pincode-lookup")
          const directory = lookupModule?.default || lookupModule
          if (!directory?.lookup) {
            throw new Error("pincode lookup unavailable")
          }
          lookupRef.current = directory.lookup.bind(directory)
          const baseResult = lookupRef.current(WAREHOUSE_PINCODE)
          baseLocationRef.current = baseResult?.[0] || null
        }
        if (!active) return
        const matches = lookupRef.current ? lookupRef.current(sanitizedShippingPincode) : []
        if (!active) return
        if (matches?.length) {
          setPincodeMeta({ status: "found", data: matches[0] })
        } else {
          setPincodeMeta({ status: "notfound", data: null })
        }
      } catch (error) {
        console.error("checkout:pincode-lookup", error)
        if (!active) return
        setPincodeMeta({ status: "error", data: null })
      }
    }

    lookupPincode()

    return () => {
      active = false
    }
  }, [sanitizedShippingPincode])

  const items = useMemo(() => {
    if (buyNowItem) return [buyNowItem]
    return cart || []
  }, [buyNowItem, cart])

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.price || 0) * Number(item.qty || 1), 0),
    [items]
  )
  const qualifiesForComplimentary = subtotal > FREE_SHIPPING_THRESHOLD
  const expressEligible = qualifiesForComplimentary

  const chargeBreakdown = useMemo(() => {
    const baseDelivery = subtotal > 0 && !qualifiesForComplimentary ? BASE_DELIVERY_FEE : 0
    const expressCharge = expressEligible && deliveryMethod === "express" ? EXPRESS_SURCHARGE : 0
    const giftCharge = giftWrap ? GIFT_WRAP_FEE : 0
    const codCharge = paymentMethod === "cod" ? COD_SURCHARGE : 0
    const total = subtotal + baseDelivery + expressCharge + giftCharge + codCharge

    return {
      subtotal,
      baseDelivery,
      expressCharge,
      giftCharge,
      codCharge,
      total,
    }
  }, [deliveryMethod, expressEligible, giftWrap, paymentMethod, qualifiesForComplimentary, subtotal])

  const selectedDeliveryOption = DELIVERY_OPTIONS[deliveryMethod] || DELIVERY_OPTIONS.standard
  const availableDeliveryOptions = useMemo(() => (expressEligible ? ["standard", "express"] : ["standard"]), [expressEligible])

  useEffect(() => {
    if (!expressEligible && deliveryMethod === "express") {
      setDeliveryMethod("standard")
    }
  }, [deliveryMethod, expressEligible])

  const estimatedDelivery = useMemo(() => {
    if (pincodeMeta.status !== "found" || !pincodeMeta.data) return null

    const baseState = (baseLocationRef.current?.stateName || "KERALA").toUpperCase()
    const baseDistrict = (baseLocationRef.current?.districtName || "THIRUVANANTHAPURAM").toUpperCase()
    const destinationState = (pincodeMeta.data.stateName || "").toUpperCase()
    const destinationDistrict = (pincodeMeta.data.districtName || "").toUpperCase()

    if (!destinationState) {
      return null
    }

    if (destinationState === baseState) {
      const sameCity = destinationDistrict && destinationDistrict === baseDistrict
      return {
        window: sameCity ? "2-3 days" : "2-4 days",
        context: sameCity ? "same-city" : "same-state",
        message: sameCity
          ? "Orders within Thiruvananthapuram usually reach you in 1-2 business days after dispatch"
          : "Kerala deliveries typically arrive in 2-5 business days after dispatch",
      }
    }

    if (NEIGHBOURING_STATES.includes(destinationState)) {
      return {
        window: "4-6 days",
        context: "neighbouring",
        message: "Receive priority delivery within 4-6 business days.",
      }
    }

    return {
      window: "6-10 days",
      context: "national",
      message: "Pan-India deliveries are fulfilled within 6-10 business days.",
    }
  }, [pincodeMeta])

  const destinationSummary = useMemo(() => {
    if (pincodeMeta.status !== "found" || !pincodeMeta.data) return null
    const { districtName, stateName } = pincodeMeta.data
    return [districtName, stateName].filter(Boolean).join(", ")
  }, [pincodeMeta])

  useEffect(() => {
    if (pincodeMeta.status !== "found" || !pincodeMeta.data) return

    const { districtName, stateName } = pincodeMeta.data
    setShipping((previous) => {
      const nextCity = previous.city?.trim() ? previous.city : toTitleCase(districtName || "")
      const nextState = previous.state?.trim() ? previous.state : toTitleCase(stateName || "")

      if (nextCity === previous.city && nextState === previous.state) {
        return previous
      }

      return {
        ...previous,
        city: nextCity || previous.city,
        state: nextState || previous.state,
      }
    })
  }, [pincodeMeta])

  const resetBuyNowCache = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("buyNow")
    }
  }

  const requireLogin = () => {
    setAuthSheetOpen(true)
    toast.error("Please log in to continue.")
  }

  const validateForm = () => {
    if (!items.length) {
      toast.error("Your bag is empty. Add a piece to continue.")
      return false
    }

    const trimmedEmail = contact.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail) {
      toast.error("Let us know where to send updates.")
      return false
    }
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Enter a valid email address so we can share updates.")
      return false
    }

    const normalizedPhone = sanitizePhone(contact.phone)
    if (!normalizedPhone) {
      toast.error("Add a contact number so our courier can reach you.")
      return false
    }
    if (normalizedPhone.length !== 10) {
      toast.error("Phone number should include 10 digits for courier updates.")
      return false
    }
    if (trimmedEmail !== contact.email || normalizedPhone !== contact.phone) {
      setContact((previous) => ({ ...previous, email: trimmedEmail, phone: normalizedPhone }))
    }

    const requiredShipping = [
      { value: shipping.fullName?.trim(), label: "recipient name" },
      { value: shipping.addressLine1?.trim(), label: "address" },
      { value: shipping.city?.trim(), label: "city" },
      { value: shipping.state?.trim(), label: "state" },
      { value: shipping.pincode?.trim(), label: "pincode" },
    ]

    const missingShipping = requiredShipping.find((field) => !field.value)
    if (missingShipping) {
      toast.error("Please add the " + missingShipping.label + ".")
      return false
    }

    if (sanitizePincode(shipping.pincode).length !== 6) {
      toast.error("Shipping pincode should be 6 digits.")
      return false
    }

    if (!billingSameAsShipping) {
      const requiredBilling = [
        { value: billing.fullName?.trim(), label: "billing name" },
        { value: billing.addressLine1?.trim(), label: "billing address" },
        { value: billing.city?.trim(), label: "billing city" },
        { value: billing.state?.trim(), label: "billing state" },
        { value: billing.pincode?.trim(), label: "billing pincode" },
      ]
      const missingBilling = requiredBilling.find((field) => !field.value)
      if (missingBilling) {
        toast.error("Please add the " + missingBilling.label + ".")
        return false
      }
      if (sanitizePincode(billing.pincode).length !== 6) {
        toast.error("Billing pincode should be 6 digits.")
        return false
      }
    }

    if (giftWrap && giftMessage.trim().length > 140) {
      toast.error("Gift note can be up to 140 characters.")
      return false
    }

    return true
  }

  const createOrderDocument = async ({ paymentStatus, paymentDetails, razorpayOrderId, orderNumberOverride }) => {
    const orderNumber = orderNumberOverride || generateOrderNumber()
    const payload = {
      userId: user.uid,
      orderNumber,
      contact,
      shipping,
      billingSameAsShipping,
      billing: billingSameAsShipping ? shipping : billing,
      delivery: {
        method: deliveryMethod,
        label: selectedDeliveryOption.label,
        eta: selectedDeliveryOption.description,
        estimateWindow: estimatedDelivery?.window || null,
        estimateCopy: estimatedDelivery?.message || null,
        destination: destinationSummary || null,
        complimentary: qualifiesForComplimentary,
        baseDelivery: chargeBreakdown.baseDelivery,
        expressCharge: chargeBreakdown.expressCharge,
      },
      giftWrap,
      giftMessage: giftWrap ? giftMessage.trim() || null : null,
      notes: notes.trim() ? notes.trim() : null,
      items,
      charges: {
        subtotal: chargeBreakdown.subtotal,
        baseDelivery: chargeBreakdown.baseDelivery,
        expressCharge: chargeBreakdown.expressCharge,
        giftWrap: chargeBreakdown.giftCharge,
        codCharge: chargeBreakdown.codCharge,
        complimentaryShipping: qualifiesForComplimentary,
        total: chargeBreakdown.total,
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: paymentDetails?.razorpay_payment_id || null,
        razorpaySignature: paymentDetails?.razorpay_signature || null,
      },
      status: paymentStatus === "paid" ? "processing" : "awaiting_payment",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const orderRef = await addDoc(collection(db, "orders"), payload)
    if (!buyNowItem) {
      clearCart()
    }
    resetBuyNowCache()

    return { orderId: orderRef.id, orderNumber }
  }

  const handleCodCheckout = async () => {
    const order = await createOrderDocument({ paymentStatus: "pending" })
    toast.success("Order placed with Cash on Delivery.")
    router.push(`/order-success/${order.orderId}`)
  }

  const handleRazorpayCheckout = async () => {
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay. Please retry.")
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!keyId) {
      throw new Error("Razorpay key is missing. Please contact support.")
    }

    const orderNumber = generateOrderNumber()
    const response = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: chargeBreakdown.total,
        notes: {
          orderNumber,
          deliveryMethod,
          giftWrap: giftWrap ? "yes" : "no",
          giftMessage: giftWrap ? giftMessage.trim() || undefined : undefined,
          complimentaryShipping: qualifiesForComplimentary ? "yes" : "no",
          estimatedWindow: estimatedDelivery?.window || undefined,
          destination: destinationSummary || undefined,
          shippingCharge: chargeBreakdown.baseDelivery || 0,
          expressCharge: chargeBreakdown.expressCharge || 0,
          codCharge: chargeBreakdown.codCharge || 0,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Unable to create Razorpay order. Please try again.")
    }

    const razorpayOrder = await response.json()

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Megora Jewels",
        description: `Order ${orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: shipping.fullName,
          email: contact.email,
          contact: contact.phone,
        },
        notes: {
          orderNumber,
          deliveryMethod,
          giftWrap: giftWrap ? "yes" : "no",
          complimentaryShipping: qualifiesForComplimentary ? "yes" : "no",
          estimatedWindow: estimatedDelivery?.window || undefined,
          destination: destinationSummary || undefined,
        },
        theme: {
          color: "#0F403B",
        },
        handler: async (paymentResponse) => {
          try {
            const order = await createOrderDocument({
              paymentStatus: "paid",
              paymentDetails: paymentResponse,
              razorpayOrderId: razorpayOrder.id,
              orderNumberOverride: orderNumber,
            })
            toast.success("Payment successful.")
            router.push(`/order-success/${order.orderId}?txn=${paymentResponse.razorpay_payment_id}`)
            resolve()
          } catch (error) {
            reject(error)
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
            toast.error("Payment cancelled.")
            reject(new Error("Payment cancelled"))
          },
        },
      })

      rzp.on("payment.failed", (error) => {
        setSubmitting(false)
        console.error("razorpay:payment-failed", error)
        toast.error(error?.error?.description || "Payment failed. Please try again.")
        reject(new Error("Payment failed"))
      })

      rzp.open()
    })
  }

  const handleSubmitOrder = async () => {
    if (!user) {
      requireLogin()
      return
    }

    if (!validateForm()) return

    try {
      setSubmitting(true)

      if (paymentMethod === "cod") {
        await handleCodCheckout()
      } else {
        await handleRazorpayCheckout()
      }
    } catch (error) {
      console.error("checkout:submit", error)
      toast.error(error?.message || "Unable to place order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const renderAddressFields = (state, updater, disabled = false) => {
    const handleChange = (field, formatter = (value) => value) => (event) =>
      updater((previous) => ({
        ...previous,
        [field]: formatter(event.target.value),
      }))

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            value={state.fullName}
            onChange={handleChange("fullName")}
            placeholder="Full name"
            disabled={disabled}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <input
            value={state.pincode}
            onChange={handleChange("pincode", sanitizePincode)}
            placeholder="Pincode"
            disabled={disabled}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <input
          value={state.addressLine1}
          onChange={handleChange("addressLine1")}
          placeholder="Address line 1"
          disabled={disabled}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <input
          value={state.addressLine2}
          onChange={handleChange("addressLine2")}
          placeholder="Apartment, suite, etc. (optional)"
          disabled={disabled}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            value={state.city}
            onChange={handleChange("city")}
            placeholder="City"
            disabled={disabled}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <input
            value={state.state}
            onChange={handleChange("state")}
            placeholder="State"
            disabled={disabled}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <input
            value={state.country}
            onChange={handleChange("country")}
            placeholder="Country"
            disabled={disabled}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
      </div>
    )
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F6F3EF] via-white to-[#F1F8F5]">
        <div className="flex flex-col items-center gap-3 text-brand">
          <div className="h-12 w-12 rounded-full border-2 border-brand/30 border-t-transparent animate-spin" aria-hidden="true" />
          <p className="text-sm uppercase tracking-[0.3em] text-brand/70">Preparing checkout...</p>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F6F3EF] via-white to-[#F1F8F5] px-4">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Your cart looks empty</h1>
          <p className="mt-3 text-sm text-gray-600">Add a favourite to your bag before heading to checkout.</p>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow"
          >
            Explore collection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfaf5] via-[#f4eee6] to-[#eaf6f3] pb-20 pt-40 lg:pt-48">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:flex-row">
        <div className="flex-1 space-y-8">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand/60">Megora checkout</p>
            <h1 className="text-3xl font-semibold text-gray-900">Secure your selection</h1>
            <p className="text-sm text-gray-600">
              Review your details to enjoy complimentary standard delivery on orders above Rs 599, or upgrade to express care for a flat Rs 50.
            </p>
          </header>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Contact information</h2>
            <p className="mt-1 text-sm text-gray-500">We will send confirmations to this email and phone number.</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="email"
                value={contact.email}
                onChange={(event) => setContact({ ...contact, email: event.target.value })}
                placeholder="Email address"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
              <input
                type="tel"
                value={contact.phone}
                onChange={(event) => setContact({ ...contact, phone: sanitizePhone(event.target.value) })}
                placeholder="Phone number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Shipping address</h2>
              <p className="text-xs text-right text-gray-500">Orders leave our Trivandrum atelier (PIN 695010) with insured couriers.</p>
            </div>
            <div className="mt-4 space-y-4">
              {renderAddressFields(shipping, setShipping)}
              <div
                className={clsx(
                  "rounded-xl border px-4 py-3 text-sm",
                  pincodeMeta.status === "found"
                    ? "border-brand/20 bg-brand/5 text-brand"
                    : pincodeMeta.status === "loading"
                    ? "border-brand/20 bg-brand/5 text-brand"
                    : pincodeMeta.status === "error" || pincodeMeta.status === "notfound"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                )}
              >
                {pincodeMeta.status === "loading" && (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current" aria-hidden="true" />
                    <span>Checking delivery timelines for your pincode</span>
                  </div>
                )}
                {pincodeMeta.status === "idle" && <p>Enter a 6-digit pincode to preview your delivery window.</p>}
                {pincodeMeta.status === "incomplete" && <p>Please complete the 6-digit pincode to calculate the estimate.</p>}
                {pincodeMeta.status === "notfound" && (
                  <p>{"We couldn't locate that pincode. Double-check the digits and try again."}</p>
                )}
                {pincodeMeta.status === "error" && (
                  <p>{"We're unable to look up this pincode right now. We'll confirm timelines after you place the order."}</p>
                )}
                {pincodeMeta.status === "found" && estimatedDelivery && (
                  <div className="space-y-1">
                    <p className="font-medium">Estimated arrival: {estimatedDelivery.window}</p>
                    {destinationSummary && (
                      <p className="text-xs">Dispatching to {destinationSummary}.</p>
                    )}
                    {estimatedDelivery.message && (
                      <p className="text-xs">{estimatedDelivery.message}</p>
                    )}
                  </div>
                )}
                {pincodeMeta.status === "found" && !estimatedDelivery && (
                  <p>We will confirm the exact delivery window shortly for this destination.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Billing address</h2>
              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(event) => setBillingSameAsShipping(event.target.checked)}
                />
                Same as shipping
              </label>
            </div>
            {!billingSameAsShipping && <div>{renderAddressFields(billing, setBilling)}</div>}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delivery method</h2>
              <p className="mt-1 text-sm text-gray-500">Standard dispatch is complimentary once your cart crosses Rs 599. Express adds Rs 50 for priority handling.</p>
              {pincodeMeta.status === "found" && estimatedDelivery && destinationSummary && (
                <p className="mt-2 text-xs text-brand">We currently estimate {estimatedDelivery.window} to {destinationSummary}.</p>
              )}
              <div className="mt-4 space-y-3">
                {availableDeliveryOptions.map((optionKey) => {
                  const option = DELIVERY_OPTIONS[optionKey]
                  const isSelected = deliveryMethod === option.id
                  const isExpress = option.id === "express"
                  const isDisabled = isExpress && !expressEligible

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (isDisabled) return
                        setDeliveryMethod(option.id)
                      }}
                      disabled={isDisabled}
                      className={clsx(
                        "w-full rounded-2xl border px-4 py-4 text-left transition",
                        isSelected ? "border-brand bg-brand/5 shadow-sm" : "border-gray-200 hover:border-brand/40",
                        isDisabled ? "cursor-not-allowed opacity-60" : ""
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                          {isExpress && !expressEligible && (
                            <p className="mt-2 text-xs text-gray-500">
                              Available when your bag enjoys complimentary shipping above {inr(FREE_SHIPPING_THRESHOLD + 1)}.
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand/70">
                          {option.id === "standard" && qualifiesForComplimentary ? "Complimentary" : option.badge}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
              {!qualifiesForComplimentary && (
                <p className="text-xs text-gray-500">
                  Orders below Rs {FREE_SHIPPING_THRESHOLD + 1} include a handcrafted packaging & courier care fee of {inr(BASE_DELIVERY_FEE)}.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-neutral-50/80 p-4">
              <label className="inline-flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(event) => setGiftWrap(event.target.checked)}
                />
                Personalise my wrapping (+{inr(GIFT_WRAP_FEE)})
              </label>
              <p className="text-xs text-gray-500">Includes a handwritten card, anti-tarnish pouch, and ribboned gift box.</p>
              {giftWrap && (
                <textarea
                  rows={3}
                  maxLength={140}
                  value={giftMessage}
                  onChange={(event) => setGiftMessage(event.target.value)}
                  placeholder="Gift message for the recipient (optional, 140 characters)"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={clsx(
                    "rounded-2xl border px-4 py-4 text-left transition",
                    paymentMethod === "razorpay" ? "border-brand bg-brand/5" : "border-gray-200 hover:border-brand/40"
                  )}
                >
                  <p className="font-medium text-gray-900">UPI / Card (Razorpay)</p>
                  <p className="text-sm text-gray-500">Instant confirmation via Cards, UPI, Netbanking.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={clsx(
                    "rounded-2xl border px-4 py-4 text-left transition",
                    paymentMethod === "cod" ? "border-brand bg-brand/5" : "border-gray-200 hover:border-brand/40"
                  )}
                >
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Adds {inr(COD_SURCHARGE)} handling for courier COD service.</p>
                  <p className="mt-2 text-xs text-amber-600">
                    Premium jewels ship with insured partners. Cash on Delivery incurs a Rs 50 handling commission collected by the courier agency.
                  </p>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order notes</h2>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Share sizing requests, landmark directions, or concierge notes (optional)."
                className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
          </section>
        </div>

        <aside className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
            <span className="text-sm text-gray-500">{items.length} item(s)</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const imageSrc =
                item.image ||
                item.imageUrl ||
                item.media?.[0]?.url ||
                item.images?.[0]?.url ||
                FALLBACK_IMAGE

              return (
                <li key={`${item.id}-${index}`} className="flex items-start gap-4 py-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-neutral-50">
                    <Image
                      src={imageSrc}
                      alt={item.title || "Product"}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty {item.qty} | {item.variant || "Default"}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {inr(Number(item.price || 0) * Number(item.qty || 1))}
                  </span>
                </li>
              )
            })}
          </ul>

          <dl className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{inr(chargeBreakdown.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className={clsx(
                chargeBreakdown.baseDelivery === 0 ? "font-medium text-emerald-600" : "font-medium text-gray-700"
              )}>
                {chargeBreakdown.baseDelivery === 0 ? "Complimentary" : inr(chargeBreakdown.baseDelivery)}
              </dd>
            </div>
            {chargeBreakdown.expressCharge > 0 && (
              <div className="flex justify-between">
                <dt>Express upgrade</dt>
                <dd>{inr(chargeBreakdown.expressCharge)}</dd>
              </div>
            )}
            {chargeBreakdown.giftCharge > 0 && (
              <div className="flex justify-between">
                <dt>Gift wrap</dt>
                <dd>{inr(chargeBreakdown.giftCharge)}</dd>
              </div>
            )}
            {chargeBreakdown.codCharge > 0 && (
              <div className="flex justify-between">
                <dt>COD handling</dt>
                <dd>{inr(chargeBreakdown.codCharge)}</dd>
              </div>
            )}
          </dl>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>{inr(chargeBreakdown.total)}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Processing..." : paymentMethod === "razorpay" ? "Pay securely" : "Confirm COD order"}
          </button>
          <p className="text-xs text-gray-500">
            By placing this order you agree to Megora&apos;s delivery timelines and jewellery care policies.
          </p>
        </aside>
      </div>

      {submitting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/80 px-6 py-5 shadow-lg shadow-black/10">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand/20 border-t-brand" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700">Processing your order</p>
            <p className="text-xs text-gray-500">Hold tight while we confirm the payment securely.</p>
          </div>
        </div>
      )}

      <AuthSheet
        open={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
        onAuthenticated={() => {
          setAuthSheetOpen(false)
          if (user?.email) {
            setContact((prev) => ({ ...prev, email: user.email }))
          }
          toast.success("You're signed in. Continue placing your order.")
        }}
      />
    </div>
  )
}




