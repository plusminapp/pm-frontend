import { Box, Typography } from '@mui/material';
import { GB, NL, FR } from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';

const TAAL_KEUZES = [
  { taal: 'nl', titel: 'Nederlands', vlag: NL },
  { taal: 'en', titel: 'English', vlag: GB },
  { taal: 'fr', titel: 'Français', vlag: FR },
];

export function TaalKeuzes() {
  const { i18n } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
      <Typography variant="h6" component="h3">Je taakkeuze:</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {TAAL_KEUZES.map((taalKeuze) => (
          <Box
            key={taalKeuze.taal}
            sx={(theme) => ({
              cursor: 'pointer',
              borderBottom: i18n.language?.startsWith(taalKeuze.taal) ? `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
              pb: '6px',
              transition: 'border-color 150ms ease',
              display: 'inline-flex',
            })}
          >
            {taalKeuze.vlag({
              className: 'languageFlag',
              title: taalKeuze.titel,
              onClick: () => i18n.changeLanguage(taalKeuze.taal),
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
