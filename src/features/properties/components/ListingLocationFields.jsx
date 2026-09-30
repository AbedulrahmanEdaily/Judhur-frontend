import { IconNoteInfo } from '../../../components/icons/index.js';
import { toLatinDigits } from '../../../lib/digits.js';
import { reverseGeocode } from '../../../lib/maps/geocoding.js';
import { LocationPicker } from '../../../lib/maps/LocationPicker.jsx';
import { ar } from '../../../locales/ar.js';
import { CITIES, LAND_CLASSIFICATIONS, LEGAL_STATUS_LABELS, LEGAL_STATUSES } from '../constants.js';
import { ListingInput } from './ListingInput.jsx';
import { ListingSelect } from './ListingSelect.jsx';

const text = ar.listing;

const cityOptions = CITIES.map((city) => ({ value: city, label: city }));
const landOptions = LAND_CLASSIFICATIONS.map((landClass) => ({
  value: landClass,
  label: ar.property.landTitles[landClass],
}));
const legalOptions = LEGAL_STATUSES.map((status) => ({
  value: status,
  label: LEGAL_STATUS_LABELS[status],
}));

const setOptions = { shouldValidate: true, shouldDirty: true };

/** A typed coordinate → a number, or null while it is empty or not a number yet. */
function readCoordinate(value) {
  const number = Number(toLatinDigits(String(value ?? '')).trim());
  if (value === '' || !Number.isFinite(number)) return null;
  return number;
}

/**
 * Figma "الموقع والتصنيف القانوني" (91:1945): city | area; land class | document; the (ج) note;
 * the map. «العنوان الكامل» and the two coordinate fields are not in Figma — the API requires
 * them, and the fields keep the form usable without a map. A tap on the map fills the
 * coordinates and suggests the address, city and area (never over what the user typed).
 *
 * @param {{
 *   register: import('react-hook-form').UseFormRegister<any>,
 *   errors: import('react-hook-form').FieldErrors<any>,
 *   setValue: import('react-hook-form').UseFormSetValue<any>,
 *   getValues: import('react-hook-form').UseFormGetValues<any>,
 *   latitude: string,
 *   longitude: string,
 * }} props
 */
export function ListingLocationFields({
  register,
  errors,
  setValue,
  getValues,
  latitude,
  longitude,
}) {
  async function handlePick(point) {
    setValue('latitude', point.latitude.toFixed(6), setOptions);
    setValue('longitude', point.longitude.toFixed(6), setOptions);

    const address = await reverseGeocode(point);
    if (!address) return;
    if (!getValues('fullAddress') && address.label) {
      setValue('fullAddress', address.label, setOptions);
    }
    if (!getValues('city') && CITIES.includes(address.city)) {
      setValue('city', address.city, setOptions);
    }
    if (!getValues('region') && address.district) {
      setValue('region', address.district, setOptions);
    }
  }

  return (
    <>
      <div className="flex gap-3 xl:gap-3.5">
        <ListingSelect
          className="flex-1"
          label={text.city}
          placeholder={text.choose}
          options={cityOptions}
          error={errors.city?.message}
          {...register('city')}
        />
        <ListingInput
          className="flex-1"
          label={text.region}
          placeholder={text.regionPlaceholder}
          maxLength={100}
          error={errors.region?.message}
          {...register('region')}
        />
      </div>
      <div className="flex flex-col gap-[18px] sm:flex-row sm:gap-3 xl:gap-3.5">
        <ListingSelect
          className="flex-1"
          label={text.landClassification}
          placeholder={text.choose}
          options={landOptions}
          error={errors.landClassification?.message}
          {...register('landClassification')}
        />
        <ListingSelect
          className="flex-1"
          label={text.legalStatus}
          placeholder={text.choose}
          options={legalOptions}
          error={errors.legalStatus?.message}
          {...register('legalStatus')}
        />
      </div>
      <p className="flex gap-2.5 rounded-md bg-inset px-4 py-3.5 text-[12.5px] leading-[1.72] text-text-secondary">
        <IconNoteInfo className="mt-0.5 shrink-0 text-muted" />
        {text.classCNote}
      </p>
      <ListingInput
        label={text.fullAddress}
        placeholder={text.fullAddressPlaceholder}
        maxLength={500}
        error={errors.fullAddress?.message}
        {...register('fullAddress')}
      />
      <LocationPicker
        latitude={readCoordinate(latitude)}
        longitude={readCoordinate(longitude)}
        onPick={handlePick}
      />
      <div className="flex gap-3 xl:gap-3.5">
        <ListingInput
          className="flex-1"
          label={text.latitude}
          inputMode="decimal"
          dir="ltr"
          error={errors.latitude?.message}
          {...register('latitude')}
        />
        <ListingInput
          className="flex-1"
          label={text.longitude}
          inputMode="decimal"
          dir="ltr"
          error={errors.longitude?.message}
          {...register('longitude')}
        />
      </div>
    </>
  );
}
