import React, { useState } from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useCustomContext } from '../context/CustomContext';
import { PotjesVisualisatie } from '../components/Potjes/PotjesVisualisatie';
import { PotjesTabel } from '../components/Potjes/PotjesTabel';
import { usePlusminApi } from '../api/plusminApi';
import { PotjesActies } from '../components/Potjes/PotjesActies';

const Potjes: React.FC = () => {
  const { rekeningGroepPerBetalingsSoort, actieveAdministratie, setIsStandDirty, setSnackbarMessage } = useCustomContext();
  const { putReserveringen, putAlleReserveringen } = usePlusminApi();
  
  const getInitialView = (): 'potjes' | 'tabel' => {
    const saved = localStorage.getItem('potjesVisualisatieVoorkeur');
    return (saved === 'potjes' || saved === 'tabel') ? saved : 'potjes';
  };
  
  const [view, setView] = useState<'potjes' | 'tabel'>(getInitialView);
  const [isReservering, setIsReservering] = useState(false);

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
    // const creeerReserveringsHorizonTekst = () => {
    //   return (
    //     <>
    //       De <strong>potjes</strong> zijn gevuld tot en met{' '}
    //       {dayjs(stand?.reserveringsHorizon).format('D MMMM')}.
    //       {dayjs(stand?.reserveringsHorizon).isBefore(dayjs(stand?.budgetHorizon))
    //         ? ` Ze kunnen worden gevuld tot en met ${dayjs(stand?.budgetHorizon).format('D MMMM')}.`
    //         : ''}
    //     </>
    //   );
    // };
  //   const potjesSamenvatting = (
  //   <Typography>
  //     <strong>Potjes</strong> <br />
  //     Openingsstand:{' '}
  //     {formatAmount(
  //       (reserveringBuffer?.openingsReserveSaldo ?? 0) +
  //         (openingsReservePotjesVoorNuSaldo ?? 0),
  //     )}
  //     &nbsp; = openingssaldo buffer:{' '}
  //     {formatAmount(reserveringBuffer?.openingsReserveSaldo ?? 0)}
  //     &nbsp; + openingsReservePotjesVoorNuSaldo:{' '}
  //     {formatAmount(openingsReservePotjesVoorNuSaldo ?? 0)}
  //     <br />
  //     Actuele stand {formatAmount(actueleStand)}
  //     &nbsp; = openingssaldo buffer:{' '}
  //     {formatAmount(reserveringBuffer?.openingsReserveSaldo ?? 0)}
  //     &nbsp; + inkomsten - reservering:{' '}
  //     {formatAmount(reserveringBuffer?.periodeReservering ?? 0)}&nbsp; + huidige
  //     reserve in potjes voor nu:{' '}
  //     {formatAmount(reserveringsSaldoPotjesVanNu ?? 0)}
  //     <br />
  //     Verwachte eindstand{' '}
  //     {formatAmount(
  //       actueleStand + (verwachteInkomsten ?? 0) - (verwachteUitgaven ?? 0),
  //     )}
  //     &nbsp; = actuele stand: {formatAmount(actueleStand ?? 0)}
  //     &nbsp; + verwachte inkomsten: {formatAmount(verwachteInkomsten ?? 0)}
  //     &nbsp; - verwachte uitgaven: {formatAmount(verwachteUitgaven ?? 0)}
  //   </Typography>
  // );



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
                layout="horizontal"
              />
            </Box>
            {view === 'potjes' ? <PotjesVisualisatie /> : <PotjesTabel />}
          </>
        )}
    </>
  );
};

export default Potjes;
