export const LOCATION_IDS = ['tehran', 'yazd', 'tabriz'] as const;
export type LocationId = (typeof LOCATION_IDS)[number];

export const DEFAULT_LOCATION_ID: LocationId = 'tehran';

type TwelveMonths = readonly [
  number, number, number, number, number, number,
  number, number, number, number, number, number,
];

export interface Location {
  readonly id: LocationId;
  readonly name: string;
  /** Monthly average peak sun hours per day, January first. */
  readonly peakSunHours: TwelveMonths;
}

export const LOCATIONS: Readonly<Record<LocationId, Location>> = {
  tehran: {
    id: 'tehran',
    name: 'Tehran',
    peakSunHours: [3.6, 4.4, 5.1, 5.8, 6.9, 7.6, 7.4, 7.1, 6.4, 5.0, 3.8, 3.3],
  },
  yazd: {
    id: 'yazd',
    name: 'Yazd',
    peakSunHours: [4.2, 5.0, 5.7, 6.4, 7.4, 8.1, 7.9, 7.6, 6.9, 5.6, 4.4, 3.9],
  },
  tabriz: {
    id: 'tabriz',
    name: 'Tabriz',
    peakSunHours: [2.9, 3.7, 4.5, 5.2, 6.3, 7.1, 7.0, 6.6, 5.7, 4.2, 3.1, 2.6],
  },
};

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const DAYS_IN_MONTH: TwelveMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Inverter, soiling, wiring and temperature losses. */
export const SYSTEM_DERATE = 0.8;

/** Extra yield applied to bifacial modules, on top of the derate. */
export const BIFACIAL_FACTOR = 1.08;

/** Illustrative uplift for optimising tilt to the site's latitude. */
export const TILT_ADJUST_FACTOR = 1.05;

/** Illustrative grid intensity displaced per kWh generated. */
export const CO2_KG_PER_KWH = 0.5;

export const MODULE_COUNT_MIN = 1;
export const MODULE_COUNT_MAX = 1000;
export const DEFAULT_MODULE_COUNT = 100;
