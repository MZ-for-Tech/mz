import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";

const supportedCountries = new Set<string>(getCountries());

export { default as PHONE_COUNTRIES } from "./phoneCountries.json";

export function normalizeContactPhone(country: string, nationalNumber: string) {
  if (!supportedCountries.has(country) || nationalNumber.length > 32 ||
    !/^[0-9 ()-]+$/.test(nationalNumber)) return null;

  const phone = parsePhoneNumberFromString(nationalNumber, {
    defaultCountry: country as CountryCode,
    extract: false,
  });
  if (!phone?.isPossible() || phone.countryCallingCode !== getCountryCallingCode(country as CountryCode)) return null;
  return phone.number;
}
