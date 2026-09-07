export type Language = "ar";

export const translations = {
  ar: {
    // Navigation
    home: "الرئيسية",
    requests: "الطلبات",
    favorites: "المفضلة",
    my_store: "متجري",
    add: "أضف",
    messages: "الرسائل",
    profile: "حسابي",

    // Home
    search_placeholder: "ما الذي تبحث عنه اليوم؟",
    featured_ads: "إعلانات مميزة",
    latest_products: "أحدث القطع",
    stores: "المحلات",

    // Profile & Settings
    settings: "الإعدادات",
    dark_mode: "الوضع الليلي",
    language: "اللغة",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    logout: "تسجيل الخروج",
    active: "مفعّل",
    soon: "قريباً",
    my_listings: "إعلاناتي",
    my_reservations: "حجوزاتي",
    my_orders: "طلباتي",
    wallet: "المحفظة",
    admin_panel: "لوحة الإدارة",

    // Actions
    add_product: "إضافة إعلان للبيع",
    add_request: "إضافة طلب للشراء",
    what_to_add: "ماذا تريد أن تضيف؟",

    // Common
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    city: "المحافظة",
    price: "السعر",
    condition: "الحالة",
    new: "جديد",
    used: "مستعمل",

    // Store
    create_store: "إنشاء متجر",
    store_name: "اسم المتجر",
    phone_number: "رقم الهاتف",
    address_details: "العنوان بالتفصيل (الحي، بجانب، علامة مميزة)",
    store_settings: "إعدادات المتجر",
    dashboard: "لوحة التحكم",
    publish_product: "نشر منتج في المتجر",
    optional: "اختياري",
  },
};

export type TranslationKey = keyof typeof translations.ar;

export function t(key: TranslationKey, lang: Language = "ar"): string {
  return translations["ar"][key] || key;
}
