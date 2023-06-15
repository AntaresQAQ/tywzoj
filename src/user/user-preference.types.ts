import { CE_Language } from "@/common/locales";

export const enum CE_Theme {
  Light = "Light",
  Dark = "Dark",
  HighContrast = "HighContrast",
}

export interface IUserPreferenceEntity {
  userPreferTheme: CE_Theme;
  userPreferLanguage: CE_Language;

  showTagsOnProblemList: boolean;
  showTagsOnProblemDetail: boolean;
}

export interface IUserPreferenceExtra {}

export type IUserPreferenceEntityWithExtra = IUserPreferenceEntity & IUserPreferenceExtra;
