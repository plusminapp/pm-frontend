import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { usePlusminApi } from '../../api/plusminApi';
import { useCustomContext } from '../../context/CustomContext';
import dayjs from 'dayjs';
import { PlusIcon } from '../../icons/Plus';

const NaarMorgen: React.FC = () => {
  const {
    actieveAdministratie,
    setActieveAdministratie,
    gebruiker,
    setGebruiker,
    setIsStandDirty,
    setSnackbarMessage,
  } = useCustomContext();
  const { putVandaag } = usePlusminApi();
  const [isLoading, setIsLoading] = useState(false);

  const vandaag = actieveAdministratie?.vandaag;

  const handleNaarMorgen = async (toonBetalingen: boolean) => {
    if (!actieveAdministratie || !vandaag) return;

    try {
      setIsLoading(true);
      const morgen = dayjs(vandaag).add(1, 'day').format('YYYY-MM-DD');
      await putVandaag(actieveAdministratie, morgen, toonBetalingen);

      // Update lokale state in plaats van reload
      const updatedAdministratie = {
        ...actieveAdministratie,
        vandaag: morgen,
      };
      setActieveAdministratie(updatedAdministratie);

      // Update ook in gebruiker administraties array
      if (gebruiker) {
        const updatedAdministraties = gebruiker.administraties.map((admin) =>
          admin.id === actieveAdministratie.id
            ? { ...admin, vandaag: morgen }
            : admin,
        );
        setGebruiker({
          ...gebruiker,
          administraties: updatedAdministraties,
        });
        setIsStandDirty(true);
      }

      console.log(
        `Naar morgen ${toonBetalingen ? 'met' : 'zonder'} betalingen:`,
        morgen,
      );
    } catch (error) {
      setSnackbarMessage({
        message: 'Fout bij het verplaatsen naar morgen.',
        type: 'error',
      });
      console.error('Fout bij naar morgen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render alleen als vandaag beschikbaar is
  if (!vandaag) return null;

  return (
    <Box className="flex gap-1 justify-center w-full">
      <Button
        variant="contained"
        color="success"
        size="small"
        className="flex-1"
        onClick={() => handleNaarMorgen(false)}
        disabled={isLoading}
        startIcon={<PlayArrowIcon />}
        sx={{ minWidth: 'auto', px: 1 }}
      />
      <Button
        variant="contained"
        color="success"
        size="small"
        className="flex-1"
        onClick={() => handleNaarMorgen(true)}
        disabled={isLoading}
        startIcon={<PlayArrowIcon />}
        sx={{ minWidth: 'auto', px: 1 }}
      >
        <PlusIcon />
      </Button>
    </Box>
  );
};

export default NaarMorgen;
