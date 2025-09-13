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
import SparenTabel from '../components/Sparen/SparenTabel';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import { SaldoDTO } from '../model/Saldo';
import { RekeningGroepSoort } from '../model/RekeningGroep';
import { berekenRekeningGroepIcoon } from '../components/Stand/BerekenStandKleurEnTekst';

export default function Sparen() {
  const { actieveHulpvrager, gekozenPeriode, stand } = useCustomContext();

  const [sparenSaldi, setSparenSaldi] = useState<SaldoDTO[]>([]);

  useEffect(() => {
    if (stand) {
      setSparenSaldi(
        stand.resultaatOpDatum.filter(
          (r: SaldoDTO) =>
            r.rekeningGroepSoort === RekeningGroepSoort.spaarrekening,
        ),
      );
    }
  }, [stand]);

  return (
    <>
      {sparenSaldi.length === 0 && (
        <>
          <Typography variant="h4">Sparen</Typography>
          <Typography variant="body2">
            {actieveHulpvrager?.bijnaam} heeft op{' '}
            {gekozenPeriode?.periodeStartDatum} geen spaartegoed ingericht.
          </Typography>
          <PeriodeSelect />
        </>
      )}
      {sparenSaldi.length > 0 && (
        <>
          <Typography variant="h4">Sparen pagina</Typography>
          <Grid
            container
            spacing={2}
            columns={{ xs: 1, md: 3 }}
            justifyContent="space-between"
          >
            <Grid size={1} alignItems="start">
              <PeriodeSelect />
            </Grid>
          </Grid>
          <Accordion elevation={2}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls={'afbouwgrafiek'}
              id={'afbouwgrafiek'}
            >
              <Typography sx={{ color: 'FFF' }} component="span">
                Verwachte opbouw van het spaartegoed
              </Typography>
            </AccordionSummary>
          </Accordion>
        </>
      )}
      {sparenSaldi.map((saldoDTO) => (
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
            <SparenTabel sparenSaldo={saldoDTO} />
          </AccordionDetails>
        </Accordion>
      ))}
      {/* sparenSaldi: {JSON.stringify(sparenSaldi)} */}
      {/* <hr />
      series: {JSON.stringify(getSeries(sparenSaldi))}
      <hr />
      data: {JSON.stringify(getData(sparenSaldi))} */}
    </>
  );
}
