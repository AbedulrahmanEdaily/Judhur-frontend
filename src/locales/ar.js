/**
 * All user-facing text, grouped by feature.
 * Copy that appears in Figma is taken from it word for word (see DESIGN.md); anything marked
 * "not in Figma" follows the same tone and is listed in DESIGN.md.
 */
export const ar = {
  app: {
    name: 'جذور',
    logoAlt: 'شعار جذور',
  },
  common: {
    close: 'إغلاق',
    cancel: 'إلغاء',
    retry: 'إعادة المحاولة',
    loading: 'جارٍ التحميل…',
    backHome: 'العودة للرئيسية',
    breadcrumb: 'مسار الصفحة', // not in Figma (screen readers)
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
  home: {
    // Figma "الرئيسية — زائر" (49:472)
    tagline: 'منصة عقارية فلسطينية بتصنيف أراضي موثّق',
    title: 'أرضك وبيتك — بمعلومات كاملة قبل ما تقرر',
    subtitle:
      'كل عقار على جذور بيجي بتصنيف أرضه (أ/ب/ج)، وثيقة ملكيته، وتقدير سعر بالذكاء الاصطناعي — عشان تعرف شو بتشتري.',
    purpose: 'الغرض',
    city: 'المدينة',
    propertyType: 'نوع العقار',
    price: 'السعر',
    allCities: 'كل المدن',
    anyPrice: 'أي سعر',
    anyType: 'أي نوع', // not in Figma
    search: 'ابحث',
    hint: 'أو جرّب البحث بالعامية: «بدي أرض بنابلس تحت 50 ألف»',
    featured: 'عقارات مختارة',
    seeAll: 'شوف الكل',
    featuredEmpty: 'ما في عقارات منشورة لسا', // not in Figma
    featuredEmptyHint: 'أول ما تنعتمد عروض جديدة رح تظهر هون.', // not in Figma
    aiTitle: 'الذكاء الاصطناعي في خدمتك',
    aiSubtitle: 'ميزتان ما بتلاقيهم في أي منصة عقارية فلسطينية تانية',
    aiPriceTitle: 'مقدّر السعر الذكي',
    aiPriceText:
      'بيحلّل موقع الأرض وتصنيفها ومساحتها والبنية التحتية حواليها، وبيعطيك سعر عادل تقارنه بالسعر المعلن — عشان تعرف إذا العرض منطقي.',
    aiPriceTag: 'يعطي نتيجة خلال 5 ثوانٍ',
    aiChatTitle: 'المساعد الذكي بالعامية',
    aiChatText:
      'احكي معه زي ما بتحكي مع صاحبك: «بدي أرض بجنين تحت 30 ألف على شارع». بيفهم العامية الفلسطينية وبيحوّلها لفلاتر بحث.',
    aiChatTag: 'يفهم العامية والفصحى',
    citiesTitle: 'تصفّح حسب المدينة',
    citiesPrevious: 'المدن السابقة', // not in Figma (arrow buttons)
    citiesNext: 'المدن التالية', // not in Figma (arrow buttons)
    whyClassificationTitle: 'تصنيف أ / ب / ج',
    whyClassificationText: 'بتعرف الوضع القانوني للأرض قبل ما توقّع، مش بعدين',
    whyDocumentTitle: 'وثيقة ملكية موثّقة',
    whyDocumentText: 'الإدارة بتراجع الوثيقة قبل النشر، وما بتظهر لحدا غيرها',
    whyPhotosTitle: 'صور إلزامية',
    whyPhotosText: 'كل عرض لازم 3 صور حقيقية على الأقل — ما في إعلانات فاضية',
    // Figma "الرئيسية — موبايل" (83:472)
    mobileTitle: 'أرضك وبيتك — بمعلومات كاملة',
    mobileSubtitle: 'تصنيف الأرض ووثيقتها وتقدير سعرها — كلها قدامك.',
  },
  search: {
    // Figma "نتائج البحث — زائر" (52:782)
    allProperties: 'العقارات', // not in Figma: the title with no type filter
    in: (city) => `في ${city}`,
    count: (count) => `${count} عقار`,
    mobileCount: (count) => `${count} نتيجة`,
    sortLabel: 'ترتيب:',
    active: 'مفعّل:',
    removeFilter: (label) => `إزالة ${label}`, // not in Figma (screen readers)
    filters: 'الفلاتر',
    clearAll: 'مسح الكل',
    purpose: 'الغرض',
    propertyType: 'نوع العقار',
    priceRange: 'نطاق السعر',
    from: 'من',
    to: 'إلى',
    landClassification: 'تصنيف الأرض',
    legalStatus: 'نوع الوثيقة',
    apply: 'طبّق الفلاتر',
    toggleSection: (title) => `إظهار أو إخفاء ${title}`, // not in Figma (screen readers)
    mobileFilters: (count) => `فلاتر (${count})`,
    back: 'رجوع',
    // not in Figma
    priceFrom: (price) => `من ${price}`,
    priceTo: (price) => `حتى ${price}`,
    searchTermChip: (term) => `«${term}»`,
    emptyTitle: 'ما في عقارات بتطابق بحثك',
    emptyText: 'جرّب تغيّر الفلاتر أو تمسحها وتبحث من جديد.',
    closeFilters: 'إغلاق الفلاتر',
    sortMenu: 'ترتيب النتائج',
    reset: 'إعادة الضبط', // not in Figma: filters, text search and sort back to the defaults
  },
  property: {
    // Figma "بطاقة عقار" (33:2) and "تفاصيل العقار — زائر" (65:1087)
    verified: 'موثّق',
    share: 'مشاركة',
    linkCopied: 'تم نسخ رابط العقار', // not in Figma
    area: 'المساحة',
    document: 'الوثيقة',
    legalTitle: 'الوضع القانوني للأرض',
    // Figma has the text for (أ) only; (ب) and (ج) are not in Figma.
    landTitles: {
      A: 'منطقة (أ) — سيادة فلسطينية كاملة',
      B: 'منطقة (ب) — إدارة مدنية فلسطينية',
      C: 'منطقة (ج) — قيود على البناء',
    },
    landTexts: {
      A: 'الأرض ضمن مناطق السيطرة الفلسطينية الكاملة إدارياً وأمنياً. البناء والترخيص بيمرّوا عبر البلدية الفلسطينية بدون قيود إضافية.',
      B: 'الإدارة المدنية فلسطينية والسيطرة الأمنية مشتركة. الترخيص عبر البلدية الفلسطينية، وبعض المواقع إلها قيود.',
      C: 'الأرض ضمن المناطق المصنّفة (ج). البناء والترخيص بيحتاجوا موافقات إضافية — تأكّد من الوضع قبل ما تشتري.',
    },
    // Figma "تفاصيل العقار — موبايل" (83:671) — the short text; (ب) and (ج) are not in Figma.
    landMobileTexts: {
      A: 'البناء والترخيص عبر البلدية الفلسطينية بدون قيود إضافية.',
      B: 'الترخيص عبر البلدية الفلسطينية، وبعض المواقع إلها قيود.',
      C: 'البناء بيحتاج موافقات إضافية — تأكّد قبل ما تشتري.',
    },
    documentNote: (document) =>
      `وثيقة الملكية (${document}) راجعتها إدارة جذور قبل النشر. الوثيقة نفسها ما بتنعرض للعامة حفاظاً على خصوصية المالك — بتنشاف بس لفريق المراجعة.`,
    description: 'وصف العقار',
    mapTitle: 'الموقع على الخريطة',
    askingPrice: 'السعر المطلوب',
    perSquareMeter: (price) => `${price} / م²`,
    price: 'السعر',
    requestPhone: 'اطلب رقم الهاتف',
    loginForPhone: 'سجّل الدخول لإظهار رقم الهاتف',
    tipsTitle: 'نصائح للتعامل الآمن',
    tips: [
      'خلّي التواصل داخل جذور — المحادثة محفوظة ومرجع إلك.',
      'لا تدفع عربون قبل ما تشوف الأرض والوثيقة على الطبيعة.',
      'تأكّد من مطابقة رقم القطعة والحوض في الطابو.',
    ],
    moreImages: (count) => `+${count} صور أخرى`,
    showImage: (number) => `عرض الصورة ${number}`, // not in Figma (screen readers)
    back: 'رجوع',
    // not in Figma
    notFoundTitle: 'العقار غير متاح',
    notFoundText: 'يمكن انحذف أو انباع أو لسا بانتظار المراجعة.',
    backToSearch: 'رجوع للعقارات',
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
