import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';

import { useEffect, useState } from 'react';
import { useCustomContext } from '../context/CustomContext';

import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import AflossingTabel from '../components/Aflossing/AflossingTabel';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import { SaldoDTO } from '../model/Saldo';
import { RekeningGroepSoort } from '../model/RekeningGroep';
import { berekenRekeningGroepIcoon } from '../components/Stand/BerekenStandKleurEnTekst';
import { AflossingenAfbouwGrafiek } from '../components/Aflossing/Graph/AflossingenAfbouwGrafiek';
import { BetalingsSoort } from '../model/Betaling';

export default function Aflossen() {
  const {
    actieveAdministratie,
    gekozenPeriode,
    stand,
    rekeningGroepPerBetalingsSoort,
  } = useCustomContext();

  const aflossing = rekeningGroepPerBetalingsSoort
    .filter((r) => r.betalingsSoort === BetalingsSoort.aflossen)
    .flatMap((r) => r.rekeningGroepen)
    .flatMap((r) => r.rekeningen);

  const [aflossingSaldi, setAflossingSaldi] = useState<SaldoDTO[]>([]);

  useEffect(() => {
    if (stand) {
      setAflossingSaldi(
        stand.resultaatOpDatum.filter(
          (r: SaldoDTO) =>
            r.rekeningGroepSoort === RekeningGroepSoort.aflossing,
        ),
      );
    }
  }, [stand]);

  return (
    <>
      {aflossingSaldi.length === 0 && (
        <>
          <Typography variant="h4">Aflossen</Typography>
          <Typography variant="body2">
            {actieveAdministratie?.bijnaam} heeft op{' '}
            {gekozenPeriode?.periodeStartDatum} geen aflossingen ingericht.
          </Typography>
          <PeriodeSelect isAflossing />
        </>
      )}
      {aflossingSaldi.length > 0 && (
        <>
          <Typography variant="h4">Aflossen</Typography>
          <Grid
            container
            spacing={2}
            columns={{ xs: 1, md: 3 }}
            justifyContent="space-between"
          >
            <Grid size={1} alignItems="start">
              <PeriodeSelect isAflossing />
            </Grid>
          </Grid>
          <Accordion elevation={2}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls={'afbouwgrafiek'}
              id={'afbouwgrafiek'}
            >
              <Typography sx={{ color: 'FFF' }} component="span">
                Verwachte afbouw van de schulden/aflossingen
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <AflossingenAfbouwGrafiek
                aflossingen={aflossing}
                aflossingSaldi={aflossingSaldi}
              />
            </AccordionDetails>
          </Accordion>
        </>
      )}
      {aflossingSaldi.map((saldoDTO) => (
        <Accordion key={saldoDTO.rekeningNaam} elevation={2}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={saldoDTO.rekeningNaam}
            id={saldoDTO.rekeningNaam}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {berekenRekeningGroepIcoon(22, saldoDTO)}
              <Typography
                sx={{ color: 'FFF', ml: 1, whiteSpace: 'nowrap' }}
                component="span"
                align="left"
              >
                {saldoDTO.rekeningNaam}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <AflossingTabel aflossingSaldo={saldoDTO} />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
