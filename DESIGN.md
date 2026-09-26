# Judhur — Design contract

The Figma file is the single source of truth for every visual decision:
https://www.figma.com/design/voDthhA1bOmjcJgIkDDXqe

This file records how Figma maps to the code. For anything visual it overrides `CLAUDE.md`.
It never overrides the API contract (`CLAUDE.md` section 6).

The file has **7 pages**. `get_metadata` without a node id lists only the pages already loaded, so find the pages with `use_figma`:

```js
return figma.root.children.map((p) => ({ id: p.id, name: p.name }));
```

| Page id | Name                    | Contents                                                                                                                    |
| ------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 0:1     | 00 · الهوية والشعار     | the logo and its usage rules (frame 43:509)                                                                                 |
| 1:2     | 01 · التوكنز والأساسيات | section 86:472, the token reference                                                                                         |
| 1:3     | 02 · الكمبوننتس         | the component library: 47:943 basics, 47:944 navigation, 47:945 display, 47:946 interaction, 47:947 logo; 34:105 dark check |
| 1:4     | 03 · الزائر             | the visitor screens                                                                                                         |
| 1:5     | 04 · المستخدم           | the signed-in user screens                                                                                                  |
| 1:6     | 05 · الأدمن             | the admin screens                                                                                                           |
| 1:7     | 06 · الموبايل           | the mobile screens (section 84:3696)                                                                                        |

---

## a. Rules

1. **Figma is the source of truth.** When Figma defines any of the following, it is never invented or approximated:
   - color, size, spacing, radius, shadow or border;
   - font size, weight or line height;
   - icon, image treatment, layout or section order;
   - copy.
2. **Copy.** Arabic text is taken from Figma word for word. It lives in `src/locales/ar.js`. A string Figma doesn't have is marked `// not in Figma` there.
3. **Build from the frame.** Before building a screen, open its Figma frame (`get_design_context` + `get_screenshot`). Build it section by section, in the frame's order.
4. **Tokens.**
   - Use only the tokens and components in this file.
   - No arbitrary Tailwind values (`p-[13px]`, `text-[#123456]`) unless the exact value comes from Figma. Every raw value in use is listed under "Raw values" below.
   - Colors are always tokens, never hex in JSX.
5. **Strokes are inside in Figma.** Figma draws every stroke inside the frame, on top of the padding. CSS draws the border outside the padding. So a bordered element's CSS padding is the **Figma padding minus the stroke width**. For example, a Figma field with a 13px padding and a 1px stroke gets `py-3` + `border`. Thicker focus and error strokes are drawn with an inset `ring`, so the text doesn't move.
6. **Icons.**
   - Icons are Figma's own, exported as SVG with the Plugin API: `exportAsync({ format: 'SVG_STRING' })`.
   - They live in `src/components/icons/`, with the node id noted in each file.
   - The fill becomes `currentColor`, so the parent sets the color with a `text-*` token.
   - Never use an icon library when Figma has the icon.
7. **Photos.** Photos and illustrations are exported from Figma the same way, or taken from the `صورة عقار / Property Photo` variants. Never use a stock image.
8. **Data.**
   - Static content in a frame (headings, marketing blocks, city lists, promo blocks) is reproduced exactly.
   - Data-driven content comes only from the real API.
   - When the API can't provide it yet, keep the section's layout, show the Figma Empty State inside it, and add an entry to `BACKEND_REQUESTS.md`. Never fake data.
9. **Unbuilt items.** Navigation items whose page isn't built yet stay visible exactly as designed. They don't navigate yet: a `span` with `aria-disabled`.
10. **Not in Figma.** If something isn't in Figma: stop, tell Abdulrahman, then build it only from existing tokens and components, and add it to list f.
11. **Conflicts.** If Figma and `CLAUDE.md` disagree on anything visual, Figma wins. Say so in the task report.
12. **Never modify the Figma file.** Scripts run through `use_figma` only read.
13. **Verify every UI change** (section g). A row is marked "matches" only after the side-by-side comparison, with the date.

### Frames pinned to a mode

Some Figma frames are pinned to the Dark mode whatever the theme. In code they get the `dark` class on their container, so the tokens inside resolve to the Dark values:

- the login/register identity panels (69:1160, 69:1263);
- the footer (51:801).

### Breakpoints

The desktop frames are 1440 wide; the mobile frames are 390 wide.

- **`xl` (1280px) and up:** the desktop layout (Navbar, Footer, split auth screens).
- **Below `xl`:** the mobile layout (top bar, tab bar, stacked auth screens).

Tablet widths are not in Figma (see f).

---

## b. Tokens

Source of truth in code: `src/styles/index.css`.

### Color (collection "Color", modes Light 1:0 / Dark 1:1)

| Figma variable      | Light   | Dark    | CSS variable                                       | Tailwind                                        |
| ------------------- | ------- | ------- | -------------------------------------------------- | ----------------------------------------------- |
| bg/canvas           | #ffffff | #0b1512 | `--color-bg`                                       | `bg-bg`                                         |
| bg/surface          | #f6f8f7 | #132119 | `--color-surface`                                  | `bg-surface`                                    |
| bg/raised           | #ffffff | #1a2b22 | `--color-raised`                                   | `bg-raised`                                     |
| bg/inset            | #eef2f0 | #0e1a15 | `--color-inset`                                    | `bg-inset`                                      |
| border/subtle       | #e2e8e4 | #24342c | `--color-border`                                   | `border-border`                                 |
| border/strong       | #c7d2cc | #35473d | `--color-border-strong`                            | `border-border-strong`                          |
| text/primary        | #0e1a16 | #eaf2ee | `--color-text`                                     | `text-text`                                     |
| text/secondary      | #5f6b65 | #93a69d | `--color-text-secondary`                           | `text-text-secondary`                           |
| text/muted          | #8a948f | #6e7f77 | `--color-muted`                                    | `text-muted`                                    |
| text/inverse        | #ffffff | #04150e | `--color-inverse`                                  | `text-inverse`                                  |
| brand/solid         | #0f7a56 | #22a473 | `--color-brand`                                    | `bg-brand`, `text-brand`                        |
| brand/hover         | #0c6246 | #35b686 | `--color-brand-hover`                              | `hover:bg-brand-hover`                          |
| brand/subtle        | #e6f2ec | #123529 | `--color-brand-subtle`                             | `bg-brand-subtle`                               |
| brand/text          | #0f7a56 | #4fd3a0 | `--color-brand-text`                               | `text-brand-text`                               |
| accent/solid        | #0b2033 | #123554 | `--color-accent`                                   | `bg-accent`                                     |
| accent/subtle       | #e7ecf1 | #0f2a42 | `--color-accent-subtle`                            | `bg-accent-subtle`                              |
| accent/gold         | #96762f | #d9b96a | `--color-verified`                                 | `text-verified` — **the «موثّق» badge only**    |
| accent/gold-soft    | #f6efdc | #33290f | `--color-verified-soft`                            | `bg-verified-soft` — **the «موثّق» badge only** |
| state/success       | #157f4e | #34c08a | `--color-success`                                  | `text-success`                                  |
| state/success-soft  | #e4f3eb | #0f3021 | `--color-success-soft`                             | `bg-success-soft`                               |
| state/warning       | #b4530a | #e08a3c | `--color-warning`                                  | `text-warning`                                  |
| state/warning-soft  | #fbeedf | #3a2610 | `--color-warning-soft`                             | `bg-warning-soft`                               |
| state/danger        | #b3261e | #f0645a | `--color-danger`                                   | `text-danger`, `bg-danger`                      |
| state/danger-soft   | #fbe8e6 | #3b1b18 | `--color-danger-soft`                              | `bg-danger-soft`                                |
| state/info          | #14618a | #4ba3d6 | `--color-info`                                     | `text-info`                                     |
| state/info-soft     | #e2eff6 | #102a3b | `--color-info-soft`                                | `bg-info-soft`                                  |
| land/area-a         | #157f4e | #34c08a | `--color-land-a`                                   | `text-land-a`                                   |
| land/area-a-soft    | #e4f3eb | #0f3021 | `--color-land-a-soft`                              | `bg-land-a-soft`                                |
| land/area-b         | #b4530a | #e5a24b | `--color-land-b`                                   | `text-land-b`                                   |
| land/area-b-soft    | #fbeedf | #3a2610 | `--color-land-b-soft`                              | `bg-land-b-soft`                                |
| land/area-c         | #b3261e | #f0645a | `--color-land-c`                                   | `text-land-c`                                   |
| land/area-c-soft    | #fbe8e6 | #3b1b18 | `--color-land-c-soft`                              | `bg-land-c-soft`                                |
| logo/c01 … logo/c14 | —       | —       | baked into `src/assets/logo.svg` / `logo-dark.svg` | `<Logo>` switches the file with the theme       |

### Layout (collection "Layout")

| Figma variable | Value | Tailwind       |
| -------------- | ----- | -------------- |
| space/2        | 2     | `0.5`          |
| space/4        | 4     | `1`            |
| space/8        | 8     | `2`            |
| space/12       | 12    | `3`            |
| space/16       | 16    | `4`            |
| space/20       | 20    | `5`            |
| space/24       | 24    | `6`            |
| space/32       | 32    | `8`            |
| space/40       | 40    | `10`           |
| space/48       | 48    | `12`           |
| space/64       | 64    | `16`           |
| radius/sm      | 8     | `rounded-sm`   |
| radius/md      | 12    | `rounded-md`   |
| radius/lg      | 16    | `rounded-lg`   |
| radius/xl      | 20    | `rounded-xl`   |
| radius/2xl     | 28    | `rounded-2xl`  |
| radius/pill    | 999   | `rounded-full` |

The Tailwind spacing scale is 4px per step, so every space variable maps to a default step, as in `p-4` or `gap-3`.

### Text styles (Cairo)

| Figma style | Size / weight / line height | Tailwind                       |
| ----------- | --------------------------- | ------------------------------ |
| Display/36  | 36 · Bold · 145%            | `text-display`                 |
| Heading/28  | 28 · Bold · 152%            | `text-h1`                      |
| Heading/24  | 24 · Bold · 155%            | `text-h2`                      |
| Heading/20  | 20 · SemiBold · 160%        | `text-h3`                      |
| Title/18    | 18 · SemiBold · 165%        | `text-title`                   |
| Body/16     | 16 · Regular · 178%         | `text-body` (the page default) |
| Body/15     | 15 · Regular · 178%         | `text-body-md`                 |
| Body/13     | 13 · Regular · 175%         | `text-body-sm`                 |
| Label/14    | 14 · SemiBold · 160%        | `text-label`                   |
| Caption/12  | 12 · Regular · 170%         | `text-caption`                 |
| Price/22    | 22 · Bold · 140%            | `text-price`                   |

### Effects

The file has **no effect styles**. The components carry their own drop shadows, mirrored as tokens:

| Where in Figma          | Shadow               | Tailwind        |
| ----------------------- | -------------------- | --------------- |
| Select menu (46:827)    | 0 8 24 −4, black 14% | `shadow-menu`   |
| Toast (45:786)          | 0 6 10, black 14%    | `shadow-toast`  |
| Modal (45:741)          | 0 12 16, black 18%   | `shadow-modal`  |
| Confirm Dialog (48:802) | 0 14 18, black 20%   | `shadow-dialog` |

### Raw values

The screens use these values directly; they are not variables. They are allowed only where listed.

| Value                                                                                           | Where (Figma)                                                                            | Code                            |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------- |
| Gradient `rgb(9 28 23 / .63) → rgb(9 28 23 / .84)`, top to bottom                               | «طبقة تعتيم» over the photo in the auth identity panel (89:4753)                         | `bg-auth-overlay`               |
| Gradient 141.94°, `rgb(14 102 74) 0%` → `rgb(10 31 48) 71.429%`                                 | mobile login «الهوية» header (84:721)                                                    | `bg-auth-hero`                  |
| White at 80 / 75 / 70 / 55 / 16 / 14 %                                                          | identity panel text and badges, mobile hero subtitle, footer items / copyright / divider | `text-white/80` … `bg-white/14` |
| Radius 10                                                                                       | Pagination items (47:824)                                                                | `rounded-[10px]`                |
| Radius 6                                                                                        | Checkbox «مربع» (69:1254)                                                                | `rounded-[6px]`                 |
| Radius 4                                                                                        | Google logo box (96:6320)                                                                | `rounded-[4px]`                 |
| Font sizes 10.5 · 11.5 · 12.5 · 13.5 · 14.5 · 15.5 · 19 · 20 · 22 · 25 · 26 · 30 · 32           | screen text that is not bound to a text style                                            | `text-[…px]`                    |
| Line heights 1.65 · 1.68 · 1.7 · 1.72 · 1.75 · 1.78                                             | the same text layers                                                                     | `leading-[…]`                   |
| Paddings and gaps from the frames (for example 110/60 auth form, 120 footer, 15/13 auth fields) | noted in each component's doc comment with its node id                                   | `p-[…px]`, `gap-[…px]`          |

---

## c. Component map

Status key:

- **matches** — compared side by side (section g), with the date.
- **needs fix** — known differences are open.
- **not built** — nothing in code yet.

| Figma component (node)               | Variants (Figma names)                                                                                                                          | React                                                                                                                                                                                       | Status                                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| زر / Button (27:18)                  | النوع=أساسي / ثانوي / شبح / خطر × الحجم=كبير / صغير (27:2 … 27:16)                                                                              | `components/ui/Button.jsx` — `variant="primary\|secondary\|ghost\|danger"`, `size="lg\|sm"`, `loading`, `fullWidth`                                                                         | matches 2026-09-26                                                                                                      |
| شارة / Badge (27:37)                 | النوع=تصنيف أ 27:19 · تصنيف ب 27:21 · تصنيف ج 27:23 · للبيع 27:25 · للإيجار 27:27 · مباع 27:29 · قيد المراجعة 27:31 · معتمد 27:33 · مرفوض 27:35 | `components/ui/Badge.jsx` — `tone="land-a\|land-b\|land-c\|brand\|info\|neutral\|warning\|success\|danger"`                                                                                 | matches 2026-09-26                                                                                                      |
| شارة / Badge — موثّق (40:92)         | النوع=موثّق                                                                                                                                     | `components/ui/VerifiedBadge.jsx`                                                                                                                                                           | matches 2026-09-26                                                                                                      |
| حقل إدخال / Input (32:139)           | الحالة=عادي 32:115 · مركّز 32:121 · خطأ 32:127 · معطّل 32:133                                                                                   | `components/ui/Input.jsx` — `label`, `hint`, `error`, `suffix`, `disabled`                                                                                                                  | matches 2026-09-26                                                                                                      |
| قائمة منسدلة / Select (46:827)       | —                                                                                                                                               | `components/ui/Select.jsx` — `label`, `options`, `placeholder`, `hint`, `error` (the field; the open list is the browser's)                                                                 | matches 2026-09-26 (field only)                                                                                         |
| صورة المستخدم / Avatar (44:769)      | الحجم=كبير 44:763 · متوسط 44:765 · صغير 44:767                                                                                                  | —                                                                                                                                                                                           | not built                                                                                                               |
| تقييم / Rating (44:770)              | —                                                                                                                                               | —                                                                                                                                                                                           | not built                                                                                                               |
| شريط علوي / Navbar (34:104)          | الحالة=زائر 34:2 · مستخدم 34:31 · أدمن 34:65                                                                                                    | `components/layout/Header.jsx` (+ `HeaderSearch`, `ThemeToggle`, `AccountMenu`); the state comes from the session                                                                           | matches 2026-09-26                                                                                                      |
| عنصر سايدبار / Sidebar Item (44:755) | الحالة=عادي 44:741 · نشط 44:748                                                                                                                 | —                                                                                                                                                                                           | not built                                                                                                               |
| تبويب / Tab (44:762)                 | الحالة=عادي 44:756 · نشط 44:759                                                                                                                 | —                                                                                                                                                                                           | not built                                                                                                               |
| ترقيم الصفحات / Pagination (47:824)  | —                                                                                                                                               | `components/ui/Pagination.jsx` — `page`, `totalPages`, `onPageChange`                                                                                                                       | matches 2026-09-26, except the order of «السابق»/«التالي» (see "Could not match")                                       |
| بطاقة عقار / Property Card (33:2)    | —                                                                                                                                               | —                                                                                                                                                                                           | not built (step 5)                                                                                                      |
| صف جدول / Table Row (47:807)         | —                                                                                                                                               | —                                                                                                                                                                                           | not built                                                                                                               |
| حالة فارغة / Empty State (45:787)    | —                                                                                                                                               | `components/ui/EmptyState.jsx` — `icon`, `title`, `description`, `action {label, to \| onClick}`                                                                                            | matches 2026-09-26                                                                                                      |
| صورة عقار / Property Photo (89:843)  | الوقت=صباح 89:744 · ظهيرة 89:777 · غروب 89:810                                                                                                  | exported SVGs: `assets/photos/panel-morning.svg` (instance 89:4754), `panel-sunset.svg` (instance 89:4720)                                                                                  | matches 2026-09-26 (as used on the auth panels)                                                                         |
| نافذة / Modal (45:741)               | —                                                                                                                                               | `components/ui/Modal.jsx` — `open`, `onClose`, `title`, `children`, `footer`                                                                                                                | matches 2026-09-26 (frame: padding, header, close icon, radius, shadow); the report-reason options inside are not built |
| تنبيه / Toast (45:786)               | الحالة=نجاح 45:765 · تحذير 45:772 · خطأ 45:779 · تراجع 48:803                                                                                   | `components/ui/Toast.jsx` — `tone="success\|warning\|error\|neutral"`, `message`, `action`, `onClose`; shown by `ToastProvider` / `useToast`                                                | matches 2026-09-26                                                                                                      |
| فقاعة محادثة / Chat Bubble (47:799)  | الطرف=أنا 47:789 · الطرف الآخر 47:794                                                                                                           | —                                                                                                                                                                                           | not built                                                                                                               |
| حقل المحادثة / Chat Input (47:800)   | —                                                                                                                                               | —                                                                                                                                                                                           | not built                                                                                                               |
| رفع وثيقة / Uploader (46:810)        | —                                                                                                                                               | —                                                                                                                                                                                           | not built (step 7)                                                                                                      |
| خطوات الويزارد / Stepper (46:789)    | —                                                                                                                                               | —                                                                                                                                                                                           | not built (step 7)                                                                                                      |
| حوار تأكيد / Confirm Dialog (48:802) | النوع=حذف عقار 48:741 · تعطيل عقار 48:757 · رفض عقار 48:770 · حذف حساب 48:786                                                                   | `components/ui/ConfirmDialog.jsx` — `tone="danger\|warning"`, `icon`, `title`, `description`, `details`, `reason {label, placeholder}`, `confirmWord`, `confirmLabel`, `onConfirm(reason?)` | matches 2026-09-26                                                                                                      |
| الشعار / ختم جذور (41:137)           | —                                                                                                                                               | `components/layout/Logo.jsx` — `size`, `decorative`; light/dark files from 41:137 and the dark check 34:105                                                                                 | matches 2026-09-26                                                                                                      |

### Parts of screens used as components

| Figma node                                             | React                                                         | Status                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| Footer «التذييل» (51:801)                              | `components/layout/Footer.jsx`                                | matches 2026-09-26                                                |
| Mobile top bar «الشريط العلوي» (83:477)                | `components/layout/MobileTopBar.jsx`                          | matches 2026-09-26                                                |
| Mobile tab bar «شريط التبويب» (83:577)                 | `components/layout/MobileTabBar.jsx`                          | matches 2026-09-26                                                |
| Checkbox «مربع» (69:1254)                              | `components/ui/Checkbox.jsx`                                  | matches 2026-09-26 (checked state)                                |
| Auth field «حقل» (69:1240, mobile 84:780)              | `features/auth/components/AuthInput.jsx`, `PasswordField.jsx` | matches 2026-09-26                                                |
| Password rule chips (69:1364…)                         | `features/auth/components/PasswordRules.jsx`                  | matches 2026-09-26, with one chip changed (see "Could not match") |
| Google button + «أو» divider                           | `features/auth/components/GoogleSignInButton.jsx`             | matches 2026-09-26                                                |
| Auth card «بطاقة» (70:1253, 70:1314)                   | `features/auth/components/AuthCard.jsx`                       | matches 2026-09-26                                                |
| Identity panel + form panel (69:1159, 69:1262, 84:716) | `features/auth/components/AuthSplitLayout.jsx`                | matches 2026-09-26                                                |

---

## d. Screen map

Desktop frames are 1440 wide. The "Step" column refers to the build order in `CLAUDE.md` section 14.

| Figma screen (node)                | Route                   | React page                                   | Step  | Mobile counterpart       | Status                                                                |
| ---------------------------------- | ----------------------- | -------------------------------------------- | ----- | ------------------------ | --------------------------------------------------------------------- |
| الرئيسية (49:472)                  | `/`                     | `features/properties/pages/HomePage.jsx`     | 5     | 83:472                   | not built (placeholder page)                                          |
| نتائج البحث (52:782)               | `/properties`           | SearchPage                                   | 5     | 83:599                   | not built                                                             |
| تفاصيل العقار (65:1087)            | `/properties/:id`       | PropertyDetailsPage                          | 6     | 83:671                   | not built                                                             |
| تسجيل الدخول (69:1159)             | `/login`                | `features/auth/pages/LoginPage.jsx`          | 4     | 84:716                   | matches 2026-09-26                                                    |
| إنشاء حساب (69:1262)               | `/register`             | `features/auth/pages/RegisterPage.jsx`       | 4     | none (built from 84:716) | matches 2026-09-26                                                    |
| تأكيد البريد (70:1253)             | `/register/check-email` | `features/auth/pages/CheckEmailPage.jsx`     | 4     | none                     | matches 2026-09-26                                                    |
| استعادة كلمة المرور (70:1314)      | `/forgot-password`      | `features/auth/pages/ForgotPasswordPage.jsx` | 4     | none                     | matches 2026-09-26                                                    |
| الخريطة (71:1300)                  | — (no route yet)        | —                                            | later | none                     | not built — needs coordinates in search results (BACKEND_REQUESTS #7) |
| ملف البائع (73:1373)               | —                       | —                                            | later | none                     | not built — no public profile endpoint                                |
| لوحتي (74:472)                     | `/dashboard`            | DashboardPage                                | 8     | 84:575                   | not built                                                             |
| عقاراتي (75:592)                   | `/my-properties`        | MyPropertiesPage                             | 8     | none                     | not built                                                             |
| المفضلة (75:815)                   | —                       | —                                            | later | none                     | not built — no favorites API (#12)                                    |
| المحادثات (76:968)                 | —                       | —                                            | later | 84:530                   | not built — no messaging API (#12)                                    |
| الإشعارات (76:1172)                | —                       | —                                            | later | none                     | not built — no notifications API (#12)                                |
| أضف عقار 1 البيانات (77:1136)      | `/properties/new`       | CreatePropertyPage                           | 7     | 84:664                   | not built                                                             |
| أضف عقار 2 الموقع (91:1902)        | `/properties/new`       | CreatePropertyPage                           | 7     | 84:664                   | not built                                                             |
| أضف عقار 3 الصور (91:1991)         | `/properties/new`       | CreatePropertyPage                           | 7     | —                        | not built — uploads pending (#11)                                     |
| أضف عقار 4 الوثائق (91:2080)       | `/properties/new`       | CreatePropertyPage                           | 7     | —                        | not built — uploads pending (#11)                                     |
| أضف عقار تم الإرسال (91:2169)      | `/properties/new`       | CreatePropertyPage                           | 7     | —                        | not built                                                             |
| المساعد الذكي (78:1229)            | —                       | —                                            | later | none                     | not built — no API (#12)                                              |
| تقرير تقدير السعر (78:1472)        | —                       | —                                            | later | none                     | not built — no API (#12)                                              |
| الملف الشخصي (79:1500)             | —                       | —                                            | later | none                     | not built — needs "me" (#4)                                           |
| لوحة الإحصائيات (80:472)           | `/admin`                | admin pages                                  | 9     | none                     | not built                                                             |
| طابور الموافقات (80:753)           | —                       | admin pages                                  | 9     | none                     | not built                                                             |
| مراجعة عقار (81:751)               | —                       | admin pages                                  | 9     | none                     | not built                                                             |
| إدارة المستخدمين (82:827)          | —                       | admin pages                                  | 9     | none                     | not built                                                             |
| البلاغات (82:1026)                 | —                       | admin pages                                  | 9     | none                     | not built                                                             |
| استهلاك الذكاء الاصطناعي (82:1236) | —                       | admin pages                                  | 9     | none                     | not built                                                             |

**Shell of every page** (`components/layout/AppLayout.jsx`):

- desktop: Navbar + Footer;
- mobile: top bar + tab bar.

The auth screens have no shell, as in their frames.

---

## e. Logo usage rules (frame 43:509, word for word)

قواعد الاستخدام

• الحد الأدنى للحجم 24 بكسل — تحت هيك التفاصيل بتلتصق.

• مساحة حرة حول الشعار لا تقل عن نصف قطر الحلقة الخارجية.

• ممنوع تغيير ألوانه يدوياً — الألوان مربوطة بمتغيرات logo/* وبتتبدّل مع الثيم لحالها.

• ممنوع تدويره أو تمطيطه أو إضافة ظل أو حدود عليه.

• على خلفية صورة: يستخدم داخل دائرة مصمتة بلون bg/canvas بدل الوضع المباشر.

---

## f. Not in Figma

Each item is built only from existing tokens and components, and is flagged for design.

| Item                                                                                         | Where in code                                                              | Built from                                                                                                                   |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 404 page                                                                                     | `features/errors/pages/NotFoundPage.jsx`                                   | text styles + the primary Button look                                                                                        |
| Route error page, `ErrorState` (load failed + retry + request id)                            | `features/errors/pages/RouteErrorPage.jsx`, `components/ui/ErrorState.jsx` | the Empty State layout with danger colors, Figma warning icon (48:775)                                                       |
| Loading: `Spinner`, `Skeleton`                                                               | `components/ui/`                                                           | brand color ring; `bg-border` blocks                                                                                         |
| `Textarea`                                                                                   | `components/ui/Textarea.jsx`                                               | the Input field metrics                                                                                                      |
| Checkbox unchecked state                                                                     | `components/ui/Checkbox.jsx`                                               | border/strong on bg/canvas, same 18px / radius 6                                                                             |
| Form-level alert (server errors above the submit button)                                     | `components/form/FormAlert.jsx`                                            | Toast icons and soft state colors                                                                                            |
| Account dropdown (desktop) and account panel (mobile tab «حسابي»)                            | `AccountMenu.jsx`, `MobileTabBar.jsx`                                      | bg/raised, border/subtle, `shadow-menu`                                                                                      |
| Modal / dialog backdrop                                                                      | `Modal.jsx`, `ConfirmDialog.jsx`                                           | black 50%                                                                                                                    |
| Hover colors other than brand/hover                                                          | buttons, pagination, links                                                 | bg/inset, 90% opacity                                                                                                        |
| Password-shown state of the eye icon                                                         | `PasswordField.jsx`                                                        | the same eye icon, `aria-pressed`                                                                                            |
| Reset password page (code + new password)                                                    | `features/auth/pages/ResetPasswordPage.jsx`                                | the «استعادة كلمة المرور» card and auth fields                                                                               |
| Confirm-email result page (pending / success / failed + resend)                              | `ConfirmEmailPage.jsx`, `ConfirmEmailFailed.jsx`                           | the auth card                                                                                                                |
| Check-email variants: without an email in the URL, and «أعد الإرسال» once the countdown ends | `CheckEmailPage.jsx`                                                       | the same card                                                                                                                |
| Mobile register, forgot password, check email                                                | the same pages below `xl`                                                  | the mobile login frame (84:716) and the auth card at full width                                                              |
| Mobile register hero copy                                                                    | `RegisterPage.jsx`                                                         | desktop title and subtitle in the mobile hero                                                                                |
| Tablet widths (below 1280)                                                                   | everywhere                                                                 | the mobile layout; auth forms capped at 560                                                                                  |
| Mobile footer                                                                                | —                                                                          | none (the mobile frames have none)                                                                                           |
| Theme toggle on mobile                                                                       | —                                                                          | none (the mobile frames have none)                                                                                           |
| The open list of `Select`                                                                    | `Select.jsx`                                                               | the browser's native list (the Figma menu is not reproduced)                                                                 |
| Placeholder home page                                                                        | `HomePage.jsx`                                                             | the logo + text styles, until step 5                                                                                         |
| Phone status bar in the mobile frames                                                        | —                                                                          | device chrome, not part of the app                                                                                           |
| Dark versions of the screens                                                                 | every screen                                                               | the Color variables' Dark mode. Figma has Dark only for the dark check 34:105, the logo, the footer and the identity panels. |

---

## g. Verification procedure

Required for every UI change.

1. **Figma side.**
   - `get_screenshot` of the frame or component, plus `get_design_context` for its values.
   - For exact paddings, gaps, sizes and stroke alignment, read the node with a read-only `use_figma` script.
2. **Code side.**
   - `npm run build && npx vite preview`.
   - Render with Playwright (Chromium at `/opt/pw-browsers`):
     - desktop frames at **1440** wide, mobile frames at **390** wide;
     - once with `colorScheme: 'light'` and once with `'dark'`;
     - full-page screenshots.
   - Signed-in states: store a test session in `localStorage` (`judhur.auth`) with an init script. The header decodes the token only.
   - Components with no page yet: render them on a temporary page (an extra `.html` entry served by `vite`). Delete it afterwards.
3. **Compare side by side.**
   - Compose the images with PIL: Figma | Light | Dark, scaled to the same width.
   - Also measure the key boxes with `getBoundingClientRect` against the Figma sizes (heights of fields, buttons, bars, cards).
4. **Fix and repeat.** Fix every visible or measured difference, then repeat.
5. **Record.** Only then mark the row "matches YYYY-MM-DD" in c or d. Anything that can't match goes under "Could not match", with the reason.

### Last verification — 2026-09-26

- **Screens:** login, register, check email, forgot password (1440, Light + Dark); mobile login (390, Light + Dark).
- **Layout:** Navbar in all three states (Light + Dark), footer, mobile top bar and tab bar.
- **Components:** every built component on a temporary page.
- **Measured against Figma:**

  | Element                           | Height (px)           |
  | --------------------------------- | --------------------- |
  | Navbar                            | 71                    |
  | Tab bar                           | 89                    |
  | Check-email card                  | 558                   |
  | Forgot-password card              | 459                   |
  | Register content                  | 813                   |
  | Auth fields                       | 51                    |
  | Mobile auth fields                | 50                    |
  | Input                             | 50                    |
  | Select                            | 49                    |
  | Buttons (large / small)           | 48 / 37               |
  | Pagination items (height × width) | 42 × 36               |
  | Confirm dialogs                   | 290 · 228 · 324 · 333 |

### Could not match

- **Pagination order.**
  - The Pagination frame (47:824) places «التالي» next to page 1 and «السابق» next to the last page.
  - Its own description says «الصفحة 1 على اليمين، 'التالي' على اليسار». In RTL, «التالي» belongs after the last page.
  - The code follows the description.
- **Register at 1440×900.**
  - The frame is fixed at 900 high and its content (813) is taller than 900 minus the 60+60 padding, so Figma centers it and lets it spill (top at 43.5).
  - A browser page grows instead, so the content starts at 60 and the page is 933 high.
- **Password rule chips (register).**
  - Figma shows «8 أحرف · حرف كبير · رقم · رمز خاص».
  - The API requires a lowercase letter and no symbol (`CLAUDE.md` 6.3), so the chips are «8 أحرف · حرف كبير · حرف صغير · رقم». «حرف صغير» is not in Figma.
- **Register user name.**
  - The design has no user-name field; the API requires `userName`.
  - The email is sent as the user name (BACKEND_REQUESTS #13).
- **Forgot-password copy.** Figma says a link is emailed; the API emails a 6-digit code. The copy is kept word for word (BACKEND_REQUESTS #14).
- **Google button.**
  - The Figma logo layer is a placeholder («شعار Google (ضع الأصل هنا)»), so the placeholder icon is shown.
  - Google sign-in isn't in the API, so a click shows «قريباً».
- **Check-email copy** says the link is valid for 24 hours. That comes from Figma; the backend's real lifetime is not in the contract.
- **Dark mode of the screens.** Only the token swap could be compared, because the screens have no Dark frames in Figma. Adding Dark frames would mean modifying the file, which is not allowed.
