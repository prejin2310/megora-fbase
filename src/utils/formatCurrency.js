export default function formatCurrency(amount = 0, currency = "INR") {
  const num = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : currency,
      maximumFractionDigits: 0,
    }).format(num);
  } catch (err) {
    return `₹${num.toLocaleString()}`;
  }
}
