import React, { useState } from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Button, ButtonGroup } from '@mui/material';

import { useCustomContext } from '../context/CustomContext';
import { PotjesVisualisatie } from '../components/Potjes/PotjesVisualisatie';
import { PotjesTabel } from '../components/Potjes/PotjesTabel';
import { usePlusminApi } from '../api/plusminApi';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';

const Potjes: React.FC = () => {
  const { rekeningGroepPerBetalingsSoort, gekozenPeriode, actieveAdministratie, setIsStandDirty, setSnackbarMessage } = useCustomContext();
  const { putReserveringen, putAlleReserveringen } = usePlusminApi();
  const [view, setView] = useState<'visualisatie' | 'tabel'>('visualisatie');
  const [isReservering, setIsReservering] = useState(false);

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'visualisatie' | 'tabel' | null,
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleReserveerClick = async () => {
    if (!actieveAdministratie) return;

    try {
      setIsReservering(true);
      await putReserveringen(actieveAdministratie);
      setIsStandDirty(true);
      setSnackbarMessage({
        message: 'Reserveringen zijn succesvol uitgevoerd.',
        type: 'success',
      });
    } catch (error) {
      console.error('Fout bij het uitvoeren van reserveringen:', error);
      
      let errorMessage = 'Fout bij het uitvoeren van reserveringen.';
      
      if (error instanceof Error && error.plusMinError) {
        errorMessage = error.plusMinError.message;
      }
      
      setSnackbarMessage({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsReservering(false);
    }
  };

  const handleReserveerAlleClick = async () => {
    if (!actieveAdministratie) return;

    try {
      setIsReservering(true);
      await putAlleReserveringen(actieveAdministratie);
      setIsStandDirty(true);
      setSnackbarMessage({
        message: 'Reserveringen zijn succesvol uitgevoerd.',
        type: 'success',
      });
    } catch (error) {
      console.error('Fout bij het uitvoeren van alle reserveringen:', error);
      
      let errorMessage = 'Fout bij het uitvoeren van alle reserveringen.';
      
      if (error instanceof Error && error.plusMinError) {
        errorMessage = error.plusMinError.message;
      }
      
      setSnackbarMessage({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsReservering(false);
    }
  };

  const isHuidigePeriode = gekozenPeriode?.periodeStatus === 'HUIDIG';

  return (
    <>
      {rekeningGroepPerBetalingsSoort &&
        rekeningGroepPerBetalingsSoort.length >= 0 && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} px={2}>
              <PeriodeSelect />
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="weergave selectie"
              >
                <ToggleButton value="visualisatie" aria-label="potjes visualisatie">
                  Potjes
                </ToggleButton>
                <ToggleButton value="tabel" aria-label="reservering tabel">
                  Tabel
                </ToggleButton>
              </ToggleButtonGroup>
              {isHuidigePeriode && (
                <ButtonGroup variant="contained" color="success" disabled={isReservering}>
                  <Button
                    onClick={handleReserveerClick}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {isReservering ? 'Bezig...' : 'Reserveer'}
                  </Button>
                  <Button
                    onClick={handleReserveerAlleClick}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {isReservering ? 'Bezig...' : 'Reserveer Alle'}
                  </Button>
                </ButtonGroup>
              )}
            </Box>
            {view === 'visualisatie' ? <PotjesVisualisatie /> : <PotjesTabel />}
          </>
        )}
    </>
  );
};

export default Potjes;
