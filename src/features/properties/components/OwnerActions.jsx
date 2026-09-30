import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { IconPause, IconTrash, IconWarning20 } from '../../../components/icons/index.js';
import { actionErrorMessage } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { useChangePropertyStateMutation, useDeletePropertyMutation } from '../propertiesApi.js';

const text = ar.ownerProperty;

const linkClasses =
  'inline-flex items-center justify-center rounded-md border border-border-strong bg-surface px-[15px] py-[7px] text-[13px] leading-[1.6] font-semibold text-text transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * The owner's buttons for one listing, by state (the project guide 6.8 "What the owner UI shows per
 * state"). Deactivate, mark sold / rented and delete go through ConfirmDialog; reactivate and
 * resubmit run at once. Not in Figma — Button and ConfirmDialog from the design system.
 *
 * @param {{
 *   property: import('../../../api/types.js').MyPropertyDetails,
 *   state: import('../listingState.js').OwnerState,
 * }} props
 */
export function OwnerActions({ property, state }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [changeState, { isLoading: isChanging }] = useChangePropertyStateMutation();
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();
  const [confirmAction, setConfirmAction] = useState(null);
  const [runningAction, setRunningAction] = useState(null);

  const isSoldOrRented = state === 'sold' || state === 'rented';
  const canEdit = !isSoldOrRented;
  const canDeactivate = property.isActive && state !== 'paused';
  const canReactivate = state === 'paused';
  const canResubmit = state === 'rejected';
  const canMarkSold = state === 'published' && property.propertyStatus === 'ForSale';
  const canMarkRented = state === 'published' && property.propertyStatus === 'ForRent';

  async function run(action) {
    setRunningAction(action);
    try {
      if (action === 'delete') {
        await deleteProperty(property.id).unwrap();
        toast.show({ tone: 'success', message: text.done.delete });
        navigate('/my-properties', { replace: true });
        return;
      }
      await changeState({ propertyId: property.id, action }).unwrap();
      toast.show({ tone: 'success', message: text.done[action] });
    } catch (error) {
      toast.show({ tone: 'error', message: actionErrorMessage(error) });
    } finally {
      setRunningAction(null);
      setConfirmAction(null);
    }
  }

  let dialog = null;
  if (confirmAction) dialog = text.confirm[confirmAction];

  let dialogTone = 'danger';
  let dialogIcon = IconTrash;
  if (confirmAction === 'deactivate') {
    dialogTone = 'warning';
    dialogIcon = IconPause;
  }
  if (confirmAction === 'mark-sold' || confirmAction === 'mark-rented') {
    dialogTone = 'warning';
    dialogIcon = IconWarning20;
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-raised p-4 xl:px-[21px] xl:py-5">
      <h2 className="text-[16px] leading-[1.72] font-bold text-text">{text.actionsTitle}</h2>
      <div className="flex flex-wrap gap-2.5">
        {canResubmit && (
          <Button
            size="sm"
            loading={runningAction === 'resubmit'}
            disabled={isChanging}
            onClick={() => run('resubmit')}
          >
            {text.resubmit}
          </Button>
        )}
        {canReactivate && (
          <Button
            size="sm"
            loading={runningAction === 'reactivate'}
            disabled={isChanging}
            onClick={() => run('reactivate')}
          >
            {text.reactivate}
          </Button>
        )}
        {canEdit && (
          <Link to={`/my-properties/${property.id}/edit`} className={linkClasses}>
            {text.editDetails}
          </Link>
        )}
        {state === 'published' && (
          <Link to={`/properties/${property.id}`} className={linkClasses}>
            {text.viewPublic}
          </Link>
        )}
        {canMarkSold && (
          <Button size="sm" variant="secondary" onClick={() => setConfirmAction('mark-sold')}>
            {text.markSold}
          </Button>
        )}
        {canMarkRented && (
          <Button size="sm" variant="secondary" onClick={() => setConfirmAction('mark-rented')}>
            {text.markRented}
          </Button>
        )}
        {canDeactivate && (
          <Button size="sm" variant="secondary" onClick={() => setConfirmAction('deactivate')}>
            {text.deactivate}
          </Button>
        )}
        <Button size="sm" variant="danger" onClick={() => setConfirmAction('delete')}>
          {text.delete}
        </Button>
      </div>

      <ConfirmDialog
        open={dialog !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => run(confirmAction)}
        title={dialog?.title ?? ''}
        description={dialog?.description ?? ''}
        confirmLabel={dialog?.confirm ?? ''}
        tone={dialogTone}
        icon={dialogIcon}
        loading={isChanging || isDeleting}
      />
    </section>
  );
}
