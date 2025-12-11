export const CONTINENT_BORDER_MAP = {
  europe: 'border-yellow-400',
  asia: 'border-blue-400',
  america: 'border-orange-400',
};

export const CONTINENT_BG_MAP = {
  europe: 'text-yellow-400',
  asia: 'text-blue-400',
  america: 'text-orange-400',
};

export const TIME_ZONES = [
  { city: 'UTC', icon: '🌍', border: 'border-gray-200' },
  { city: 'Prague', icon: '🇨🇿', border: 'border-yellow-400' },
  { city: 'New York', icon: '🇺🇸', border: 'border-orange-400' },
  { city: 'Shanghai', icon: '🇨🇳', border: 'border-blue-400' }
];

export function getSeasonColor (dateString) {
  const date = new Date(dateString);
  const month = date.getMonth(); // 0 is January, 11 is December

  // Spring: March (2) to May (4)
  if (month >= 2 && month <= 4) return 'text-green-600';
  // Summer: June (5) to August (7)
  if (month >= 5 && month <= 7) return 'text-orange-500';
  // Autumn: September (8) to November (10)
  if (month >= 8 && month <= 10) return 'text-amber-700';
  // Winter: December (11), January (0), February (1)
  return 'text-blue-600';
}


// Shared utility functions
export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function getBorderClass(continent) {
  return CONTINENT_BORDER_MAP[continent?.toLowerCase()] || 'border-gray-300';
}

export function getColor(continent) {
  return CONTINENT_BG_MAP[continent?.toLowerCase()] || 'gray-300';
}