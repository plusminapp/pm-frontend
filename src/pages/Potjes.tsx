import React, { useEffect, useState } from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useCustomContext } from '../context/CustomContext';
import { PotjesVisualisatie } from '../components/Potjes/PotjesVisualisatie';
import { PotjesTabel } from '../components/Potjes/PotjesTabel';
import { usePlusminApi } from '../api/plusminApi';
import { PotjesActies } from '../components/Potjes/PotjesActies';
import { SaldoDTO } from '@/model/Saldo';

type SaldoStatusFilter = NonNullable<SaldoDTO['saldoStatus']>;
const SALDO_STATUS_OPSLAG_SLEUTEL = 'potjesSaldoStatusFilter';

const Potjes: React.FC = () => {
  const { rekeningGroepPerBetalingsSoort, actieveAdministratie, setIsStandDirty, setSnackbarMessage } = useCustomContext();
  const { putReserveringen, putAlleReserveringen, getLabels } = usePlusminApi();
  
  const getInitialView = (): 'potjes' | 'tabel' => {
    const saved = localStorage.getItem('potjesVisualisatieVoorkeur');
    return (saved === 'potjes' || saved === 'tabel') ? saved : 'potjes';
  };

  const getInitialSaldoStatussen = (): SaldoStatusFilter[] => {
    const geldig: SaldoStatusFilter[] = ['GROEN', 'ORANJE', 'ROOD'];
    const opgeslagen = localStorage.getItem(SALDO_STATUS_OPSLAG_SLEUTEL);

    if (!opgeslagen) return [];

    try {
      const parsed = JSON.parse(opgeslagen);
      if (!Array.isArray(parsed)) return [];

      const uniekeGeldige = Array.from(
        new Set(parsed.filter((status): status is SaldoStatusFilter => geldig.includes(status))),
      );

      if (uniekeGeldige.length >= 3) {
        return [];
      }

      return uniekeGeldige;
    } catch {
      return [];
    }
  };
  
  const [view, setView] = useState<'potjes' | 'tabel'>(getInitialView);
  const [isReservering, setIsReservering] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedSaldoStatussen, setSelectedSaldoStatussen] = useState<SaldoStatusFilter[]>(getInitialSaldoStatussen);

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

  useEffect(() => {
    if (selectedSaldoStatussen.length === 0) {
      localStorage.removeItem(SALDO_STATUS_OPSLAG_SLEUTEL);
      return;
    }

    localStorage.setItem(
      SALDO_STATUS_OPSLAG_SLEUTEL,
      JSON.stringify(selectedSaldoStatussen),
    );
  }, [selectedSaldoStatussen]);

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
                sx={{
                  '& .MuiAccordionSummary-content': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    my: 0.5,
                  },
                }}
              >
                <Typography>Acties</Typography>
                <PotjesActies
                  view={view}
                  handleViewChange={handleViewChange}
                  isReservering={isReservering}
                  handleReserveerClick={handleReserveerClick}
                  handleReserveerAlleClick={handleReserveerAlleClick}
                  labels={labels}
                  selectedLabels={selectedLabels}
                  onLabelChange={setSelectedLabels}
                  selectedSaldoStatussen={selectedSaldoStatussen}
                  onSaldoStatusChange={setSelectedSaldoStatussen}
                  variant="filters-inline"
                  compactFilters
                  showLabelFilter={false}
                />
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
                  selectedSaldoStatussen={selectedSaldoStatussen}
                  onSaldoStatusChange={setSelectedSaldoStatussen}
                  layout="vertical"
                  showFilters={false}
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
                selectedSaldoStatussen={selectedSaldoStatussen}
                onSaldoStatusChange={setSelectedSaldoStatussen}
                layout="horizontal"
              />
            </Box>
            {view === 'potjes' ? (
              <PotjesVisualisatie
                selectedLabels={selectedLabels}
                selectedSaldoStatussen={selectedSaldoStatussen}
              />
            ) : (
              <PotjesTabel
                selectedLabels={selectedLabels}
                selectedSaldoStatussen={selectedSaldoStatussen}
              />
            )}
          </>
        )}
    </>
  );
};

export default Potjes;
