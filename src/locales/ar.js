/**
 * All user-facing text, grouped by feature.
 * Copy that appears in Figma is taken from it word for word (see DESIGN.md); anything marked
 * "not in Figma" follows the same tone and is listed in DESIGN.md.
 */
export const ar = {
  app: {
    name: 'جذور',
    tagline: 'سوق العقارات الفلسطيني', // not in Figma (placeholder home)
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
    map: 'الخريطة',
    about: 'عن جذور',
    approvals: 'الموافقات',
    users: 'المستخدمون',
    reports: 'البلاغات',
    login: 'تسجيل دخول',
    register: 'إنشاء حساب',
    addProperty: 'أضف عقار',
    adminPanel: 'لوحة الإدارة',
    messages: 'المحادثات',
    notifications: 'الإشعارات',
    tabSearch: 'بحث',
    tabAdd: 'أضف',
    tabAccount: 'حسابي',
    searchLabel: 'البحث',
    searchPlaceholder: 'ابحث عن أرض أو عقار…',
    mainNav: 'التنقّل الرئيسي',
  },
  footer: {
    about: 'منصة عقارية فلسطينية — مشروع تخرج، جامعة فلسطين التقنية خضوري.',
    linksTitle: 'روابط',
    platformTitle: 'المنصة',
    contactTitle: 'تواصل',
    howItWorks: 'كيف تعمل',
    faq: 'الأسئلة الشائعة',
    email: 'info@judhur.ps',
    location: 'طولكرم — فلسطين',
    rights: (year) => `© ${year} جذور — جميع الحقوق محفوظة`,
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
    // Figma 48:794 — two spaces around the word.
    typeToConfirm: (word) => `اكتب  ${word}  للتأكيد`,
  },
  auth: {
    sessionExpired: 'انتهت جلستك، الرجاء تسجيل الدخول مجدداً',
    fields: {
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phoneNumber: 'رقم الهاتف',
      city: 'المدينة',
      password: 'كلمة المرور',
      newPassword: 'كلمة المرور الجديدة', // not in Figma
      code: 'رمز التحقق', // not in Figma
    },
    validation: {
      required: 'هذا الحقل مطلوب',
      maxLength: (max) => `الحد الأقصى ${max} حرفاً`,
      email: 'البريد الإلكتروني غير صالح',
      phone: 'رقم الهاتف غير صالح. استخدم الصيغة 05XXXXXXXX أو 970/972 متبوعاً بالرقم',
      password: 'كلمة المرور لازم تحقق كل الشروط',
      code: 'الرمز يتكوّن من 6 أرقام',
      terms: 'لازم توافق على الشروط عشان تكمّل',
    },
    // Figma register chips (69:1364…). "حرف صغير" is not in Figma — the API requires it.
    passwordRules: {
      minLength: '8 أحرف',
      uppercase: 'حرف كبير',
      lowercase: 'حرف صغير',
      digit: 'رقم',
    },
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    google: 'المتابعة باستخدام Google',
    googleSoon: 'الدخول باستخدام Google قريباً', // not in Figma
    orEmail: 'أو بالبريد الإلكتروني',
    orEmailShort: 'أو بالبريد',
    panel: {
      headline: 'كل عقار إله قصة كاملة — إحنا بنكتبها قبل ما تسأل',
      points: [
        'تصنيف الأرض (أ/ب/ج) واضح على كل عرض',
        'وثيقة ملكية مراجَعة قبل النشر',
        'تقدير سعر بالذكاء الاصطناعي مع أساسه',
        'محادثة داخلية محفوظة بينك وبين البائع',
      ],
    },
    login: {
      backHome: 'رجوع للرئيسية',
      title: 'أهلاً فيك من جديد',
      subtitle: 'سجّل دخولك عشان تكمّل محادثاتك وتشوف مفضلتك.',
      mobileTitle: 'أهلاً فيك في جذور',
      rememberMe: 'تذكّرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      submit: 'تسجيل الدخول',
      noAccount: 'ما عندك حساب؟',
      register: 'أنشئ حساب',
      resendConfirmation: 'أعد إرسال رابط التفعيل', // not in Figma
    },
    register: {
      title: 'أنشئ حسابك على جذور',
      subtitle: 'حساب واحد بيخليك تشتري وتبيع — ما في اختيار دور، بتضيف عقار وقت ما تحب.',
      terms: 'أوافق على شروط الاستخدام وسياسة الخصوصية',
      submit: 'أنشئ الحساب',
      haveAccount: 'عندك حساب؟',
      login: 'سجّل دخول',
    },
    checkEmail: {
      title: 'افحص بريدك الإلكتروني',
      body: (email) =>
        `بعتنا رابط تفعيل على ${email} — اضغط عليه عشان تفعّل حسابك. الرابط صالح لـ 24 ساعة.`,
      // not in Figma: when the email is not in the URL.
      bodyNoEmail:
        'بعتنا رابط تفعيل على بريدك — اضغط عليه عشان تفعّل حسابك. الرابط صالح لـ 24 ساعة.',
      spamNotice: 'ما وصلك؟ افحص مجلد الرسائل غير المرغوب فيها (Spam) قبل ما تطلب إرسال جديد.',
      openMailApp: 'افتح تطبيق البريد',
      resendIn: (time) => `أعد الإرسال بعد ${time}`,
      resend: 'أعد الإرسال', // not in Figma (the ready state of the countdown line)
      resent: 'إذا كان البريد مسجّل وما تفعّل، رح يوصلك رابط جديد خلال دقائق.', // not in Figma
    },
    forgot: {
      title: 'نسيت كلمة المرور؟',
      subtitle: 'اكتب بريدك وبنبعتلك رابط آمن تعيّن منه كلمة مرور جديدة.',
      submit: 'أرسل رابط الاستعادة',
      backToLogin: 'رجوع لتسجيل الدخول',
    },
    // not in Figma — the code + new password step.
    reset: {
      title: 'عيّن كلمة مرور جديدة',
      subtitle: 'اكتب الرمز اللي وصلك على بريدك وكلمة المرور الجديدة.',
      codeHint: 'الرمز من 6 أرقام وصالح لمدة 5 دقائق.',
      expiresIn: (time) => `الرمز بينتهي بعد ${time}`,
      expired: 'انتهت صلاحية الرمز — اطلب رمز جديد.',
      sendNewCode: 'أرسل رمز جديد',
      codeSent: 'إذا كان البريد مسجّل، رح يوصلك رمز جديد خلال دقائق.',
      submit: 'غيّر كلمة المرور',
      success: 'تم تغيير كلمة المرور. سجّل دخولك بكلمة المرور الجديدة.',
    },
    // not in Figma — the page the email link opens.
    confirmEmail: {
      loading: 'عم نفعّل حسابك…',
      successTitle: 'تم تفعيل حسابك',
      successBody: 'صار فيك تسجّل دخولك وتبلّش تستخدم جذور.',
      failureTitle: 'رابط التفعيل مش صالح أو انتهت صلاحيته',
      failureBody: 'اطلب رابط تفعيل جديد وبيوصلك على بريدك.',
      resendSubmit: 'أرسل رابط جديد',
    },
    account: {
      menu: 'قائمة الحساب',
      signedInAs: 'مسجّل الدخول باسم',
      logout: 'تسجيل الخروج',
    },
  },
  errors: {
    unexpected: 'حدث خطأ غير متوقع',
    requestId: 'رقم الطلب',
    network: 'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت وحاول مجدداً.',
    timeout: 'استغرق الطلب وقتاً أطول من المتوقع. حاول مجدداً.',
    validation: 'الرجاء تصحيح البيانات المُدخلة.',
    unauthorized: 'الرجاء تسجيل الدخول للمتابعة.',
    forbidden: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
    notFound: 'المورد المطلوب غير موجود.',
    conflict: 'تعارض مع بيانات موجودة.',
    tooManyRequests: 'محاولات كثيرة. الرجاء الانتظار قليلاً ثم المحاولة مجدداً.',
  },
  // not in Figma
  notFound: {
    code: '404',
    title: 'الصفحة غير موجودة',
    description: 'الرابط الذي فتحته غير صحيح أو أن الصفحة لم تعد موجودة.',
  },
};
