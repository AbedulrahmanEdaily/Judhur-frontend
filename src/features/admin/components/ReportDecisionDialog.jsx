import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { formatNumber } from '../../../lib/format.js';
import { actionErrorMessage, toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { ListingTextarea } from '../../properties/components/ListingTextarea.jsx';
import { MAX_ADMIN_NOTE_LENGTH, MAX_SUSPENSION_REASON_LENGTH } from '../../reports/constants.js';
import { reportDecisionSchema } from '../../reports/schemas.js';
import { useDismissReportMutation, useResolveReportMutation } from '../adminApi.js';

const text = ar.admin.reports;
const FIELD_NAMES = ['adminNote', 'suspensionReason'];

const dialogs = {
  dismiss: { ...text.dismissDialog, done: text.dismissed, variant: 'primary' },
  resolve: { ...text.resolveDialog, done: text.resolved, variant: 'primary' },
  suspend: { ...text.suspendDialog, done: text.suspended, variant: 'danger' },
};

/** "12 / 1000" under a text box. */
function renderCounter(value, max) {
  return (
    <p className="-mt-1 text-end text-[12px] leading-[1.78] text-muted" aria-live="polite">
      <span dir="ltr">{`${value.length} / ${max}`}</span>
    </p>
  );
}

/**
 * The confirm dialog of a report decision (not in Figma — the Modal 45:741): «لا توجد مخالفة»
 * closes this report; «اتخاذ إجراء» closes every pending report on the listing (said here when
 * there are others); «… وإيقاف الإعلان» also asks for the reason the owner will read. Every
 * action takes an optional «ملاحظة للمبلّغ». Mounted only while open, so it starts empty. A
 * 404 / 409 (already reviewed, or decided at the same moment) closes it with a toast and the
 * page refetches; other errors stay in the dialog.
 *
 * @param {{
 *   action: 'dismiss' | 'resolve' | 'suspend',
 *   report: import('../../../api/types.js').ReportDetails,
 *   onClose: () => void,
 *   onFinished: () => void,
 * }} props
 */
export function ReportDecisionDialog({ action, report, onClose, onFinished }) {
  const toast = useToast();
  const [dismissReport] = useDismissReportMutation();
  const [resolveReport] = useResolveReportMutation();
  const [failure, setFailure] = useState(null);
  const isSuspending = action === 'suspend';
  const dialog = dialogs[action];

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportDecisionSchema(isSuspending)),
    mode: 'onTouched',
    defaultValues: { adminNote: '', suspensionReason: '' },
  });
  const adminNote = useWatch({ control, name: 'adminNote' });
  const suspensionReason = useWatch({ control, name: 'suspensionReason' });

  async function onSubmit(values) {
    setFailure(null);
    try {
      if (action === 'dismiss') {
        await dismissReport({ reportId: report.id, adminNote: values.adminNote }).unwrap();
      } else {
        await resolveReport({
          reportId: report.id,
          propertyId: report.property.id,
          adminNote: values.adminNote,
          suspendProperty: isSuspending,
          suspensionReason: values.suspensionReason,
        }).unwrap();
      }
      toast.show({ tone: 'success', message: dialog.done });
      onFinished();
    } catch (error) {
      const status = toProblem(error).status;
      if (status === 404 || status === 409) {
        toast.show({ tone: 'error', message: actionErrorMessage(error) });
        onFinished();
        return;
      }
      const { problem, formMessage } = applyServerErrors(error, setError, FIELD_NAMES);
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  function close() {
    if (!isSubmitting) onClose();
  }

  const closesOthers = action !== 'dismiss' && report.otherPendingReportsOnProperty > 0;

  return (
    <Modal open onClose={close} title={dialog.title}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <p className="text-[14px] leading-[1.78] text-text-secondary">{dialog.description}</p>
        {closesOthers && (
          <p className="rounded-md bg-warning-soft px-3.5 py-3 text-[12.5px] leading-[1.78] font-semibold text-warning">
            {text.closesOthers(formatNumber(report.otherPendingReportsOnProperty))}
          </p>
        )}

        {isSuspending && (
          <>
            <ListingTextarea
              label={text.suspensionLabel}
              placeholder={text.suspensionPlaceholder}
              maxLength={MAX_SUSPENSION_REASON_LENGTH}
              rows={3}
              error={errors.suspensionReason?.message}
              {...register('suspensionReason')}
            />
            {renderCounter(suspensionReason, MAX_SUSPENSION_REASON_LENGTH)}
          </>
        )}

        <ListingTextarea
          label={`${text.noteLabel} ${text.noteOptional}`}
          placeholder={text.notePlaceholder}
          maxLength={MAX_ADMIN_NOTE_LENGTH}
          rows={3}
          error={errors.adminNote?.message}
          {...register('adminNote')}
        />
        {renderCounter(adminNote, MAX_ADMIN_NOTE_LENGTH)}

        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            {ar.common.cancel}
          </Button>
          <Button type="submit" variant={dialog.variant} loading={isSubmitting} className="flex-1">
            {dialog.confirm}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
