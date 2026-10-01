import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { IconWarning20 } from '../../../components/icons/index.js';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { ar } from '../../../locales/ar.js';
import { ListingDataFields } from '../components/ListingDataFields.jsx';
import { ListingLocationFields } from '../components/ListingLocationFields.jsx';
import { OwnerLoadError } from '../components/OwnerLoadError.jsx';
import { ownerStateOf } from '../listingState.js';
import {
  useGetMyPropertiesQuery,
  useGetMyPropertyQuery,
  useUpdatePropertyDescriptionMutation,
  useUpdatePropertyDetailsMutation,
} from '../propertiesApi.js';
import {
  detailsRequest,
  editListingSchema,
  EMPTY_LISTING_FORM,
  listingFormValues,
} from '../schemas.js';

const text = ar.listing;
const FIELD_NAMES = Object.keys(EMPTY_LISTING_FORM);
const DETAIL_FIELDS = Object.keys(detailsRequest(EMPTY_LISTING_FORM));

const cardClasses =
  'flex flex-col gap-[18px] rounded-lg border border-border bg-raised p-4 xl:px-[25px] xl:py-[23px]';

/**
 * Edit details + description of an owned listing (not in Figma — the create wizard's fields
 * on one page). Only what changed is sent: PUT /details sends the listing back to review (a
 * published one is confirmed first), PUT /description does not.
 */
export default function EditPropertyPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: property, isLoading, error, refetch } = useGetMyPropertyQuery(propertyId);
  const { data: myProperties } = useGetMyPropertiesQuery();
  const [updateDetails] = useUpdatePropertyDetailsMutation();
  const [updateDescription] = useUpdatePropertyDescriptionMutation();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(editListingSchema),
    mode: 'onTouched',
    defaultValues: EMPTY_LISTING_FORM,
  });
  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] });
  const [formMessage, setFormMessage] = useState(null);
  const [valuesToConfirm, setValuesToConfirm] = useState(null);

  useEffect(() => {
    if (property) reset(listingFormValues(property));
  }, [property, reset]);

  let state = null;
  if (property) state = ownerStateOf(property);

  async function save(values) {
    setValuesToConfirm(null);
    setFormMessage(null);
    const detailsChanged = DETAIL_FIELDS.some((field) => dirtyFields[field]);
    try {
      if (detailsChanged) {
        await updateDetails({ propertyId, ...detailsRequest(values) }).unwrap();
      }
      if (dirtyFields.description) {
        await updateDescription({ propertyId, description: values.description }).unwrap();
      }
      let message = text.changesSaved;
      if (detailsChanged) message = text.changesSavedReview;
      toast.show({ tone: 'success', message });
      navigate(`/my-properties/${propertyId}`);
    } catch (saveError) {
      const { formMessage: message } = applyServerErrors(saveError, setError, FIELD_NAMES);
      setFormMessage(message);
    }
  }

  function handleValid(values) {
    const detailsChanged = DETAIL_FIELDS.some((field) => dirtyFields[field]);
    if (!detailsChanged && !dirtyFields.description) {
      setFormMessage(text.noChanges);
      return;
    }
    // A published listing leaves the search until it is approved again: ask first.
    if (detailsChanged && state === 'published') {
      setValuesToConfirm(values);
      return;
    }
    save(values);
  }

  let content;
  if (isLoading) {
    content = <Skeleton className="h-[520px] rounded-lg" />;
  } else if (error) {
    content = <OwnerLoadError error={error} onRetry={refetch} />;
  } else if (state === 'sold' || state === 'rented') {
    content = <FormAlert tone="info">{ar.ownerProperty.soldNote}</FormAlert>;
  } else {
    content = (
      <>
        <form
          noValidate
          onSubmit={handleSubmit(handleValid)}
          className="flex flex-col gap-4 xl:gap-5"
        >
          <section className={cardClasses}>
            <h2 className="text-[16px] leading-[1.72] font-bold text-text xl:text-[18px]">
              {text.dataTitle}
            </h2>
            <ListingDataFields
              register={register}
              control={control}
              errors={errors}
              showPurpose={false}
            />
            <p className="text-caption text-muted">{text.purposeLocked}</p>
          </section>
          <section className={cardClasses}>
            <h2 className="text-[16px] leading-[1.72] font-bold text-text xl:text-[18px]">
              {text.locationTitle}
            </h2>
            <ListingLocationFields
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
              getValues={getValues}
              latitude={latitude}
              longitude={longitude}
            />
          </section>
          {formMessage && <FormAlert>{formMessage}</FormAlert>}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={isSubmitting}>
              {text.saveChanges}
            </Button>
            <Link
              to={`/my-properties/${propertyId}`}
              className="rounded-md px-4 py-[11px] text-[15px] leading-[1.6] font-semibold text-text-secondary hover:bg-inset focus-visible:outline-2 focus-visible:outline-brand"
            >
              {ar.common.cancel}
            </Link>
          </div>
        </form>
        <ConfirmDialog
          open={valuesToConfirm !== null}
          onClose={() => setValuesToConfirm(null)}
          onConfirm={() => save(valuesToConfirm)}
          tone="warning"
          icon={IconWarning20}
          title={text.confirmEditApproved.title}
          description={text.confirmEditApproved.description}
          confirmLabel={text.confirmEditApproved.confirm}
          loading={isSubmitting}
        />
      </>
    );
  }

  return (
    <>
      <PageTopBar title={text.editTitle} backTo={`/my-properties/${propertyId}`} />
      <AccountShell listingsCount={myProperties?.length}>
        <div className="hidden flex-col gap-0.5 xl:flex">
          <h1 className="text-[25px] leading-[1.72] font-bold text-text">{text.editTitle}</h1>
          <p className="text-[13.5px] leading-[1.72] text-text-secondary">{text.editSubtitle}</p>
        </div>
        <p className="text-[13px] leading-[1.72] text-text-secondary xl:hidden">
          {text.editSubtitle}
        </p>
        {content}
      </AccountShell>
    </>
  );
}
