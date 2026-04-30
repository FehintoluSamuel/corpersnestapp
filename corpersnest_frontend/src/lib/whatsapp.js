/**
 * Normalizes a Nigerian phone number to the wa.me format (234XXXXXXXXXX).
 * Handles: 08012345678, +2348012345678, 2348012345678
 */
export function formatWhatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '234' + digits.slice(1)
  if (digits.startsWith('234')) return digits
  return '234' + digits
}

/**
 * Builds a wa.me URL with an optional pre-filled message.
 */
export function buildWhatsAppUrl(phone, message = '') {
  const number = formatWhatsAppNumber(phone)
  const encoded = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${encoded}`
}

/**
 * Builds the pre-filled message for a listing enquiry.
 */
export function listingWhatsAppMessage(ownerName, listingTitle) {
  return `Hi ${ownerName}, I saw your listing on CorperNest: "${listingTitle}". Is it still available?`
}