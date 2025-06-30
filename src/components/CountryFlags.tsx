import React from 'react';

// Country flags mapping using real country codes and flag emojis
export const countryFlags: Record<string, string> = {
  'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿',
  'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'NL': '🇳🇱',
  'BE': '🇧🇪', 'PT': '🇵🇹', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪',
  'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IE': '🇮🇪', 'PL': '🇵🇱',
  'RU': '🇷🇺', 'UA': '🇺🇦', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'GR': '🇬🇷',
  'TR': '🇹🇷', 'RO': '🇷🇴', 'BG': '🇧🇬', 'HR': '🇭🇷', 'RS': '🇷🇸',
  'SK': '🇸🇰', 'SI': '🇸🇮', 'EE': '🇪🇪', 'LV': '🇱🇻', 'LT': '🇱🇹',
  'BY': '🇧🇾', 'MD': '🇲🇩', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳',
  'HK': '🇭🇰', 'TW': '🇹🇼', 'SG': '🇸🇬', 'MY': '🇲🇾', 'TH': '🇹🇭',
  'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'IN': '🇮🇳', 'BR': '🇧🇷',
  'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪',
  'VE': '🇻🇪', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'MA': '🇲🇦', 'NG': '🇳🇬',
  'KE': '🇰🇪', 'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'QA': '🇶🇦'
};

// Language flags mapping
export const languageFlags: Record<string, string> = {
  'en': '🇺🇸',
  'tr': '🇹🇷',
  'es': '🇪🇸',
  'fr': '🇫🇷',
  'de': '🇩🇪',
  'pt': '🇵🇹',
  'it': '🇮🇹',
  'ru': '🇷🇺',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'zh': '🇨🇳',
  'ar': '🇸🇦',
  'hi': '🇮🇳'
};

export function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return '🌍';
  return countryFlags[countryCode] || '🌍';
}

export function getLanguageFlag(languageCode?: string): string {
  if (!languageCode) return '🌍';
  return languageFlags[languageCode] || '🌍';
}

// Flag component for consistent rendering
export function CountryFlag({ countryCode, size = 'md' }: { countryCode?: string, size?: 'sm' | 'md' | 'lg' }) {
  const flag = getCountryFlag(countryCode);
  
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <span className={`${sizeClasses[size]} inline-block`} title={countryCode}>
      {flag}
    </span>
  );
}

// Language flag component
export function LanguageFlag({ languageCode, size = 'md' }: { languageCode?: string, size?: 'sm' | 'md' | 'lg' }) {
  const flag = getLanguageFlag(languageCode);
  
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <span className={`${sizeClasses[size]} inline-block`} title={languageCode}>
      {flag}
    </span>
  );
}