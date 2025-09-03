import { BetalingDTO } from '../model/Betaling';
import { useEffect, useState } from 'react';
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
import { usePlusminApi } from '../api/plusminApi';

export default function Kasboek() {
  const { actieveHulpvrager, gekozenPeriode, stand, setIsStandDirty } =
    useCustomContext();

  const [betalingen, setBetalingen] = useState<BetalingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const { getBetalingenVoorHulpvragerVoorPeriode } = usePlusminApi();

  const [expanded, setExpanded] = useState<string | false>(
    isMdOrLarger ? 'tabel' : 'kolommen',
  );
  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  useEffect(() => {
    if (actieveHulpvrager && gekozenPeriode) {
      setIsLoading(true);
      getBetalingenVoorHulpvragerVoorPeriode(actieveHulpvrager, gekozenPeriode)
        .then((response) => {
          setBetalingen(response.data.content);
        })
        .catch((error) => {
          console.error('Failed to fetch betalingen', error);
          setBetalingen([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [
    actieveHulpvrager,
    gekozenPeriode,
    getBetalingenVoorHulpvragerVoorPeriode,
  ]);

  const onBetalingBewaardChange = (betaling: BetalingDTO): void => {
    const isBoekingInGekozenPeriode =
      dayjs(betaling?.boekingsdatum).isAfter(
        dayjs(gekozenPeriode?.periodeStartDatum).subtract(1, 'day'),
      ) &&
      dayjs(betaling?.boekingsdatum).isBefore(
        dayjs(gekozenPeriode?.periodeEindDatum).add(1, 'day'),
      );
    if (isBoekingInGekozenPeriode && betaling) {
      setBetalingen([
        ...betalingen.filter((b) => b.id !== betaling?.id),
        betaling,
      ]);
    }
    setIsStandDirty(true);
  };
  const onBetalingVerwijderdChange = (sortOrder: string): void => {
    setBetalingen(betalingen.filter((b) => b.sortOrder !== sortOrder));
    setIsStandDirty(true);
  };
  const isPeriodeOpen =
    gekozenPeriode?.periodeStatus === 'OPEN' ||
    gekozenPeriode?.periodeStatus === 'HUIDIG';

  if (isLoading) {
    return (
      <Typography sx={{ mb: '25px' }}>
        De betalingen worden opgehaald.
      </Typography>
    );
  }

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
              onUpsertBetalingClose={() => {}}
              onBetalingBewaardChange={(betalingDTO) =>
                onBetalingBewaardChange(betalingDTO)
              }
              onBetalingVerwijderdChange={(betalingDTO) =>
                onBetalingVerwijderdChange(betalingDTO.sortOrder)
              }
            />
          </Grid>
        )}
      </Grid>
      {isMdOrLarger && gekozenPeriode && stand && (
        <BetalingTabel
          rekeningGroep={undefined}
          betalingen={betalingen}
          geaggregeerdResultaatOpDatum={stand?.geaggregeerdResultaatOpDatum.sort(
            (a, b) => a.sortOrder - b.sortOrder,
          )}
          onBetalingBewaardChange={(betalingDTO) =>
            onBetalingBewaardChange(betalingDTO)
          }
          onBetalingVerwijderdChange={(betalingDTO) =>
            onBetalingVerwijderdChange(betalingDTO.sortOrder)
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
                onBetalingVerwijderdChange(betalingDTO.sortOrder)
              }
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
      {/* <Grid container spacing={{ xs: 1, md: 3 }} columns={{ xs: 1, lg: 12 }}>
        <Grid size={{ xs: 1, lg: 4 }}>
          <Accordion expanded={expanded === 'RekeningGroep'} onChange={handleChange('RekeningGroep')}>
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="blaat"
              id={"blaat"}>
              <Typography sx={{ fontSize: '15px' }} >Betalingen per RekeningGroep
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <BetalingTabel
                // isFilterSelectable={true}
                // actueleRekeningGroep={undefined}
                onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
                onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO.sortOrder)}
                betalingen={betalingen} geaggregeerdResultaatOpDatum={[]} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid> */}
      {/* {JSON.stringify(stand?.geaggregeerdResultaatOpDatum)} */}
    </>
  );
}
