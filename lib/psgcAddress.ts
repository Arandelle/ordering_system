 export type PsgcOption = {
  code: string;
  name: string;
  regionCode?: string;
  cityCode?: string;
  cityMunicipalityCode?: string;
  municipalityCode?: string;
  subMunicipalityCode?: string;
};

export type PsgcAddressSelection = {
  city: string;
  cityCode?: string;
  province: string;
  region?: string;
  regionCode?: string;
  line2: string;
  barangayCode?: string;
  subMunicipality?: string;
  subMunicipalityCode?: string;
};

export type BarangayLabelInput = {
  name: string;
  subMunicipalityName?: string;
};

export const NCR_REGION = {
  code: "130000000",
  name: "National Capital Region",
  displayName: "Metro Manila",
} as const;

export const MANILA_CITY_CODE = "133900000";
const MANILA_SUB_MUNICIPALITY_CODE_PREFIX = MANILA_CITY_CODE.slice(0, 4);

const PSGC_API_BASE_URL = "https://psgc.gitlab.io/api";

export const normalizePsgcName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^city\s+of\s+/, "")
    .replace(/\s+city$/, "")
    .replace(/city\/municipality\s+of\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const findCityByName = (
  cities: PsgcOption[],
  value?: string,
): PsgcOption | undefined => {
  if (!value) return undefined;

  const normalizedValue = normalizePsgcName(value);
  return cities.find((city) => normalizePsgcName(city.name) === normalizedValue);
};

export const findManilaSubMunicipalityByName = (
  subMunicipalities: PsgcOption[],
  value?: string,
): PsgcOption | undefined => {
  if (!value) return undefined;

  const normalizedValue = normalizePsgcName(value);
  return subMunicipalities.find((subMunicipality) => {
    const normalizedName = normalizePsgcName(subMunicipality.name);
    return (
      normalizedName === normalizedValue ||
      normalizedName.includes(normalizedValue) ||
      normalizedValue.includes(normalizedName)
    );
  });
};

export const findBarangayByName = (
  barangays: PsgcOption[],
  value?: string,
): PsgcOption | undefined => {
  if (!value) return undefined;

  const normalizedValue = normalizePsgcName(value.replace(/^barangay\s+/i, ""));
  return barangays.find((barangay) => {
    const normalizedBarangay = normalizePsgcName(
      barangay.name.replace(/^barangay\s+/i, ""),
    );
    return normalizedBarangay === normalizedValue;
  });
};

export const buildBarangayLabel = ({
  name,
  subMunicipalityName,
}: BarangayLabelInput): string =>
  subMunicipalityName ? `${name}, ${subMunicipalityName}` : name;

// centralized function to handle fetching PSGC options with error handling
const fetchPsgcOptions = async (path: string): Promise<PsgcOption[]> => {
  const response = await fetch(`${PSGC_API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error("Unable to load address options. Please try again.");
  }

  return response.json() as Promise<PsgcOption[]>;
};

export const fetchNcrCities = (): Promise<PsgcOption[]> =>
  fetchPsgcOptions(`/regions/${NCR_REGION.code}/cities-municipalities/`);

// function to fetch Manila sub-municipalities with fallback to filtering all sub-municipalities if the specific endpoint fails
export const fetchManilaSubMunicipalities = async (): Promise<PsgcOption[]> => {
  try {
    return await fetchPsgcOptions(
      `/cities/${MANILA_CITY_CODE}/sub-municipalities/`,
    );
  } catch {
    const subMunicipalities = await fetchPsgcOptions("/sub-municipalities/");
    return subMunicipalities.filter(
      (subMunicipality) =>
        subMunicipality.cityCode === MANILA_CITY_CODE ||
        subMunicipality.cityMunicipalityCode === MANILA_CITY_CODE ||
        subMunicipality.municipalityCode === MANILA_CITY_CODE ||
        subMunicipality.code.startsWith(MANILA_SUB_MUNICIPALITY_CODE_PREFIX),
    );
  }
};

export const fetchCityBarangays = (cityCode: string): Promise<PsgcOption[]> =>
  fetchPsgcOptions(`/cities/${cityCode}/barangays/`);

export const fetchSubMunicipalityBarangays = async (
  cityCode: string,
  subMunicipalityCode?: string,
): Promise<PsgcOption[]> => {
  if (!subMunicipalityCode) {
    return fetchCityBarangays(cityCode);
  }

  try {
    return await fetchPsgcOptions(
      `/sub-municipalities/${subMunicipalityCode}/barangays/`,
    );
  } catch {
    const cityBarangays = await fetchCityBarangays(cityCode);
    return cityBarangays.filter(
      (barangay) => barangay.subMunicipalityCode === subMunicipalityCode,
    );
  }
};
