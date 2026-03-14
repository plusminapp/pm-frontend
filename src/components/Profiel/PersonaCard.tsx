import React from 'react';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Persona } from '../../model/Persona';

interface Props {
  persona: Persona;
}

const PersonaCard: React.FC<Props> = ({ persona }) => {
  if (!persona) return null;

  const PLACEHOLDER = '/persona-examples/simon.png';

  const [imgSrc, setImgSrc] = React.useState<string>(
    persona.foto?.value || PLACEHOLDER,
  );

  React.useEffect(() => {
    setImgSrc(persona.foto?.value || PLACEHOLDER);
  }, [persona]);

  const handleImgError = () => setImgSrc(PLACEHOLDER);

  return (
    <Box sx={{ my: 2 }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <img
              src={imgSrc}
              alt={persona.foto?.alt || 'Persona foto'}
              onError={handleImgError}
              style={{
                maxWidth: 160,
                width: '100%',
                height: 'auto',
                borderRadius: 8,
                objectFit: 'cover',
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' } }}
          >
            {persona.naam}
          </Typography>

          {persona.meta && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {persona.meta.leeftijd !== undefined && (
                <span>{persona.meta.leeftijd} jaar</span>
              )}
              {persona.meta.tags && (
                <span>
                  {persona.meta.leeftijd !== undefined && ' · '}
                  {persona.meta.tags.join(', ')}
                </span>
              )}
            </Typography>
          )}

          {persona.beschrijving && (
            <Box>
              {persona.beschrijving.map((item, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  {item.kop && (
                    <Typography variant="subtitle2">{item.kop}</Typography>
                  )}
                  <Typography variant="body1">{item.tekst}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonaCard;
