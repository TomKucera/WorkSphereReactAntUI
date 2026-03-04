import type { Language, LanguageLevel } from "./language";

export interface CoverLetterRequest {
  work_id: number;
  cv_id: number;
  language?: Language;
  language_level?: LanguageLevel;
};