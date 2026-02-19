import React, { useEffect, useState } from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useCustomContext } from '../context/CustomContext';
import { PotjesVisualisatie } from '../components/Potjes/PotjesVisualisatie';
import { PotjesTabel } from '../components/Potjes/PotjesTabel';
import { usePlusminApi } from '../api/plusminApi';
import { PotjesActies } from '../components/Potjes/PotjesActies';

const Potjes: React.FC = () => {
  const { rekeningGroepPerBetalingsSoort, actieveAdministratie, setIsStandDirty, setSnackbarMessage } = useCustomContext();
  const { putReserveringen, putAlleReserveringen, getLabels } = usePlusminApi();
  
  const getInitialView = (): 'potjes' | 'tabel' => {
    const saved = localStorage.getItem('potjesVisualisatieVoorkeur');
    return (saved === 'potjes' || saved === 'tabel') ? saved : 'potjes';
  };
  
  const [view, setView] = useState<'potjes' | 'tabel'>(getInitialView);
  const [isReservering, setIsReservering] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadLabels = async () => {
      if (!actieveAdministratie) {
        setLabels([]);
        setSelectedLabels([]);
        return;
      }

      try {
        const result = await getLabels(actieveAdministratie);
        if (!isActive) return;
        const sorted = [...result].sort((a, b) => a.localeCompare(b));
        setLabels(sorted);
        setSelectedLabels((current) =>
          current.filter((label) => sorted.includes(label)),
        );
      } catch (error) {
        console.error('Fout bij ophalen labels:', error);
      }
    };

    loadLabels();

    return () => {
      isActive = false;
    };
  }, [actieveAdministratie, getLabels]);

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'potjes' | 'tabel' | null,
  ) => {
    if (newView !== null) {
      setView(newView);
      localStorage.setItem('potjesVisualisatieVoorkeur', newView);
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

  return (
    <>
      {rekeningGroepPerBetalingsSoort &&
        rekeningGroepPerBetalingsSoort.length >= 0 && (
          <>
            {/* Accordion voor mobiel (xs en sm) */}
            <Accordion sx={{ display: { xs: 'block', sm: 'block', md: 'none' }, mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="acties-content"
                id="acties-header"
              >
                <Typography>Acties</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <PotjesActies
                  view={view}
                  handleViewChange={handleViewChange}
                  isReservering={isReservering}
                  handleReserveerClick={handleReserveerClick}
                  handleReserveerAlleClick={handleReserveerAlleClick}
                  labels={labels}
                  selectedLabels={selectedLabels}
                  onLabelChange={setSelectedLabels}
                  layout="vertical"
                />
              </AccordionDetails>
            </Accordion>

            {/* Normale weergave voor tablet en desktop (md en groter) */}
            <Box display={{ xs: 'none', sm: 'none', md: 'flex' }} mb={2} px={2}>
              <PotjesActies
                view={view}
                handleViewChange={handleViewChange}
                isReservering={isReservering}
                handleReserveerClick={handleReserveerClick}
                handleReserveerAlleClick={handleReserveerAlleClick}
                labels={labels}
                selectedLabels={selectedLabels}
                onLabelChange={setSelectedLabels}
                layout="horizontal"
              />
            </Box>
            {view === 'potjes' ? (
              <PotjesVisualisatie selectedLabels={selectedLabels} />
            ) : (
              <PotjesTabel selectedLabels={selectedLabels} />
            )}
          </>
        )}
    </>
  );
};

export default Potjes;
