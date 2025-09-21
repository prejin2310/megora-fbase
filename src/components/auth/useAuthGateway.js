"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import toast from "react-hot-toast"

import { auth, db } from "@/lib/firebase"
import { formatPhoneForAuth, sanitizePhone } from "./utils"

export function useAuthGateway({
  open,
  onAuthenticated,
  recaptchaId,
  defaultMode = "login",
  defaultMethod = "email",
} = {}) {
  const [mode, setMode] = useState(defaultMode)
  const [method, setMethod] = useState(defaultMethod)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const recaptchaRef = useRef(null)
  const confirmationRef = useRef(null)

  const resolvedRecaptchaId = recaptchaId || "auth-gateway-recaptcha"

  const headline = useMemo(() => {
    if (mode === "register") {
      return method === "email" ? "Create your Megora account" : "Join with your mobile"
    }
    return method === "email" ? "Welcome back" : "Access with your mobile"
  }, [mode, method])

  const resetState = useCallback(() => {
    setMode(defaultMode)
    setMethod(defaultMethod)
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setFullName("")
    setPhone("")
    setOtp("")
    setOtpSent(false)
    setLoading(false)
    setOtpLoading(false)
    confirmationRef.current = null
    if (recaptchaRef.current) {
      recaptchaRef.current.clear?.()
      recaptchaRef.current = null
    }
  }, [defaultMode, defaultMethod])

  useEffect(() => {
    if (!open) {
      resetState()
    }
  }, [open, resetState])

  useEffect(() => {
    if (method === "email") {
      setOtp("")
      setOtpSent(false)
      confirmationRef.current = null
      if (recaptchaRef.current) {
        recaptchaRef.current.clear?.()
        recaptchaRef.current = null
      }
    }
  }, [method])

  useEffect(() => {
    if (!open || method !== "phone" || typeof window === "undefined") return

    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, resolvedRecaptchaId, {
        size: "invisible",
      })
      recaptchaRef.current.render().catch((error) => {
        console.error("auth:recaptcha", error)
      })
    }
  }, [open, method, resolvedRecaptchaId])

  const handleEmailSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      if (loading || method !== "email") {
        return
      }

      if (mode === "register" && password !== confirmPassword) {
        toast.error("Passwords do not match.")
        return
      }

      try {
        setLoading(true)
        if (mode === "login") {
          const credentials = await signInWithEmailAndPassword(auth, email.trim(), password)
          toast.success("Signed in successfully.")
          onAuthenticated?.(credentials.user)
        } else {
          const credentials = await createUserWithEmailAndPassword(auth, email.trim(), password)
          const user = credentials.user

          if (fullName.trim()) {
            await updateProfile(user, { displayName: fullName.trim() })
          }

          const userDoc = doc(db, "users", user.uid)
          const snapshot = await getDoc(userDoc)
          const payload = {
            name: fullName.trim() || user.displayName || user.email?.split("@")[0] || "Patron",
            email: user.email,
            phone: phone ? sanitizePhone(phone) : null,
            role: "user",
            updatedAt: serverTimestamp(),
          }
          if (!snapshot.exists()) {
            payload.createdAt = serverTimestamp()
          }
          await setDoc(userDoc, payload, { merge: true })
          toast.success("Account created. You're all set!")
          onAuthenticated?.(user)
        }
      } catch (error) {
        console.error("auth:email", error)
        toast.error(error?.message || "We couldn't complete that request.")
      } finally {
        setLoading(false)
      }
    },
    [confirmPassword, email, fullName, loading, method, mode, onAuthenticated, password, phone]
  )

  const handleSendOtp = useCallback(async () => {
    if (otpLoading) return

    const formattedPhone = formatPhoneForAuth(phone)
    if (formattedPhone.length < 13) {
      toast.error("Enter a valid 10-digit Indian mobile number.")
      return
    }

    try {
      setOtpLoading(true)
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, resolvedRecaptchaId, {
          size: "invisible",
        })
        await recaptchaRef.current.render()
      }
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaRef.current)
      confirmationRef.current = confirmation
      setOtpSent(true)
      toast.success("OTP sent to your phone.")
    } catch (error) {
      console.error("auth:phone:send", error)
      toast.error(error?.message || "Unable to send OTP. Please try again.")
      recaptchaRef.current?.clear?.()
      recaptchaRef.current = null
    } finally {
      setOtpLoading(false)
    }
  }, [otpLoading, phone, resolvedRecaptchaId])

  const handleVerifyOtp = useCallback(
    async (event) => {
      event.preventDefault()

      if (!confirmationRef.current) {
        toast.error("Please request an OTP first.")
        return
      }

      if (otp.trim().length < 6) {
        toast.error("Enter the 6-digit OTP.")
        return
      }

      try {
        setLoading(true)
        const credentials = await confirmationRef.current.confirm(otp.trim())
        toast.success("You're signed in.")
        onAuthenticated?.(credentials.user)
      } catch (error) {
        console.error("auth:phone:verify", error)
        toast.error(error?.message || "Invalid OTP. Please retry.")
      } finally {
        setLoading(false)
      }
    },
    [onAuthenticated, otp]
  )

  const phoneFormHandler = useCallback(
    (event) => {
      if (!otpSent) {
        event.preventDefault()
        void handleSendOtp()
      } else {
        void handleVerifyOtp(event)
      }
    },
    [handleSendOtp, handleVerifyOtp, otpSent]
  )

  return {
    state: {
      mode,
      method,
      email,
      password,
      confirmPassword,
      fullName,
      phone,
      otp,
      loading,
      otpLoading,
      otpSent,
      headline,
    },
    actions: {
      setMode,
      setMethod,
      setEmail,
      setPassword,
      setConfirmPassword,
      setFullName,
      setPhone,
      setOtp,
      handleEmailSubmit,
      handleSendOtp,
      handleVerifyOtp,
      phoneFormHandler,
      resetState,
    },
    helpers: {
      recaptchaId: resolvedRecaptchaId,
    },
  }
}
