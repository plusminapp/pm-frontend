import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";
import Resultaat from "../components/Resultaat";
import type { Stand } from "../model/Stand";
import dayjs from "dayjs";
import { PeriodeSelect } from "../components/Periode/PeriodeSelect";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BudgetContinuGrafiek from "../components/Budget/BudgetContinuGrafiek";
import { betaalmethodeRekeningSoorten } from "../model/Rekening";
import BudgetVastGrafiek from "../components/Budget/BudgetVastGrafiek";
import BudgetInkomstenGrafiek from "../components/Budget/BudgetInkomstenGrafiek";
import AflossingGrafiek from "../components/Budget/AflossingGrafiek";
import StandIcon from "../icons/Stand";

export default function Stand() {

  const { getIDToken } = useAuthContext();
  const navigate = useNavigate();
  const { actieveHulpvrager, gekozenPeriode, rekeningen, setSnackbarMessage } = useCustomContext();

  const [stand, setStand] = useState<Stand | undefined>(undefined)
  const [datumLaatsteBetaling, setDatumLaatsteBetaling] = useState<dayjs.Dayjs | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);
  const [toonMutaties, setToonMutaties] = useState(localStorage.getItem('toonMutaties') === 'true');

  useEffect(() => {
    const fetchSaldi = async () => {
      if (actieveHulpvrager && gekozenPeriode) {
        setIsLoading(true);
        const vandaag = dayjs().format('YYYY-MM-DD');
        const datum = gekozenPeriode.periodeEindDatum > vandaag ? vandaag : gekozenPeriode.periodeEindDatum;
        const id = actieveHulpvrager.id
        let token = '';
        try { token = await getIDToken() }
        catch (error) {
          navigate('/login');
        }
        const response = await fetch(`/api/v1/saldo/hulpvrager/${id}/stand/${datum}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setStand(result)
        } else {
          console.error("Failed to fetch data", response.status);
          setSnackbarMessage({
            message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
            type: "warning",
          })
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, gekozenPeriode, getIDToken]);

  useEffect(() => {
    const fetchDatumLaatsteBetaling = async () => {
      if (actieveHulpvrager) {
        setIsLoading(true);
        const id = actieveHulpvrager.id
        let token = '';
        try { token = await getIDToken() }
        catch (error) {
          navigate('/login');
        }
        const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}/betalingvalidatie`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setDatumLaatsteBetaling(dayjs(result))
        } else {
          console.error("Failed to fetch data", response.status);
          setSnackbarMessage({
            message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
            type: "warning",
          })
        }
      }
    };
    fetchDatumLaatsteBetaling();

  }, [actieveHulpvrager, getIDToken]);

  const handleToonMutatiesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonMutaties', event.target.checked.toString());
    setToonMutaties(event.target.checked);
  };

  // const findStandVanRekening = (rekeningNaam: string) => {
  //   const saldo = stand?.resultaatOpDatum.find(saldo => saldo.rekeningNaam === rekeningNaam);
  //   return saldo?.bedrag ?? 0;
  // };

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  };

  return (
    <>
      {stand !== undefined &&
        <>
          <Typography variant='h4' sx={{ mb: 2 }}>Hoe staan we er voor?</Typography>

          <Grid container spacing={2} columns={{ xs: 1, md: 3 }} justifyContent="space-between">
            <Grid size={2} sx={{ boxShadow: 3, p: 2 }}>
              <Typography variant='h6'>Samenvatting {dayjs().format('D MMMM')}</Typography>
              <Typography variant='body2'>
                Laatste betaling geregistreerd op {dayjs(datumLaatsteBetaling).format('D MMMM')}.
              </Typography>
              <StandIcon
                color="green"
                borderColor="green"
                height={100}
                text={<CheckRoundedIcon />}
                outerText="Inkomsten"
              />
              <StandIcon
                color="red"
                borderColor="green"
                height={100}
                text="€ 15"
                outerText="Boodschappen"
              />
              <StandIcon
                color="red"
                borderColor="red"
                height={100}
                text="€ 35"
                outerText="Vaste lasten"
              />
              <StandIcon
                color="orange"
                borderColor="orange"
                height={100}
                text="€ 321"
                outerText="Aflossingen"
              />
            </Grid>
            <Grid size={1} direction={'column'} alignItems="start">
              <PeriodeSelect />
              <Resultaat
                title={'Stand van de geldrekeningen'}
                datum={stand.peilDatum}
                saldi={stand.balansOpDatum!.filter(saldo =>
                  rekeningen.filter(r => betaalmethodeRekeningSoorten.includes(r.rekeningSoort))
                    .map(r => r.naam).includes(saldo.rekeningNaam))} />
            </Grid>
          </Grid>

          <Typography variant='h6' sx={{ my: 2 }}>Potjes en bijbehorende budgetten</Typography>
          {gekozenPeriode &&
            rekeningen
              .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
              .filter(rekening => rekening.budgetten.length >= 1)
              .map(rekening => (
                rekening.budgetType?.toLowerCase() === 'continu' ?
                  <BudgetContinuGrafiek
                    rekening={rekening}
                    peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                    periode={gekozenPeriode}
                    budgetten={stand.budgettenOpDatum.filter(b => b.rekeningNaam === rekening.naam)}
                  /> : rekening.rekeningSoort.toLowerCase() === 'inkomsten' ?
                    <BudgetInkomstenGrafiek
                      rekening={rekening}
                      peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                      periode={gekozenPeriode}
                      budgetten={stand.budgettenOpDatum.filter(b => b.rekeningSoort.toLowerCase() === 'inkomsten')}
                    /> :
                    <BudgetVastGrafiek
                      rekening={rekening}
                      peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                      periode={gekozenPeriode}
                      budgetten={stand.budgettenOpDatum.filter(b => b.rekeningNaam === rekening.naam)}
                    />
              ))}

          {gekozenPeriode && stand.aflossingenOpDatum.length > 0 &&
            <AflossingGrafiek
              peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
              periode={gekozenPeriode}
              aflossingen={stand.aflossingenOpDatum} />
          }

          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Saldo's op {dayjs(stand.peilDatum).format('D MMMM')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 1, md: 2 }}>
                <Grid size={1} alignItems={{ xs: 'start', md: 'end' }} sx={{ mb: '12px', display: 'flex' }}>
                  <FormGroup sx={{ ml: 'auto' }} >
                    <FormControlLabel control={
                      <Switch
                        sx={{ transform: 'scale(0.6)' }}
                        checked={toonMutaties}
                        onChange={handleToonMutatiesChange}
                        slotProps={{ input: { 'aria-label': 'controlled' } }}
                      />}
                      label="Toon mutaties" />
                  </FormGroup>
                </Grid>
              </Grid>
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={toonMutaties ? { xs: 1, sm: 2, md: 4 } : { xs: 1, sm: 3, md: 3 }}>
                  <Grid size={1}>
                    <Resultaat title={'Opening'} datum={stand.periodeStartDatum} saldi={stand.openingsBalans!} />
                  </Grid>
                  <Grid size={1}>
                    <Resultaat title={'Inkomsten en uitgaven'} datum={stand.peilDatum} saldi={stand.resultaatOpDatum} />
                  </Grid>
                  {toonMutaties &&
                    <Grid size={1}>
                      <Resultaat title={'Mutaties per'} datum={stand.peilDatum} saldi={stand.mutatiesOpDatum!} />
                    </Grid>}
                  <Grid size={1}>
                    <Resultaat title={'Stand'} datum={stand.peilDatum} saldi={stand.balansOpDatum!} />
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        </>
      }
    </>
  )
}