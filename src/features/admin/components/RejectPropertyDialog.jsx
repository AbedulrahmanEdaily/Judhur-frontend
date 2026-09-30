import { IconWarning20 } from '../../../components/icons/index.js';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { useRejectPropertyMutation } from '../adminApi.js';

const text = ar.admin;

// The API limit of rejectionReason (the project guide 6.10).
const MAX_REASON_LENGTH = 500;

/**
 * Figma Confirm Dialog «رفض عقار» (48:770) with the reason box, plus a live 500 counter and
 * quick-pick reasons that fill the box (the project guide 6.10; not in Figma). Used by the queue
 * and the review page.
 *
 * @param {{
 *   property: { id: string, title: string } | null,
 *   onClose: () => void,
 *   onRejected: () => void,
 * }} props
 */
export function RejectPropertyDialog({ property, onClose, onRejected }) {
  const toast = useToast();
  const [rejectProperty, { isLoading }] = useRejectPropertyMutation();

  async function handleConfirm(reason) {
    try {
      await rejectProperty({ propertyId: property.id, rejectionReason: reason }).unwrap();
      toast.show({ tone: 'success', message: text.rejected(property.title) });
      onRejected();
    } catch (error) {
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
      onClose();
    }
  }

  return (
    <ConfirmDialog
      open={property !== null}
      onClose={onClose}
      onConfirm={handleConfirm}
      tone="danger"
      icon={IconWarning20}
      title={text.rejectDialog.title}
      description={text.rejectDescription}
      confirmLabel={text.rejectDialog.confirm}
      reason={{
        label: text.rejectDialog.reasonLabel,
        placeholder: text.rejectDialog.reasonPlaceholder,
        maxLength: MAX_REASON_LENGTH,
        suggestions: text.rejectSuggestions,
      }}
      loading={isLoading}
    />
  );
}
