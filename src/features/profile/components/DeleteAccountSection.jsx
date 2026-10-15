import { useState } from 'react';
import { IconTrash } from '../../../components/icons/index.js';
import { ar } from '../../../locales/ar.js';
import { DeleteAccountDialog } from './DeleteAccountDialog.jsx';

const text = ar.profile.deleteAccount;

/**
 * Figma «منطقة الخطر» (79:1689): state/danger-soft, radius lg, 24×20; «حذف الحساب» 15 bold with
 * its line (13 secondary) at the start, «احذف حسابي» (danger, 18×11, 13.5 semibold, the 15px
 * trash) at the end. The line names what really goes (Figma says conversations and reviews too;
 * they stay as «مستخدم محذوف»). The button opens the strong confirm.
 *
 * @param {{ hasPassword: boolean }} props
 */
export function DeleteAccountSection({ hasPassword }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      aria-labelledby="delete-account-title"
      className="flex flex-col gap-3.5 rounded-lg bg-danger-soft px-4 py-4 xl:flex-row xl:items-center xl:px-6 xl:py-5"
    >
      <div className="flex flex-1 flex-col gap-0.5">
        <h2 id="delete-account-title" className="text-[15px] leading-[1.72] font-bold text-text">
          {text.title}
        </h2>
        <p className="text-[13px] leading-[1.72] text-text-secondary">{text.text}</p>
      </div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="flex items-center justify-center gap-2 self-start rounded-md bg-danger px-[18px] py-[11px] text-[13.5px] leading-[1.72] font-semibold whitespace-nowrap text-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger xl:self-auto"
      >
        <IconTrash width={15} height={15} />
        {text.open}
      </button>
      {isOpen && <DeleteAccountDialog hasPassword={hasPassword} onClose={() => setIsOpen(false)} />}
    </section>
  );
}
