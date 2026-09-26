/** All user-facing text, grouped by feature. */
export const ar = {
  app: {
    name: 'جذور',
    tagline: 'سوق العقارات الفلسطيني',
    comingSoon: 'قريباً',
    logoAlt: 'شعار جذور',
  },
  common: {
    close: 'إغلاق',
    cancel: 'إلغاء',
    retry: 'إعادة المحاولة',
    loading: 'جارٍ التحميل…',
    backHome: 'العودة للرئيسية',
  },
  nav: {
    home: 'الرئيسية',
    properties: 'العقارات',
    login: 'تسجيل دخول',
    register: 'إنشاء حساب',
    searchLabel: 'البحث',
    searchPlaceholder: 'ابحث عن أرض أو عقار…',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    mainNav: 'التنقّل الرئيسي',
  },
  theme: {
    toDark: 'تفعيل الوضع الليلي',
    toLight: 'تفعيل الوضع النهاري',
  },
  badge: {
    verified: 'موثّق',
  },
  pagination: {
    label: 'ترقيم الصفحات',
    previous: 'السابق',
    next: 'التالي',
    page: (n) => `الصفحة ${n}`,
  },
  confirm: {
    typeToConfirm: (word) => `اكتب «${word}» للتأكيد`,
  },
  errors: {
    unexpected: 'حدث خطأ غير متوقع',
    requestId: 'رقم الطلب',
  },
  notFound: {
    code: '404',
    title: 'الصفحة غير موجودة',
    description: 'الرابط الذي فتحته غير صحيح أو أن الصفحة لم تعد موجودة.',
  },
  footer: {
    rights: (year) => `© ${year} جذور. جميع الحقوق محفوظة.`,
  },
};
