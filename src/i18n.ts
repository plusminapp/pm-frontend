import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      components: {
        header: {
          kasboek: 'Ledger',
          stand: 'Status',
          aflossen: 'Repayment',
          sparen: 'Saving',
          potjes: 'Pots',
        },
      },
    },
  },
  nl: {
    translation: {
      components: {
        header: {
          kasboek: 'Kasboek',
          stand: 'Stand',
          aflossen: 'Aflossen',
          sparen: 'Sparen',
          potjes: 'Potjes',
          profiel: 'Profiel',
          uitloggen: 'Uitloggen',
        },
      },
    },
  },
  fr: {
    translation: {
      components: {
        header: {
          kasboek: 'Livre',
          stand: 'Situation',
          aflossen: 'Remboursement',
          sparen: 'Épargne',
          potjes: 'Pots',
        },
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
