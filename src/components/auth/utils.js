export const sanitizePhone = (value = "") => {
  const digits = value.replace(/[^0-9]/g, "")
  if (!digits) return ""
  if (digits.length <= 10) return digits
  return digits.slice(-10)
}

export const formatPhoneForAuth = (value = "") => {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("+")) {
    return `+${sanitizePhone(trimmed)}`
  }
  const digits = sanitizePhone(trimmed)
  if (!digits) return ""
  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`
  }
  return `+91${digits}`
}
