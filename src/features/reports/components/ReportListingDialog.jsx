import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { ListingTextarea } from '../../properties/components/ListingTextarea.jsx';
import { MAX_REPORT_DETAILS_LENGTH, REPORT_REASON_LABELS, REPORT_REASONS } from '../constants.js';
import { useReportPropertyMutation } from '../reportsApi.js';
import { reportSchema } from '../schemas.js';

const text = ar.reports;
const FIELD_NAMES = ['reason', 'details'];

/**
 * «إبلاغ عن الإعلان» (not in Figma — the Modal 45:741 with token-built choices): the reason as
 * radio rows, then the details box (required for «سبب آخر», counter to 1000). Mounted only while
 * open, so every opening starts empty. A pending report on the same listing closes the dialog
 * with «لديك بلاغ قيد المراجعة على هذا الإعلان»; other server errors stay in the dialog.
 *
 * @param {{ propertyId: string, onClose: () => void }} props
 */
export function ReportListingDialog({ propertyId, onClose }) {
  const toast = useToast();
  const [reportProperty] = useReportPropertyMutation();
  const [failure, setFailure] = useState(null);
  const reasonErrorId = useId();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportSchema),
    mode: 'onTouched',
    defaultValues: { reason: '', details: '' },
  });

  const reason = useWatch({ control, name: 'reason' });
  const details = useWatch({ control, name: 'details' });

  async function onSubmit(values) {
    setFailure(null);
    try {
      await reportProperty({ propertyId, reason: values.reason, details: values.details }).unwrap();
      toast.show({ tone: 'success', message: text.sent });
      onClose();
    } catch (error) {
      if (toProblem(error).code === 'ReportErrors.DuplicateReport') {
        toast.show({ tone: 'warning', message: text.duplicate });
        onClose();
        return;
      }
      // 404 not public, 409 own listing, 429: the server message above the button.
      const { problem, formMessage } = applyServerErrors(error, setError, FIELD_NAMES);
      let requestId = null;
      if (problem.status >= 500) requestId = problem.requestId;
      setFailure({ message: formMessage, requestId });
    }
  }

  function close() {
    if (!isSubmitting) onClose();
  }

  let detailsNote = text.detailsOptional;
  if (reason === 'Other') detailsNote = text.detailsRequired;

  return (
    <Modal open onClose={close} title={text.dialogTitle}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-[18px]">
        <p className="text-[14px] leading-[1.78] text-text-secondary">{text.dialogIntro}</p>

        <fieldset
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={errors.reason ? reasonErrorId : undefined}
          className="flex flex-col gap-2"
        >
          <legend className="mb-2 text-[13.5px] leading-[1.72] font-semibold text-text">
            {text.reasonLabel}
          </legend>
          {REPORT_REASONS.map((value) => (
            <label
              key={value}
              className={clsx(
                'flex cursor-pointer items-center gap-2.5 rounded-md border px-3.5 py-2.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                reason === value && 'border-brand bg-brand-subtle',
                reason !== value && 'border-border hover:bg-inset',
              )}
            >
              <input
                type="radio"
                value={value}
                {...register('reason')}
                className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border-[1.4px] border-border-strong bg-bg checked:border-[5px] checked:border-brand focus-visible:outline-none"
              />
              <span
                className={clsx(
                  'text-[14px] leading-[1.72]',
                  reason === value ? 'font-semibold text-text' : 'text-text-secondary',
                )}
              >
                {REPORT_REASON_LABELS[value]}
              </span>
            </label>
          ))}
          {errors.reason && (
            <p id={reasonErrorId} className="text-caption text-danger">
              {errors.reason.message}
            </p>
          )}
        </fieldset>

        <div className="flex flex-col gap-1">
          <ListingTextarea
            label={`${text.detailsLabel} ${detailsNote}`}
            placeholder={text.detailsPlaceholder}
            maxLength={MAX_REPORT_DETAILS_LENGTH}
            rows={4}
            error={errors.details?.message}
            {...register('details')}
          />
          <p className="text-end text-[12px] leading-[1.78] text-muted" aria-live="polite">
            <span dir="ltr">{`${details.length} / ${MAX_REPORT_DETAILS_LENGTH}`}</span>
          </p>
        </div>

        {failure?.message && <FormAlert requestId={failure.requestId}>{failure.message}</FormAlert>}

        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            {ar.common.cancel}
          </Button>
          <Button type="submit" variant="danger" loading={isSubmitting} className="flex-1">
            {text.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
