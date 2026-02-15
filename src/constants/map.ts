import { MapVisualType } from '../types';

export const SHEET_COLLAPSED = 70;
export const SHEET_EXPANDED_RATIO = 0.82;
export const PIN_ZOOM_THRESHOLD = 0.12;

export const MAP_TYPE_OPTIONS: { key: MapVisualType; label: string }[] = [
  { key: 'standard', label: 'Map' },
  { key: 'satellite', label: 'Satellite' },
];
