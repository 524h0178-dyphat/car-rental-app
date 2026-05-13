import type { Location } from '@/types';

export function formatLocation(location: Location): string {
  if (location.display_name) return location.display_name;
  if (!location.name || location.name === location.province) return location.province;
  return `${location.name}, ${location.province}`;
}
