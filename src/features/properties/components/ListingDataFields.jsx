import { CURRENCY_SYMBOL } from '../../../lib/format.js';
import { ar } from '../../../locales/ar.js';
import {
  LISTING_STATUSES,
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
} from '../constants.js';
import { ListingInput } from './ListingInput.jsx';
import { ListingSelect } from './ListingSelect.jsx';
import { ListingTextarea } from './ListingTextarea.jsx';

const text = ar.listing;

const typeOptions = PROPERTY_TYPES.map((type) => ({
  value: type,
  label: PROPERTY_TYPE_LABELS[type],
}));
const purposeOptions = LISTING_STATUSES.map((status) => ({
  value: status,
  label: PROPERTY_STATUS_LABELS[status],
}));
const paymentOptions = PAYMENT_TYPES.map((type) => ({
  value: type,
  label: PAYMENT_TYPE_LABELS[type],
}));

/**
 * Figma "بيانات العقار الأساسية" (77:1237): title; type | purpose; area | price; description.
 * «طريقة الدفع» is not in Figma — the API requires it. The edit page hides the purpose (it
 * cannot change after create) and puts the payment type in its place.
 *
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<any>,
 *   errors: import('react-hook-form').FieldErrors<any>,
 *   showPurpose?: boolean,
 * }} props
 */
export function ListingDataFields({ register, errors, showPurpose = true }) {
  const paymentField = (
    <ListingSelect
      className="flex-1"
      label={text.paymentType}
      placeholder={text.choose}
      options={paymentOptions}
      error={errors.paymentType?.message}
      {...register('paymentType')}
    />
  );

  return (
    <>
      <ListingInput
        label={text.titleLabel}
        placeholder={text.titlePlaceholder}
        maxLength={200}
        error={errors.title?.message}
        {...register('title')}
      />
      <div className="flex gap-3 xl:gap-3.5">
        <ListingSelect
          className="flex-1"
          label={text.propertyType}
          placeholder={text.choose}
          options={typeOptions}
          error={errors.propertyType?.message}
          {...register('propertyType')}
        />
        {showPurpose && (
          <ListingSelect
            className="flex-1"
            label={text.purpose}
            options={purposeOptions}
            error={errors.propertyStatus?.message}
            {...register('propertyStatus')}
          />
        )}
        {!showPurpose && paymentField}
      </div>
      <div className="flex gap-3 xl:gap-3.5">
        <ListingInput
          className="flex-1"
          label={text.area}
          inputMode="decimal"
          suffix="م²"
          error={errors.area?.message}
          {...register('area')}
        />
        <ListingInput
          className="flex-1"
          label={text.price}
          inputMode="decimal"
          suffix={CURRENCY_SYMBOL}
          error={errors.price?.message}
          {...register('price')}
        />
      </div>
      {showPurpose && paymentField}
      <ListingTextarea
        label={text.description}
        placeholder={text.descriptionPlaceholder}
        maxLength={2000}
        error={errors.description?.message}
        {...register('description')}
      />
    </>
  );
}
