import { BetalingDTO } from '../model/Betaling';
import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useCustomContext } from '../context/CustomContext';
import UpsertBetalingDialoog from '../components/Kasboek/UpsertBetalingDialoog';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import dayjs from 'dayjs';
import BetalingTabel from '../components/Kasboek/BetalingTabel';
import KolommenTabel from '../components/Kasboek/KolommenTabel';

export default function Kasboek() {
  const { gekozenPeriode, betalingen, setBetalingen, stand, setIsStandDirty } =
    useCustomContext();

  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState<string | false>(
    isMdOrLarger ? 'tabel' : 'kolommen',
  );
  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const isBoekingInGekozenPeriode = (boekingsdatum: string | Date) =>
    dayjs(boekingsdatum).isAfter(
      dayjs(gekozenPeriode?.periodeStartDatum).subtract(1, 'day'),
    ) &&
    dayjs(boekingsdatum).isBefore(
      dayjs(gekozenPeriode?.periodeEindDatum).add(1, 'day'),
    );

  const onBetalingBewaardChange = (betaling: BetalingDTO): void => {
    if (betaling && isBoekingInGekozenPeriode(betaling.boekingsdatum)) {
      setBetalingen({ ...betalingen, [betaling.id]: betaling });
      setIsStandDirty(true);
    }
  };
  const onBetalingVerwijderdChange = (betaling: BetalingDTO): void => {
    if (betaling && isBoekingInGekozenPeriode(betaling.boekingsdatum)) {
      const { [betaling.id]: _, ...rest } = betalingen;
      setBetalingen(rest);
      setIsStandDirty(true);
    }
  };
  const isPeriodeOpen =
    gekozenPeriode?.periodeStatus === 'OPEN' ||
    gekozenPeriode?.periodeStatus === 'HUIDIG';

  return (
    <>
      <Typography variant="h4">Kasboek</Typography>
      <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 2, md: 6 }}>
        <Grid size={2}>
          <PeriodeSelect isKasboek />
        </Grid>
        <Grid size={{ xs: 2, md: 3 }}>
          <Typography sx={{ mt: { xs: '0px', md: '35px' } }}>
            {/* IN ({currencyFormatter.format(Number(berekenInkomstenTotaal()))}) - UIT ({currencyFormatter.format(Number(berekenUitgavenTotaal()))}) = {currencyFormatter.format(berekenCashFlowTotaal())} */}
          </Typography>
        </Grid>
        {isPeriodeOpen && (
          <Grid
            size={1}
            alignItems={{ xs: 'start', md: 'end' }}
            sx={{
              mb: '12px',
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/kasboek/ocr')}
              sx={{ mt: '10px', ml: 0 }}
            >
              <PhotoCameraOutlinedIcon />
            </Button>
            <UpsertBetalingDialoog
              editMode={false}
              betaling={undefined}
              onUpsertBetalingClose={() => { }}
              onBetalingBewaardChange={(betalingDTO) =>
                onBetalingBewaardChange(betalingDTO)
              }
              onBetalingVerwijderdChange={(betalingDTO) =>
                onBetalingVerwijderdChange(betalingDTO)
              }
            />
          </Grid>
        )}
      </Grid>
      {isMdOrLarger && gekozenPeriode && betalingen && stand && (
        <BetalingTabel
          rekeningGroep={undefined}
          rekeningNaam={undefined}
          betalingen={betalingen}
          geaggregeerdResultaatOpDatum={stand?.geaggregeerdResultaatOpDatum.sort(
            (a, b) => a.sortOrder - b.sortOrder,
          )}
          onBetalingBewaardChange={(betalingDTO) =>
            onBetalingBewaardChange(betalingDTO)
          }
          onBetalingVerwijderdChange={(betalingDTO) =>
            onBetalingVerwijderdChange(betalingDTO)
          }
        />
      )}
      <Grid sx={{ mb: '25px' }}>
        <Accordion
          expanded={expanded === 'kolommen'}
          onChange={handleChange('kolommen')}
        >
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls={'BetalingTabel'}
            id={'BetalingTabel'}
          >
            <Typography component="span">Weergave per kolom</Typography>
          </AccordionSummary>
          {betalingen &&
            <AccordionDetails sx={{ p: 0 }}>
              <KolommenTabel
                betalingen={betalingen}
                geaggregeerdResultaatOpDatum={
                  stand?.geaggregeerdResultaatOpDatum ?? []
                }
                onBetalingBewaardChange={(betalingDTO) =>
                  onBetalingBewaardChange(betalingDTO)
                }
                onBetalingVerwijderdChange={(betalingDTO) =>
                  onBetalingVerwijderdChange(betalingDTO)
                }
              />
            </AccordionDetails>}
        </Accordion>
      </Grid>
      {/* {JSON.stringify(stand?.geaggregeerdResultaatOpDatum)} */}
    </>
  );
}
