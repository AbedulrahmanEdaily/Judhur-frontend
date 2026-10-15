import { useDispatch, useSelector } from 'react-redux';
import { ar } from '../../../locales/ar.js';
import { selectTheme, themeToggled } from '../../ui/uiSlice.js';
import { PreferenceRow } from './PreferenceRow.jsx';

const text = ar.profile.preferences;

/**
 * Figma «التفضيلات» (79:1665): bg/raised, border/subtle, radius lg, 26 × 24, 18 apart. «الوضع
 * الداكن» works now (the same theme as the navbar moon, saved on this device). The email and the
 * phone preferences have no API yet (BACKEND_REQUESTS.md #17): their switches show today's
 * behaviour — no notification emails, the phone shown to signed-in buyers — and are disabled.
 * Admins have no listings or buyers, so they only get the theme.
 *
 * @param {{ isAdmin: boolean }} props
 */
export function PreferencesSection({ isAdmin }) {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  return (
    <section
      aria-labelledby="preferences-title"
      className="flex flex-col gap-[18px] rounded-lg border border-border bg-raised px-4 py-5 xl:px-[26px] xl:py-6"
    >
      <h2 id="preferences-title" className="text-[18px] leading-[1.72] font-bold text-text">
        {text.title}
      </h2>
      <PreferenceRow
        title={text.darkMode}
        hint={text.darkModeHint}
        checked={theme === 'dark'}
        onChange={() => dispatch(themeToggled())}
      />
      {!isAdmin && (
        <>
          <PreferenceRow
            title={text.emailNotifications}
            hint={text.emailNotificationsHint}
            checked={false}
            soon
          />
          <PreferenceRow title={text.showPhone} hint={text.showPhoneHint} checked soon />
        </>
      )}
    </section>
  );
}
