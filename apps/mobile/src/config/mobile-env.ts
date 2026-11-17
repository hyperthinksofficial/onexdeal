import { DEFAULT_SEARCH_RADIUS_KM, SEARCH_RADIUS_KM_OPTIONS } from '@onexdeal/types';
import { HOSUR_DEFAULT_LOCALITY } from '@onexdeal/utils';

export interface MobileRuntimeConfig {
  readonly appName: string;
  readonly defaultLocalityName: string;
  readonly defaultDistrict: string;
  readonly defaultState: string;
  readonly defaultPincode: string;
  readonly defaultSearchRadiusKm: number;
  readonly allowedRadiiKm: readonly number[];
}

export function getMobileRuntimeConfig(): MobileRuntimeConfig {
  return {
    appName: 'OneXDeal',
    defaultLocalityName: HOSUR_DEFAULT_LOCALITY.name,
    defaultDistrict: HOSUR_DEFAULT_LOCALITY.district,
    defaultState: HOSUR_DEFAULT_LOCALITY.state,
    defaultPincode: HOSUR_DEFAULT_LOCALITY.pincode,
    defaultSearchRadiusKm: DEFAULT_SEARCH_RADIUS_KM,
    allowedRadiiKm: SEARCH_RADIUS_KM_OPTIONS,
  };
}
