import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";

const supportedCountries = new Set<string>(getCountries());
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export const PHONE_COUNTRIES = getCountries().map((country) => ({
  country,
  name: countryNames.of(country) ?? country,
  callingCode: `+${getCountryCallingCode(country)}`,
})).sort((first, second) => first.name.localeCompare(second.name, "en"));

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
