export function formatPrice(price: number, currency = "USD"): string {
  const value = new Intl.NumberFormat("ar-SY", { maximumFractionDigits: 0 }).format(price);
  return currency === "USD" ? `${value} $` : `${value} ل.س`;
}

export function timeAgo(iso: string): string {
  if (!iso) return "غير معروف";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "تاريخ غير صالح";

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `قبل ${days} يوم`;
  const months = Math.floor(days / 30);
  return `قبل ${months} شهر`;
}

/** Phone -> deterministic synthetic email used for auth (Syria: no email needed). */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function phoneToEmail(phone: string): string {
  return `u${normalizePhone(phone)}@qetati.app`;
}
