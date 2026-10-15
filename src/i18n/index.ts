import { en } from './en';
import { te } from './te';
import { Language } from '../types';

export const translations = { en, te };

export type TranslationKeys = keyof typeof en;

export function getTranslation(lang: Language, key: TranslationKeys): string {
  const dictionary = translations[lang] || translations.en;
  return dictionary[key] || translations.en[key] || key;
}
