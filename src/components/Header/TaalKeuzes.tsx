import { Box } from '@mui/material';
import { GB, NL, FR } from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';

const TAAL_KEUZES = [
  { taal: 'nl', titel: 'Nederlands', vlag: NL },
  { taal: 'en', titel: 'English', vlag: GB },
  { taal: 'fr', titel: 'Français', vlag: FR },
];

export function TaalKeuzes() {
  const { i18n } = useTranslation();

  return TAAL_KEUZES.map((taalKeuze) => (
    <Box key={taalKeuze.taal}>
      {taalKeuze.vlag({
        className: 'languageFlag',
        title: taalKeuze.titel,
        onClick: () => i18n.changeLanguage(taalKeuze.taal),
      })}
    </Box>
  ));
}
