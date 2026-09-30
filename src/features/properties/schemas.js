import { z } from 'zod';
import { toLatinDigits } from '../../lib/digits.js';
import { formatNumber } from '../../lib/format.js';
import { ar } from '../../locales/ar.js';
import {
  CITIES,
  LAND_CLASSIFICATIONS,
  LEGAL_STATUSES,
  LISTING_STATUSES,
  PAYMENT_TYPES,
  PROPERTY_TYPES,
} from './constants.js';

// Mirrors the backend rules of POST /User/Properties (CLAUDE.md 6.6). The server stays the
// authority. Form values are strings (what the inputs hold); the parsed output is the request.

const messages = ar.listing.validation;

function requiredText(max) {
  return z.string().trim().min(1, messages.required).max(max, messages.maxLength(max));
}

/** Empty → null, as the API wants for optional text. */
function optionalText(max) {
  return z
    .string()
    .trim()
    .max(max, messages.maxLength(max))
    .transform((value) => (value === '' ? null : value));
}

/** "45,000" or "٤٥٠٠٠" → 45000, and it must be above zero. */
const positiveNumber = z
  .string()
  .trim()
  .min(1, messages.required)
  .transform((value) => Number(toLatinDigits(value).replace(/[,\s]/g, '')))
  .pipe(z.number(messages.number).positive(messages.positive));

function coordinate(min, max) {
  return z
    .string()
    .trim()
    .min(1, messages.location)
    .transform((value) => Number(toLatinDigits(value)))
    .pipe(z.number(messages.location).min(min, messages.location).max(max, messages.location));
}

function oneOf(values) {
  return z.enum(values, messages.required);
}

export const listingSchema = z.object({
  title: requiredText(200),
  propertyType: oneOf(PROPERTY_TYPES),
  propertyStatus: oneOf(LISTING_STATUSES),
  area: positiveNumber,
  price: positiveNumber,
  paymentType: oneOf(PAYMENT_TYPES),
  description: optionalText(2000),
  city: oneOf(CITIES),
  region: optionalText(100),
  fullAddress: requiredText(500),
  landClassification: oneOf(LAND_CLASSIFICATIONS),
  legalStatus: oneOf(LEGAL_STATUSES),
  latitude: coordinate(-90, 90),
  longitude: coordinate(-180, 180),
});

/** The edit page: the purpose cannot change after create (PUT /details has no propertyStatus). */
export const editListingSchema = listingSchema.omit({ propertyStatus: true });

/** The fields of the wizard's first step («البيانات»); the rest belong to «الموقع». */
export const DATA_STEP_FIELDS = [
  'title',
  'propertyType',
  'propertyStatus',
  'area',
  'price',
  'paymentType',
  'description',
];

export const EMPTY_LISTING_FORM = {
  title: '',
  propertyType: '',
  propertyStatus: 'ForSale',
  area: '',
  price: '',
  paymentType: '',
  description: '',
  city: '',
  region: '',
  fullAddress: '',
  landClassification: '',
  legalStatus: '',
  latitude: '',
  longitude: '',
};

/**
 * A saved listing → form values (strings), to pre-fill the edit form.
 * @param {import('../../api/types.js').MyPropertyDetails} property
 */
export function listingFormValues(property) {
  return {
    title: property.title,
    propertyType: property.propertyType,
    propertyStatus: property.propertyStatus,
    area: formatNumber(property.area),
    price: formatNumber(property.price),
    paymentType: property.paymentType,
    description: property.description ?? '',
    city: property.city,
    region: property.region ?? '',
    fullAddress: property.fullAddress,
    landClassification: property.landClassification,
    legalStatus: property.legalStatus,
    latitude: String(property.latitude),
    longitude: String(property.longitude),
  };
}

/**
 * The parsed form → the body of PUT /{id}/details (no description, no propertyStatus).
 * @param {z.infer<typeof listingSchema>} values
 */
export function detailsRequest(values) {
  return {
    title: values.title,
    price: values.price,
    paymentType: values.paymentType,
    propertyType: values.propertyType,
    area: values.area,
    city: values.city,
    region: values.region,
    fullAddress: values.fullAddress,
    latitude: values.latitude,
    longitude: values.longitude,
    landClassification: values.landClassification,
    legalStatus: values.legalStatus,
  };
}
