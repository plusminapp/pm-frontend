import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      components: { header: { kasboek: 'Ledger', stand: 'Financial status' } },
    },
  },
  nl: {
    translation: {
      components: { header: { kasboek: 'Kasboek', stand: 'Stand' } },
    },
  },
  fr: {
    translation: {
      components: {
        header: { kasboek: 'Le grand livre', stand: 'Situation financière' },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'nl',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
