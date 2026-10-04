import { useEffect, useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router';
import { IconBackChevron } from '../../../components/icons/index.js';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { useToast } from '../../../components/ui/useToast.js';
import { FormAlert } from '../../../components/form/FormAlert.jsx';
import { applyServerErrors } from '../../../components/form/applyServerErrors.js';
import { ar } from '../../../locales/ar.js';
import { DocumentUploader } from '../components/DocumentUploader.jsx';
import { ImagesManager } from '../components/ImagesManager.jsx';
import { ListingDataFields } from '../components/ListingDataFields.jsx';
import { ListingLocationFields } from '../components/ListingLocationFields.jsx';
import { ListingStepper } from '../components/ListingStepper.jsx';
import { ListingSummary } from '../components/ListingSummary.jsx';
import { OwnerLoadError } from '../components/OwnerLoadError.jsx';
import { OwnershipDeclarations } from '../components/OwnershipDeclarations.jsx';
import { SubmittedCard } from '../components/SubmittedCard.jsx';
import { WizardActions } from '../components/WizardActions.jsx';
import { MIN_IMAGES } from '../constants.js';
import { readinessOf } from '../listingState.js';
import {
  useCreatePropertyMutation,
  useGetMyPropertyQuery,
  useUpdatePropertyDescriptionMutation,
  useUpdatePropertyDetailsMutation,
} from '../propertiesApi.js';
import {
  DATA_STEP_FIELDS,
  detailsRequest,
  EMPTY_LISTING_FORM,
  listingFormValues,
  LISTING_SERVER_KEY_FIELDS,
  listingSchema,
} from '../schemas.js';

const text = ar.listing;
const FIELD_NAMES = Object.keys(EMPTY_LISTING_FORM);
const NO_DECLARATIONS = [false, false, false];

const cardClasses =
  'flex flex-col gap-[18px] xl:rounded-lg xl:border xl:border-border xl:bg-raised xl:px-[25px] xl:py-[23px]';

/** `?step=` as 1–5 (5 = sent). Steps 3+ need the listing, so they need `?id=`. */
function readStep(searchParams, propertyId) {
  const step = Number(searchParams.get('step'));
  if (!Number.isInteger(step) || step < 1 || step > 5) return 1;
  if (!propertyId && step > 2) return 1;
  return step;
}

/**
 * Figma "أضف عقار" 1–4 + «تم الإرسال» (77:1136, 91:1902, 91:1991, 91:2080, 91:2169) and the
 * mobile frame (84:664). The listing is created when «الموقع» is done (the API takes all the
 * data at once); images and the document need its id, so they come after. The step and the id
 * live in the URL, so a reload keeps the place. There is no "send" call: a Pending listing
 * reaches the admin queue by itself once it has 3 images, a cover and the document.
 */
export default function CreatePropertyPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const propertyId = searchParams.get('id');
  const step = readStep(searchParams, propertyId);
  const formId = useId();

  const {
    data: property,
    error: loadError,
    isLoading: isLoadingProperty,
    refetch,
  } = useGetMyPropertyQuery(propertyId, { skip: !propertyId });
  const [createProperty] = useCreatePropertyMutation();
  const [updateDetails] = useUpdatePropertyDetailsMutation();
  const [updateDescription] = useUpdatePropertyDescriptionMutation();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: zodResolver(listingSchema),
    mode: 'onTouched',
    defaultValues: EMPTY_LISTING_FORM,
  });
  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] });
  const [formMessage, setFormMessage] = useState(null);
  const [stepMessage, setStepMessage] = useState(null);
  const [declarations, setDeclarations] = useState(NO_DECLARATIONS);

  // Coming back to «البيانات» or «الموقع» after create: the form shows what is saved.
  useEffect(() => {
    if (property) reset(listingFormValues(property));
  }, [property, reset]);

  function goToStep(next, id = propertyId) {
    const params = new URLSearchParams();
    if (id) params.set('id', id);
    if (next > 1) params.set('step', String(next));
    setSearchParams(params);
    setStepMessage(null);
    window.scrollTo({ top: 0 });
  }

  function goBack() {
    if (step > 1 && step < 5) goToStep(step - 1);
    else if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  }

  async function saveListing(values) {
    setFormMessage(null);
    try {
      if (!propertyId) {
        const created = await createProperty(values).unwrap();
        goToStep(3, created.id);
        return;
      }
      // Only send what changed: a details update sends the listing back to review.
      const details = detailsRequest(values);
      const detailsChanged = Object.keys(details).some((field) => dirtyFields[field]);
      if (detailsChanged) await updateDetails({ propertyId, ...details }).unwrap();
      if (dirtyFields.description) {
        await updateDescription({ propertyId, description: values.description }).unwrap();
      }
      goToStep(3);
    } catch (error) {
      const { problem, formMessage: message } = applyServerErrors(
        error,
        setError,
        FIELD_NAMES,
        LISTING_SERVER_KEY_FIELDS,
      );
      setFormMessage(message);
      const fieldsWithErrors = Object.keys(problem.fieldErrors);
      for (const code of Object.keys(problem.errorCodes)) {
        if (LISTING_SERVER_KEY_FIELDS[code]) fieldsWithErrors.push(LISTING_SERVER_KEY_FIELDS[code]);
      }
      if (fieldsWithErrors.some((field) => DATA_STEP_FIELDS.includes(field))) goToStep(1);
    }
  }

  function handleInvalid(fieldErrors) {
    if (Object.keys(fieldErrors).some((field) => DATA_STEP_FIELDS.includes(field))) goToStep(1);
  }

  async function handleNext(event) {
    event.preventDefault();
    if (step === 1) {
      const isValid = await trigger(DATA_STEP_FIELDS);
      if (isValid) goToStep(2);
      return;
    }
    if (step === 2) {
      await handleSubmit(saveListing, handleInvalid)();
      return;
    }

    // Steps 3–4 work on the saved listing; wait until it is loaded.
    if (!property) return;
    const readiness = readinessOf(property);
    if (step === 3) {
      if (!readiness.hasEnoughImages || !readiness.hasMainImage) {
        setStepMessage(text.needImages(MIN_IMAGES));
        return;
      }
      goToStep(4);
      return;
    }
    if (!readiness.hasEnoughImages || !readiness.hasMainImage) {
      goToStep(3);
      return;
    }
    if (!readiness.hasDocument) {
      setStepMessage(text.needDocument);
      return;
    }
    if (declarations.includes(false)) {
      setStepMessage(text.needDeclarations);
      return;
    }
    goToStep(5);
  }

  function handleSaveDraft() {
    toast.show({ tone: 'success', message: text.draftSaved });
    navigate(`/my-properties/${propertyId}`);
  }

  function handleAddAnother() {
    reset(EMPTY_LISTING_FORM);
    setDeclarations(NO_DECLARATIONS);
    setFormMessage(null);
    goToStep(1, null);
  }

  // Steps 1–2 are form fields. Steps 3–4 upload right away and have their own dialogs (each with
  // a <form>), so they sit outside the wizard form; the buttons reach it through `form=`.
  let formContent = null;
  let mediaContent = null;
  if (propertyId && loadError) {
    mediaContent = <OwnerLoadError error={loadError} onRetry={refetch} />;
  } else if (propertyId && isLoadingProperty) {
    mediaContent = <Skeleton className="h-[420px] rounded-lg" />;
  } else if (step === 1) {
    formContent = (
      <section className={cardClasses}>
        <h2 className="text-[16px] leading-[1.72] font-bold text-text xl:text-[18px]">
          {text.dataTitle}
        </h2>
        {/* Once the listing exists the purpose is fixed: PUT /details has no propertyStatus. */}
        <ListingDataFields
          register={register}
          control={control}
          errors={errors}
          showPurpose={!propertyId}
        />
        {propertyId && <p className="text-caption text-muted">{text.purposeLocked}</p>}
      </section>
    );
  } else if (step === 2) {
    formContent = (
      <section className={cardClasses}>
        <div className="flex flex-col gap-[3px]">
          <h2 className="text-[16px] leading-[1.72] font-bold text-text xl:text-[18px]">
            {text.locationTitle}
          </h2>
          <p className="text-[13px] leading-[1.72] text-muted">{text.locationSubtitle}</p>
        </div>
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
    );
  } else if (step === 3) {
    mediaContent = (
      <ImagesManager propertyId={propertyId} images={property.images} message={stepMessage} />
    );
  } else if (step === 4) {
    mediaContent = (
      <>
        <DocumentUploader propertyId={propertyId} hasDocument={property.hasOwnershipDocument} />
        <OwnershipDeclarations
          checked={declarations}
          onChange={(next) => {
            setDeclarations(next);
            setStepMessage(null);
          }}
        />
        <ListingSummary property={property} />
        {stepMessage && <FormAlert>{stepMessage}</FormAlert>}
      </>
    );
  }

  let primaryLabel = text.submit;
  if (step < 4) primaryLabel = text.nextTo(text.steps[step]);

  let onSaveDraft;
  if (propertyId && step >= 3) onSaveDraft = handleSaveDraft;

  const isSent = step === 5 && property;

  return (
    <div className="min-h-full bg-surface">
      {/* Mobile top bar (84:669): back, then the title. */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border border-border bg-bg px-[17px] pt-[9px] pb-[11px] xl:hidden">
        <button
          type="button"
          onClick={goBack}
          aria-label={text.back}
          className="rounded-sm text-text focus-visible:outline-2 focus-visible:outline-brand"
        >
          <IconBackChevron />
        </button>
        <h1 className="text-[16px] leading-[1.72] font-bold text-text">{text.mobileTitle}</h1>
      </header>

      <div className="mx-auto flex w-full max-w-[840px] flex-col gap-4 px-4 pt-4 pb-32 xl:gap-6 xl:px-0 xl:pt-[30px] xl:pb-[60px]">
        {isSent && <SubmittedCard title={property.title} onAddAnother={handleAddAnother} />}

        {!isSent && (
          <>
            <div className="hidden flex-col gap-1 xl:flex">
              <h1 className="text-[26px] leading-[1.72] font-bold text-text">{text.pageTitle}</h1>
              <p className="text-[14px] leading-[1.72] text-text-secondary">{text.pageSubtitle}</p>
            </div>
            <ListingStepper current={Math.min(step, 4)} onStepClick={goToStep} />
            <form id={formId} noValidate onSubmit={handleNext} className="contents">
              {formContent}
            </form>
            {mediaContent}
            {formMessage && <FormAlert>{formMessage}</FormAlert>}
            <WizardActions
              formId={formId}
              step={Math.min(step, 4)}
              primaryLabel={primaryLabel}
              isBusy={isSubmitting}
              onSaveDraft={onSaveDraft}
            />
          </>
        )}
      </div>
    </div>
  );
}
