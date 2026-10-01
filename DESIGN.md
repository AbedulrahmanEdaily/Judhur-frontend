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

| Value                                                                                           | Where (Figma)                                                                              | Code                               |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| Gradient `rgb(9 28 23 / .63) → rgb(9 28 23 / .84)`, top to bottom                               | «طبقة تعتيم» over the photo in the auth identity panel (89:4753)                           | `bg-auth-overlay`                  |
| Gradient 141.94°, `rgb(14 102 74) 0%` → `rgb(10 31 48) 71.429%`                                 | mobile login «الهوية» header (84:721)                                                      | `bg-auth-hero`                     |
| White at 80 / 75 / 70 / 55 / 16 / 14 %                                                          | identity panel text and badges, mobile hero subtitle, footer items / copyright / divider   | `text-white/80` … `bg-white/14`    |
| Radius 10                                                                                       | Pagination items (47:824)                                                                  | `rounded-[10px]`                   |
| Radius 6                                                                                        | Checkbox «مربع» (69:1254)                                                                  | `rounded-[6px]`                    |
| Radius 4                                                                                        | Google logo box (96:6320)                                                                  | `rounded-[4px]`                    |
| Font sizes 10.5 · 11.5 · 12.5 · 13.5 · 14.5 · 15.5 · 19 · 20 · 22 · 25 · 26 · 30 · 32           | screen text that is not bound to a text style                                              | `text-[…px]`                       |
| Line heights 1.65 · 1.68 · 1.7 · 1.72 · 1.75 · 1.78                                             | the same text layers                                                                       | `leading-[…]`                      |
| Gradient `rgb(9 28 23 / .62) → rgb(9 28 23 / .82)`, top to bottom                               | «طبقة تعتيم» over the home hero photo (89:4549) — lighter, see "Could not match"           | `bg-home-hero-overlay`             |
| Gradient 147.2°, `rgb(14 102 74) 0%` → `rgb(10 31 48) 71.429%`                                  | mobile home hero card «واجهة» (83:529) — replaced by the hero photo, see "Could not match" | not used                           |
| Gradient `rgb(9 28 23 / .52) → rgb(9 28 23 / .7)`, top to bottom                                | home city cards «طبقة تعتيم» (89:4583…)                                                    | `bg-city-overlay`                  |
| Shadow `0 14 40 −8`, black 22%                                                                  | home hero search bar (49:594)                                                              | `shadow-search`                    |
| `rgb(33 191 133 / .2)`                                                                          | tag of the home AI cards (51:746)                                                          | `bg-[rgb(33_191_133/0.2)]`         |
| White at 95 / 92 / 82 / 78 / 72 / 7 %, black at 45 %                                            | home hero and AI texts, details photo buttons, the photo pill of the card                  | `text-white/95` … `bg-black/45`    |
| Radius 18 · 14                                                                                  | home search bar, details main photo · details thumbnails and map                           | `rounded-[18px]`, `rounded-[14px]` |
| Font sizes 11 · 15 · 17 · 18 · 21 · 27 · 28 · 34 · 46                                           | home, search and details text not bound to a text style                                    | `text-[…px]`                       |
| Line heights 1.5 · 1.55 · 1.8                                                                   | home hero title, tagline and hint, subtitle                                                | `leading-[…]`                      |
| Paddings and gaps from the frames (for example 110/60 auth form, 120 footer, 15/13 auth fields) | noted in each component's doc comment with its node id                                     | `p-[…px]`, `gap-[…px]`             |

---

## c. Component map

Status key:

- **matches** — compared side by side (section g), with the date.
- **needs fix** — known differences are open.
- **not built** — nothing in code yet.

| Figma component (node)               | Variants (Figma names)                                                                                                                          | React                                                                                                                                                                                                                                              | Status                                                                                                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| زر / Button (27:18)                  | النوع=أساسي / ثانوي / شبح / خطر × الحجم=كبير / صغير (27:2 … 27:16)                                                                              | `components/ui/Button.jsx` — `variant="primary\|secondary\|ghost\|danger"`, `size="lg\|sm"`, `loading`, `fullWidth`                                                                                                                                | matches 2026-09-26                                                                                                                                                  |
| شارة / Badge (27:37)                 | النوع=تصنيف أ 27:19 · تصنيف ب 27:21 · تصنيف ج 27:23 · للبيع 27:25 · للإيجار 27:27 · مباع 27:29 · قيد المراجعة 27:31 · معتمد 27:33 · مرفوض 27:35 | `components/ui/Badge.jsx` — `tone="land-a\|land-b\|land-c\|brand\|info\|neutral\|warning\|success\|danger"`                                                                                                                                        | matches 2026-09-26                                                                                                                                                  |
| شارة / Badge — موثّق (40:92)         | النوع=موثّق                                                                                                                                     | `components/ui/VerifiedBadge.jsx`                                                                                                                                                                                                                  | matches 2026-09-26                                                                                                                                                  |
| حقل إدخال / Input (32:139)           | الحالة=عادي 32:115 · مركّز 32:121 · خطأ 32:127 · معطّل 32:133                                                                                   | `components/ui/Input.jsx` — `label`, `hint`, `error`, `suffix`, `disabled`                                                                                                                                                                         | matches 2026-09-26                                                                                                                                                  |
| قائمة منسدلة / Select (46:827)       | —                                                                                                                                               | `components/ui/Select.jsx` — `label`, `options`, `value`, `onChange`, `placeholder`, `hint`, `error`; the open list is `components/ui/SelectMenu.jsx` (the Figma menu «القائمة» 46:833), shared by every select (listing forms, home search, sort) | matches 2026-10-01 (field and menu)                                                                                                                                 |
| صورة المستخدم / Avatar (44:769)      | الحجم=كبير 44:763 · متوسط 44:765 · صغير 44:767                                                                                                  | `components/ui/Avatar.jsx` — `name`, `imageUrl` («متوسط» only)                                                                                                                                                                                     | matches 2026-09-30 («متوسط»); «كبير» and «صغير» not built                                                                                                           |
| تقييم / Rating (44:770)              | —                                                                                                                                               | —                                                                                                                                                                                                                                                  | not built                                                                                                                                                           |
| شريط علوي / Navbar (34:104)          | الحالة=زائر 34:2 · مستخدم 34:31 · أدمن 34:65                                                                                                    | `components/layout/Header.jsx` (+ `HeaderSearch`, `ThemeToggle`, `AccountMenu`); the state comes from the session                                                                                                                                  | matches 2026-09-26                                                                                                                                                  |
| عنصر سايدبار / Sidebar Item (44:755) | الحالة=عادي 44:741 · نشط 44:748                                                                                                                 | `components/layout/AccountShell.jsx` — the sidebar of the account pages (75:669): `NavLink` items, the «عقاراتي» count, «قريباً» on pages without an API                                                                                           | matches 2026-09-30                                                                                                                                                  |
| تبويب / Tab (44:762)                 | الحالة=عادي 44:756 · نشط 44:759                                                                                                                 | —                                                                                                                                                                                                                                                  | not built                                                                                                                                                           |
| ترقيم الصفحات / Pagination (47:824)  | —                                                                                                                                               | `components/ui/Pagination.jsx` — `page`, `totalPages`, `onPageChange`                                                                                                                                                                              | matches 2026-09-26, except the order of «السابق»/«التالي» (see "Could not match")                                                                                   |
| بطاقة عقار / Property Card (33:2)    | —                                                                                                                                               | `features/properties/components/PropertyCard.jsx` — `property` (PropertySummary); the mobile card (83:547) below `xl`                                                                                                                              | matches 2026-10-01 for the data the API has (no photo count, land badge, frontage, street, AI estimate or seller row); the heart «مفضلة» (33:4) is `FavoriteButton` |
| صف جدول / Table Row (47:807)         | —                                                                                                                                               | the admin queue rows in `features/admin/pages/PendingPropertiesPage.jsx`; the «عقاراتي» table (75:726) in `MyPropertiesPage.jsx`                                                                                                                   | matches 2026-09-30 for the data the API has (type badge instead of land class; area and payment instead of seller, images and document)                             |
| حالة فارغة / Empty State (45:787)    | —                                                                                                                                               | `components/ui/EmptyState.jsx` — `icon`, `title`, `description`, `action {label, to \| onClick}`                                                                                                                                                   | matches 2026-09-26                                                                                                                                                  |
| صورة عقار / Property Photo (89:843)  | الوقت=صباح 89:744 · ظهيرة 89:777 · غروب 89:810                                                                                                  | `features/properties/components/PropertyPhoto.jsx` — `src`, `placeholder`; the variant exports `assets/photos/property-morning.svg`, `property-noon.svg`, `property-sunset.svg`; the auth panels use a photo instead (see "Could not match")       | matches 2026-09-30                                                                                                                                                  |
| نافذة / Modal (45:741)               | —                                                                                                                                               | `components/ui/Modal.jsx` — `open`, `onClose`, `title`, `children`, `footer`                                                                                                                                                                       | matches 2026-09-26 (frame: padding, header, close icon, radius, shadow); the report-reason options inside are not built                                             |
| تنبيه / Toast (45:786)               | الحالة=نجاح 45:765 · تحذير 45:772 · خطأ 45:779 · تراجع 48:803                                                                                   | `components/ui/Toast.jsx` — `tone="success\|warning\|error\|neutral"`, `message`, `action`, `onClose`; shown by `ToastProvider` / `useToast`                                                                                                       | matches 2026-09-26                                                                                                                                                  |
| فقاعة محادثة / Chat Bubble (47:799)  | الطرف=أنا 47:789 · الطرف الآخر 47:794                                                                                                           | —                                                                                                                                                                                                                                                  | not built                                                                                                                                                           |
| حقل المحادثة / Chat Input (47:800)   | —                                                                                                                                               | —                                                                                                                                                                                                                                                  | not built                                                                                                                                                           |
| رفع وثيقة / Uploader (46:810)        | —                                                                                                                                               | `features/properties/components/DocumentUploader.jsx` — `propertyId`, `hasDocument`, `confirmReplace`                                                                                                                                              | matches 2026-09-30                                                                                                                                                  |
| خطوات الويزارد / Stepper (46:789)    | —                                                                                                                                               | `features/properties/components/ListingStepper.jsx` — `current`, `onStepClick`; the mobile bars of 84:675                                                                                                                                          | matches 2026-09-30 (the current step shows its number, see "Could not match")                                                                                       |
| حوار تأكيد / Confirm Dialog (48:802) | النوع=حذف عقار 48:741 · تعطيل عقار 48:757 · رفض عقار 48:770 · حذف حساب 48:786                                                                   | `components/ui/ConfirmDialog.jsx` — `tone="danger\|warning"`, `icon`, `title`, `description`, `details`, `reason {label, placeholder, maxLength, suggestions}`, `confirmWord`, `confirmLabel`, `onConfirm(reason?)`                                | matches 2026-09-26                                                                                                                                                  |
| الشعار / ختم جذور (41:137)           | —                                                                                                                                               | `components/layout/Logo.jsx` — `size`, `decorative`; light/dark files from 41:137 and the dark check 34:105                                                                                                                                        | matches 2026-09-26                                                                                                                                                  |

### Parts of screens used as components

| Figma node                                             | React                                                         | Status                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Footer «التذييل» (51:801)                              | `components/layout/Footer.jsx`                                | matches 2026-09-26                                                                                      |
| Mobile top bar «الشريط العلوي» (83:477)                | `components/layout/MobileTopBar.jsx`                          | matches 2026-09-26                                                                                      |
| Mobile tab bar «شريط التبويب» (83:577)                 | `components/layout/MobileTabBar.jsx`                          | matches 2026-09-26                                                                                      |
| Checkbox «مربع» (69:1254)                              | `components/ui/Checkbox.jsx`                                  | matches 2026-09-26 (checked state)                                                                      |
| Auth field «حقل» (69:1240, mobile 84:780)              | `features/auth/components/AuthInput.jsx`, `PasswordField.jsx` | matches 2026-09-26                                                                                      |
| Password rule chips (69:1364…)                         | `features/auth/components/PasswordRules.jsx`                  | matches 2026-09-26, with one chip changed (see "Could not match")                                       |
| Google button + «أو» divider                           | `features/auth/components/GoogleSignInButton.jsx`             | matches 2026-10-01 — Google's official button in place of the Figma placeholder (see "Could not match") |
| Auth card «بطاقة» (70:1253, 70:1314)                   | `features/auth/components/AuthCard.jsx`                       | matches 2026-09-26                                                                                      |
| Identity panel + form panel (69:1159, 69:1262, 84:716) | `features/auth/components/AuthSplitLayout.jsx`                | matches 2026-09-26                                                                                      |

---

## d. Screen map

Desktop frames are 1440 wide. The "Step" column refers to the build order in `CLAUDE.md` section 14: `P1·n` is phase 1 (done), `P2·n` is phase 2.

| Figma screen (node)                | Route                         | React page                                                                                           | Step  | Mobile counterpart               | Status                                                                                                               |
| ---------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- | ----- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| الرئيسية (49:472)                  | `/`                           | `features/properties/pages/HomePage.jsx`                                                             | P2·2  | 83:472                           | matches 2026-09-30 (without the counts and card fields the API lacks)                                                |
| نتائج البحث (52:782)               | `/properties`                 | `features/properties/pages/SearchPage.jsx`                                                           | P2·2  | 83:599                           | matches 2026-09-30 (without the counts, the map switch and the card fields the API lacks)                            |
| تفاصيل العقار (65:1087)            | `/properties/:id`             | `features/properties/pages/PropertyDetailsPage.jsx`                                                  | P2·2  | 83:671                           | matches 2026-09-30 (without views, report, save, street, frontage, AI estimate, nearby places, rating and messaging) |
| تسجيل الدخول (69:1159)             | `/login`                      | `features/auth/pages/LoginPage.jsx`                                                                  | P1·4  | 84:716                           | matches 2026-09-26                                                                                                   |
| إنشاء حساب (69:1262)               | `/register`                   | `features/auth/pages/RegisterPage.jsx`                                                               | P1·4  | none (built from 84:716)         | matches 2026-09-26                                                                                                   |
| تأكيد البريد (70:1253)             | `/register/check-email`       | `features/auth/pages/CheckEmailPage.jsx`                                                             | P1·4  | none                             | matches 2026-09-26                                                                                                   |
| استعادة كلمة المرور (70:1314)      | `/forgot-password`            | `features/auth/pages/ForgotPasswordPage.jsx`                                                         | P1·4  | none                             | matches 2026-09-26                                                                                                   |
| الخريطة (71:1300)                  | — (no route yet)              | —                                                                                                    | later | none                             | not built — needs coordinates in search results (BACKEND_REQUESTS #7)                                                |
| ملف البائع (73:1373)               | —                             | —                                                                                                    | later | none                             | not built — no public profile endpoint                                                                               |
| لوحتي (74:472)                     | `/dashboard`                  | `features/dashboard/pages/DashboardPage.jsx`                                                         | P2·4  | 84:575                           | matches 2026-09-30 for the data the API has (see "Could not match")                                                  |
| عقاراتي (75:592)                   | `/my-properties`              | `features/properties/pages/MyPropertiesPage.jsx`                                                     | P2·4  | none (built as cards below 1280) | matches 2026-09-30 (date added instead of views / requests)                                                          |
| المفضلة (75:815)                   | `/favorites`                  | `features/favorites/pages/FavoritesPage.jsx`                                                         | P2·5  | none                             | matches 2026-10-01 (subtitle without the price-change promise; 12 per page with pagination)                          |
| المحادثات (76:968)                 | —                             | —                                                                                                    | later | 84:530                           | not built — no messaging API (#12)                                                                                   |
| الإشعارات (76:1172)                | —                             | —                                                                                                    | later | none                             | not built — no notifications API (#12)                                                                               |
| أضف عقار 1 البيانات (77:1136)      | `/properties/new`             | `features/properties/pages/CreatePropertyPage.jsx`                                                   | P2·3  | 84:664                           | matches 2026-09-30 (+ «طريقة الدفع», API field)                                                                      |
| أضف عقار 2 الموقع (91:1902)        | `/properties/new?step=2`      | CreatePropertyPage                                                                                   | P2·3  | 84:664 (layout)                  | matches 2026-09-30 (+ address and coordinate fields, map search)                                                     |
| أضف عقار 3 الصور (91:1991)         | `/properties/new?id=…&step=3` | CreatePropertyPage + `ImagesManager.jsx`                                                             | P2·3  | 84:664 (layout)                  | matches 2026-09-30 (cover picked by a button, not dragged)                                                           |
| أضف عقار 4 الوثائق (91:2080)       | `/properties/new?id=…&step=4` | CreatePropertyPage + `DocumentUploader`, `OwnershipDeclarations`, `ListingSummary`                   | P2·3  | 84:664 (layout)                  | matches 2026-09-30                                                                                                   |
| أضف عقار تم الإرسال (91:2169)      | `/properties/new?id=…&step=5` | CreatePropertyPage + `SubmittedCard.jsx`                                                             | P2·3  | 84:664 (layout)                  | matches 2026-09-30 (warning pill instead of gold)                                                                    |
| المساعد الذكي (78:1229)            | —                             | —                                                                                                    | later | none                             | not built — no API (#12)                                                                                             |
| تقرير تقدير السعر (78:1472)        | —                             | —                                                                                                    | later | none                             | not built — no API (#12)                                                                                             |
| الملف الشخصي (79:1500)             | —                             | —                                                                                                    | later | none                             | not built — needs "me" (#4)                                                                                          |
| لوحة الإحصائيات (80:472)           | —                             | —                                                                                                    | later | none                             | not built — no statistics API (#12); `/admin` redirects to the queue                                                 |
| طابور الموافقات (80:753)           | `/admin/properties`           | `features/admin/pages/PendingPropertiesPage.jsx` + `AdminShell.jsx`, `AdminBanner.jsx`               | P2·6  | none (rows wrap below 1280)      | matches 2026-09-30 for the data the API has                                                                          |
| مراجعة عقار (81:751)               | `/admin/properties/:id`       | `features/admin/pages/ReviewPropertyPage.jsx` + `ReviewDocumentCard.jsx`, `RejectPropertyDialog.jsx` | P2·6  | none (one column below 1280)     | matches 2026-09-30 for the data the API has (see "Could not match")                                                  |
| إدارة المستخدمين (82:827)          | —                             | —                                                                                                    | later | none                             | not built — no API (#12)                                                                                             |
| البلاغات (82:1026)                 | —                             | —                                                                                                    | later | none                             | not built — no reports API (#12)                                                                                     |
| استهلاك الذكاء الاصطناعي (82:1236) | —                             | —                                                                                                    | later | none                             | not built — no API (#12)                                                                                             |

The owner listing page (`/my-properties/:id`) and its edit page (`/my-properties/:id/edit`) are in `CLAUDE.md` section 11 but have no frame in the list above. Rule 10 applies before step P2·4 builds them.

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

| Item                                                                                                                                                                                                                                               | Where in code                                                                                          | Built from                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 404 page                                                                                                                                                                                                                                           | `features/errors/pages/NotFoundPage.jsx`                                                               | text styles + the primary Button look                                                                                        |
| Route error page, `ErrorState` (load failed + retry + request id)                                                                                                                                                                                  | `features/errors/pages/RouteErrorPage.jsx`, `components/ui/ErrorState.jsx`                             | the Empty State layout with danger colors, Figma warning icon (48:775)                                                       |
| Loading: `Spinner`, `Skeleton`                                                                                                                                                                                                                     | `components/ui/`                                                                                       | brand color ring; `bg-border` blocks                                                                                         |
| `Textarea`                                                                                                                                                                                                                                         | `components/ui/Textarea.jsx`                                                                           | the Input field metrics                                                                                                      |
| Checkbox unchecked state                                                                                                                                                                                                                           | `components/ui/Checkbox.jsx`                                                                           | border/strong on bg/canvas, same 18px / radius 6                                                                             |
| Form-level alert (server errors above the submit button)                                                                                                                                                                                           | `components/form/FormAlert.jsx`                                                                        | Toast icons and soft state colors                                                                                            |
| Account dropdown (desktop) and account panel (mobile tab «حسابي»)                                                                                                                                                                                  | `AccountMenu.jsx`, `MobileTabBar.jsx`                                                                  | bg/raised, border/subtle, `shadow-menu`                                                                                      |
| Modal / dialog backdrop                                                                                                                                                                                                                            | `Modal.jsx`, `ConfirmDialog.jsx`                                                                       | black 50%                                                                                                                    |
| Hover colors other than brand/hover                                                                                                                                                                                                                | buttons, pagination, links                                                                             | bg/inset, 90% opacity                                                                                                        |
| Password-shown state of the eye icon                                                                                                                                                                                                               | `PasswordField.jsx`                                                                                    | the same eye icon, `aria-pressed`                                                                                            |
| Reset password page (code + new password)                                                                                                                                                                                                          | `features/auth/pages/ResetPasswordPage.jsx`                                                            | the «استعادة كلمة المرور» card and auth fields                                                                               |
| Confirm-email result page (pending / success / failed + resend)                                                                                                                                                                                    | `ConfirmEmailPage.jsx`, `ConfirmEmailFailed.jsx`                                                       | the auth card                                                                                                                |
| Check-email variants: without an email in the URL, and «أعد الإرسال» once the countdown ends                                                                                                                                                       | `CheckEmailPage.jsx`                                                                                   | the same card                                                                                                                |
| Mobile register, forgot password, check email                                                                                                                                                                                                      | the same pages below `xl`                                                                              | the mobile login frame (84:716) and the auth card at full width                                                              |
| Mobile register hero copy                                                                                                                                                                                                                          | `RegisterPage.jsx`                                                                                     | desktop title and subtitle in the mobile hero                                                                                |
| Tablet widths (below 1280)                                                                                                                                                                                                                         | everywhere                                                                                             | the mobile layout; auth forms capped at 560                                                                                  |
| Mobile footer                                                                                                                                                                                                                                      | —                                                                                                      | none (the mobile frames have none)                                                                                           |
| Theme toggle on mobile                                                                                                                                                                                                                             | —                                                                                                      | none (the mobile frames have none)                                                                                           |
| Keyboard and focus of the select menu (arrows, Home/End, Enter/Space, Escape, Tab; opens on mouse press like a native select)                                                                                                                      | `SelectMenu.jsx`                                                                                       | the Figma menu «القائمة» (46:833); the native list was hard to read in dark mode, so no `<select>` is left                   |
| Sold / rented pill on the card photo                                                                                                                                                                                                               | `PropertyCard.jsx`                                                                                     | the card's photo-count pill (33:8)                                                                                           |
| Favorite heart states: outline when not saved, filled brand when saved, «محفوظ» on the details button; the guest heart opens login; no heart for admins                                                                                            | `FavoriteButton.jsx`, `IconFavoriteHeart.jsx`                                                          | Figma «مفضلة» (33:4, 83:677) and «حفظ» (65:1177), which show one filled heart                                                |
| Card title fixed at two lines (longer titles end with "…", full title on hover)                                                                                                                                                                    | `PropertyCard.jsx`                                                                                     | the card title style (33:2)                                                                                                  |
| Reject dialog: live counter (500) and quick-pick reasons                                                                                                                                                                                           | `ConfirmDialog.jsx` (`reason.maxLength`, `reason.suggestions`), `RejectPropertyDialog.jsx`             | the dialog reason box (48:778)                                                                                               |
| Admin document preview inside the 330px area (an image in `<img>`, a PDF in `<object>` when the browser has a PDF viewer, otherwise the note «ما قدرنا نعرض الوثيقة هون — افتحها بحجم كامل»); the type comes from the file name in the signed link | `ReviewDocumentCard.jsx`                                                                               | the Figma preview area «معاينة» of the document card (81:844)                                                                |
| Admin: empty queue, the ⋮ menu of a queue row, the review page when the listing is already decided, document link states, the map and the extra facts on the review page                                                                           | `PendingPropertiesPage.jsx`, `ReviewPropertyPage.jsx`, `ReviewDocumentCard.jsx`                        | the queue and review frames, Empty State, LocationCard                                                                       |
| Admin links: «الموافقات» and «لوحة الإدارة» in the navbar, «طابور الموافقات» in the account menu and the mobile account panel; «قريباً» on admin pages without an API                                                                              | `Header.jsx`, `AccountMenu.jsx`, `MobileTabBar.jsx`, `AdminShell.jsx`                                  | Navbar «أدمن» (34:65)                                                                                                        |
| Type icons for مكاتب, مخازن, عمارات                                                                                                                                                                                                                | `HomeCategories.jsx`                                                                                   | reuse the محلات (50:597) and شقق (50:609) icons                                                                              |
| Type plurals other than أراضي and شقق, the title with no type («العقارات»)                                                                                                                                                                         | `constants.js`, `ar.js`                                                                                | the Figma title pattern «أراضي للبيع في نابلس»                                                                               |
| Home search: «أي نوع» and the price ranges                                                                                                                                                                                                         | `HomeHero.jsx`, `constants.js`                                                                         | the Figma field (49:599) with the SelectMenu list                                                                            |
| Cities after the first five, and the arrow buttons that scroll the city row                                                                                                                                                                        | `constants.js`, `CitiesSection.jsx`                                                                    | the Figma city list (51:760); five cards fill the width as in Figma                                                          |
| Sort options other than «الأحدث», and the list the sort pill opens                                                                                                                                                                                 | `constants.js`, `SortMenu.jsx`                                                                         | the Figma sort pill (53:858) and the Select menu «القائمة» (46:833)                                                          |
| Selected look of the purpose switch (inner padding, raised pill, brand text, light shadow)                                                                                                                                                         | `SearchFiltersPanel.jsx`                                                                               | Figma 52:865 switch; `shadow-segment` is the only new value                                                                  |
| Filter sections «المدينة» (the CITIES list, two columns) and «طريقة الدفع», and their active chips                                                                                                                                                 | `SearchFiltersPanel.jsx`, `ActiveFilterChips.jsx`                                                      | the other checkbox sections of 52:865 (title row, «مربع» rows, divider) and the chips of 53:865                              |
| Folded filter section                                                                                                                                                                                                                              | `FilterSection.jsx`                                                                                    | the section chevron turned up                                                                                                |
| Mobile filters sheet                                                                                                                                                                                                                               | `FiltersDrawer.jsx`                                                                                    | a full-screen dialog holding the desktop filters panel                                                                       |
| Mobile search: sort, active chips, pagination                                                                                                                                                                                                      | — / `SearchPage.jsx`                                                                                   | sort and chips are desktop only; pagination is the desktop Pagination                                                        |
| Empty search, loading skeletons, «العقار غير متاح»                                                                                                                                                                                                 | `SearchPage.jsx`, `PropertyCardSkeleton.jsx`, `PropertyDetailsSkeleton.jsx`, `PropertyDetailsPage.jsx` | Empty State, `ErrorState`, `Skeleton`                                                                                        |
| Land classes (ب) and (ج) on the details page                                                                                                                                                                                                       | `LegalStatusCard.jsx`, `ar.js`                                                                         | the (أ) box with the land-b / land-c colors; their wording is not in Figma                                                   |
| Details below the fold on mobile (facts, description, map, seller card, tips)                                                                                                                                                                      | `PropertyDetailsPage.jsx`                                                                              | the desktop cards, full width                                                                                                |
| Details gallery with fewer than two photos, and swiping on mobile                                                                                                                                                                                  | `PropertyGallery.jsx`                                                                                  | the main photo alone; a scroll-snap strip                                                                                    |
| Phone button states (login link for guests, the number after the tap)                                                                                                                                                                              | `PhoneButton.jsx`                                                                                      | the «اطلب رقم الهاتف» button (67:1218, 83:718)                                                                               |
| Owner page of one listing (state badge, rejection alert, readiness checklist, actions, media, data)                                                                                                                                                | `MyPropertyPage.jsx`, `ReadinessChecklist.jsx`, `OwnerActions.jsx`                                     | the «عقاراتي» frame, Badge, Button, ConfirmDialog, the wizard cards                                                          |
| Edit page (details + description)                                                                                                                                                                                                                  | `EditPropertyPage.jsx`                                                                                 | the wizard fields in two cards                                                                                               |
| Wizard: «طريقة الدفع», «العنوان الكامل», latitude / longitude fields, the map search box, «اجعلها الغلاف», the upload progress line and the file-type / size messages                                                                              | `ListingDataFields.jsx`, `ListingLocationFields.jsx`, `LocationPicker.jsx`, `ImagesManager.jsx`        | the wizard field (77:1240), inset note, toast colors                                                                         |
| Wizard: the empty-select text «اختر…», the placeholders, the step error messages                                                                                                                                                                   | `ar.js`                                                                                                | —                                                                                                                            |
| «عقاراتي» below 1280 (a card per listing), the ⋮ menu, the empty state, a tab with no listings                                                                                                                                                     | `MyPropertiesPage.jsx`, `RowActionsMenu.jsx`                                                           | Property Card colors, the Select menu (46:833), Empty State                                                                  |
| Dashboard for users without listings («عندك عقار للبيع أو الإيجار؟»), «آخر عقاراتك», «أحدث العقارات», the logout row of the mobile list                                                                                                            | `DashboardPage.jsx`                                                                                    | the dashboard cards (74:718)                                                                                                 |
| «لوحتي» / «عقاراتي» links in the account dropdown; «حسابي» tab → «لوحتي»; mobile top bars of the account pages                                                                                                                                     | `AccountMenu.jsx`, `MobileTabBar.jsx`, `PageTopBar.jsx`                                                | the mobile top bar of 84:580                                                                                                 |
| Map loading / failure states                                                                                                                                                                                                                       | `HereMap.jsx`, `LocationPicker.jsx`, `LocationCard.jsx`                                                | the Figma map frame (67:1177, 91:1980)                                                                                       |
| «تم نسخ رابط العقار» after sharing                                                                                                                                                                                                                 | `ShareButton.jsx`                                                                                      | the success Toast                                                                                                            |
| Map area                                                                                                                                                                                                                                           | `LocationCard.jsx`                                                                                     | the Figma map frame (67:1179) — the HERE map is not installed yet                                                            |
| Phone status bar in the mobile frames                                                                                                                                                                                                              | —                                                                                                      | device chrome, not part of the app                                                                                           |
| Dark versions of the screens                                                                                                                                                                                                                       | every screen                                                                                           | the Color variables' Dark mode. Figma has Dark only for the dark check 34:105, the logo, the footer and the identity panels. |

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

### Last verification — 2026-09-30

- **Property module (P2·3–4):** create wizard (all five frames), «عقاراتي», «لوحتي» at 1440 and 390, Light and Dark, against 77:1136, 91:1902, 91:1991, 91:2080, 91:2169, 84:664, 75:592, 74:472 and 84:575, with an in-memory backend that follows CLAUDE.md 6.6–6.9. Flows: step validation, create body, three sequential multipart uploads, cover change, document upload, statements, send; owner page per state with every action and its confirm dialog, the min-images error, edit (only changed parts sent, confirm on a published listing), delete; guest → login; map tap → coordinates + suggested address, map search, details marker, fallback when HERE fails.

- **Screens:** home, search, details at 1440 and 390, Light and Dark, against 49:472, 52:782, 65:1087, 83:472, 83:599 and 83:671. The API was stubbed in Playwright with the Figma sample listings.
- **Flows:** home search → search URL, filters apply (several values), chip removal (one value), sort menu (mouse, arrows, Enter, Escape, click outside), city row arrows, pagination, header search, mobile filters sheet, guest phone → login link, signed-in phone → `tel:` link, 404 → «العقار غير متاح».

### Verification — 2026-09-26

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
- **Google button.** The Figma button (70:1856) has a placeholder logo layer («شعار Google (ضع الأصل هنا)»). Google requires its own button for sign-in, so the page draws Google's official button (`renderButton`, Arabic, «المتابعة باستخدام Google», outline in light mode, `filled_black` in dark mode) in its place; Google caps it at 400px, so on the 660px desktop form it is centered. The «أو بالبريد الإلكتروني» divider is unchanged. Without a client ID the button and the divider are hidden. The first-time Google step (phone + city) is not in Figma: it reuses the register fields and the auth layout.
- **Check-email copy** says the link is valid for 24 hours. That comes from Figma; the backend's real lifetime is not in the contract.
- **Browse and details fields the API doesn't return** (decided on 2026-09-30: the UI follows the backend). Left out:
  - category and city counts, and the filter counts;
  - on cards: photo count, land badge, frontage, street, AI estimate, seller and rating;
  - on details: views, «إبلاغ», street and frontage facts, the AI estimate block, nearby places, seller rating and join date, «راسل البائع» (no messaging API).
  - The mobile details action bar carries the phone button instead of «راسل البائع».
- **Property types.** Figma shows أراضي · شقق · فلل · محلات · مزارع; the API has six types (شقة · منزل · أرض · مكتب · مخزن · عمارة), and the UI uses those.
- **Currency.** Figma shows `$`; prices stay in ILS (`DEFAULT_CURRENCY`, BACKEND_REQUESTS #9).
- **Filters take several values.** As in the Figma checkboxes, a buyer can tick several types, land classes or documents; the URL and the API request repeat the name once per value (OR inside one filter, AND between filters). City and payment type work the same way; the purpose stays one choice.
- **Filter labels.** Figma writes «منطقة (أ)», «ماليه», «تسويه»; the fixed labels of `CLAUDE.md` section 3 are «منطقة أ», «مالية», «تسوية».
- **Grid / map switch** on the search toolbar is left out: search results have no coordinates (BACKEND_REQUESTS #7).
- **Mobile home and search.** The mobile category chips are links, none selected (Figma shows «أراضي» selected); the heart in the mobile search bar (save search) is left out — no API.
- **HERE map.** The HERE npm registry and CDN are blocked in the build environment. The map is loaded from HERE's CDN at runtime (CLAUDE.md 10.1) and was checked against a stand-in library; without a key, or if HERE can't load, the details page shows the static Figma map frame and the wizard asks for the coordinates by hand.
- **Wizard stepper.** Figma 77:1136 shows the current first step with a check; the other frames show the current step as a brand circle with its number (91:1902), which is used on every step.
- **Wizard fields.** Figma step 1 has no payment type, step 2 no full address or coordinates, and «المنطقة / الحي» is a dropdown — the API needs the three fields and has no list of areas, so the area is typed. Mobile (84:664) mixes fields of steps 1 and 2 and adds images on step 1; the mobile build keeps the desktop steps in one column.
- **«احفظ كمسودة».** The API has no drafts: a listing exists once «الموقع» is done. The button shows from «الصور» on and opens the owner page, where the listing waits as Pending.
- **Copy that promised missing features.** «بيأثر على تقدير السعر بالذكاء الاصطناعي» (no AI estimate), «بتنرفع مشفّرة» (not in the contract), «وبيوصلك إشعار» (no notifications) and «(NFR-08)» are left out of the wizard text; «بتقدر تغيّرها بالسحب» became «من «اجعلها الغلاف»» (no reordering endpoint); the limits say 10 images and JPG / PNG / WEBP (API) instead of 12 and JPG / PNG.
- **Review-time pill** (95:2488) uses the warning colors — gold is for the «موثّق» badge only.
- **Ownership statements** (94:2493) keep the text next to its box instead of at the far end, so the label reads with the control.
- **Dashboard and «عقاراتي».** No name in the token («مرحباً بك»), no views, contact requests or messages in the API: the stats are listings, published and saved; «أكثر عقاراتك مشاهدة» is «آخر عقاراتك»; «آخر الرسائل» is «أحدث العقارات»; the table shows the date added. Sidebar items without a page show «قريباً»; the mobile list rows point left instead of down.
- **Login / register identity panel photo.** At the owner's request (2026-09-30) the panel shows a supplied photo (`assets/photos/auth-panel.jpg`, an old stone arch over a hillside town) instead of the Figma Property Photo. It fills the panel (`object-cover`) under the same «طبقة تعتيم» gradient. The file is 343×512, so it is scaled up on the 560-wide panel.
- **Home hero photo.** At the owner's request (2026-09-30) the desktop hero and the mobile hero card show a supplied photo (`assets/photos/home-hero.jpg`, a stone house among olive trees) instead of the Figma Property Photo and the mobile gradient. It fills the hero (`object-cover`) under the «طبقة تعتيم» gradient (`bg-home-hero-overlay`). At a later request the photo reads more clearly: the desktop hero fills the screen under the 71px header (`min-h-[calc(100svh-71px)]`), the mobile card is 420px tall with the text at the bottom, and the gradient is lighter (`rgb(9 28 23 / .3)` → `.45` at 55% → `.7`). The supplied file is only 512×286; it is stored upscaled to 1920×1072 (Lanczos + light sharpening), still softer than a real large photo — a larger original can replace it with no code change.
- **Admin screens** (80:753, 81:751) are drawn in Dark; in code they follow the theme like every other screen. Left out for lack of an API: the queue's average review time, seller name, image count, document and land class per row (a type badge and the area / payment are shown instead), the listing number and the queue position, «اطلب تعديل من المالك» (a rejection with a reason does the same: the owner edits and resubmits), the automatic class warning of the checklist (the checklist itself is a manual aid, not saved), and the owner's listing / report / rating / member-since line (the phone is shown). The strip says «إنت بوضع الإدارة — قراراتك بتوصل لأصحاب العقارات» instead of «أي إجراء بتعمله بينسجّل باسمك» (no audit log in the contract), and the review hint drops «وبتبعت إشعار للمالك» (no notifications yet). The document preview is a note plus «افتح بحجم كامل»: the signed link is opened in a new tab and refreshed when it expires.
- **Favorites** (75:815). The subtitle drops «— بنعلمك لو تغيّر سعر أي واحد فيهم.»: there are no notifications in the API. The heart in Figma is one gray filled shape on every card, saved or not; in code a saved listing gets the filled brand heart and an unsaved one the outline (the same Figma path, stroked), so the state is not shown by color alone. The sidebar's other counts (المحادثات, الإشعارات) stay «قريباً».
- **Dark mode of the screens.** Only the token swap could be compared, because the screens have no Dark frames in Figma. Adding Dark frames would mean modifying the file, which is not allowed.
