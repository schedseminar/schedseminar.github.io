export const CONTINENT_BORDER_MAP = {
  europe: 'border-yellow-400',
  asia: 'border-blue-400',
  america: 'border-orange-400',
};

export const TIME_ZONES = [
  { city: 'UTC', icon: '🌍', border: 'border-gray-200' },
  { city: 'Prague', icon: '🇨🇿', border: 'border-yellow-400' },
  { city: 'New York', icon: '🇺🇸', border: 'border-orange-400' },
  { city: 'Shanghai', icon: '🇨🇳', border: 'border-blue-400' }
];

// ===== shared/utils.ts =====
// Shared utility functions
export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function getBorderClass(continent) {
  return CONTINENT_BORDER_MAP[continent?.toLowerCase()] || 'border-gray-300';
}