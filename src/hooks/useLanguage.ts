import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function useLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set document language and direction
    document.documentElement.lang = i18n.language;
    
    // Handle RTL languages
    const rtlLanguages = ['ar', 'he', 'fa'];
    const isRTL = rtlLanguages.includes(i18n.language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Update page title based on language
    const titles = {
      en: 'TypingFlow - Modern Typing Experience',
      es: 'TypingFlow - Experiencia de Escritura Moderna',
      fr: 'TypingFlow - Expérience de Frappe Moderne',
      de: 'TypingFlow - Moderne Tipp-Erfahrung',
      pt: 'TypingFlow - Experiência de Digitação Moderna',
      it: 'TypingFlow - Esperienza di Digitazione Moderna',
      ru: 'TypingFlow - Современный Опыт Печати',
      ja: 'TypingFlow - モダンなタイピング体験',
      ko: 'TypingFlow - 현대적인 타이핑 경험',
      zh: 'TypingFlow - 现代打字体验',
      ar: 'TypingFlow - تجربة الكتابة الحديثة',
      hi: 'TypingFlow - आधुनिक टाइपिंग अनुभव'
    };
    
    document.title = titles[i18n.language as keyof typeof titles] || titles.en;
  }, [i18n.language]);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
  };

  const getCurrentLanguage = () => i18n.language;
  
  const isRTL = () => {
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(i18n.language);
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    getCurrentLanguage,
    isRTL
  };
}