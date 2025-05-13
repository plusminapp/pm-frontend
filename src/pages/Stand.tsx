import { Accordion, AccordionDetails, AccordionSummary, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";
import Resultaat from "../components/Stand/Resultaat";
import type { Stand } from "../model/Stand";
import dayjs from "dayjs";
import { PeriodeSelect } from "../components/Periode/PeriodeSelect";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { betaalmethodeRekeningSoorten } from "../model/Rekening";
import AflossingGrafiek from "../components/Stand/AflossingGrafiek";
import SamenvattingGrafiek from "../components/Stand/SamenvattingGrafiek";
import BudgetGrafiek from "../components/Stand/BudgetGrafiek";

export default function Stand() {

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gekozenPeriode, rekeningen } = useCustomContext();

  const [stand, setStand] = useState<Stand | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);
  const [toonMutaties, setToonMutaties] = useState(localStorage.getItem('toonMutaties') === 'true');

  const [detailsVisible, setDetailsVisible] = useState<boolean>(localStorage.getItem('toonBudgetDetails') === 'true');
  const toggleToonBudgetDetails = () => {
    localStorage.setItem('toonBudgetDetails', (!detailsVisible).toString());
    setDetailsVisible(!detailsVisible);
  };

  useEffect(() => {
    const fetchSaldi = async () => {
      let token = '';
      try { token = await getIDToken() }
      catch (error) {
        setIsLoading(false);
        console.error("Failed to fetch data", error);
      }
      if (actieveHulpvrager && gekozenPeriode && token) {
        setIsLoading(true);
        const vandaag = dayjs().format('YYYY-MM-DD');
        const datum = gekozenPeriode.periodeEindDatum > vandaag ? vandaag : gekozenPeriode.periodeEindDatum;
        const id = actieveHulpvrager.id
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
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, gekozenPeriode, getIDToken]);

  const handleToonMutatiesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonMutaties', event.target.checked.toString());
    setToonMutaties(event.target.checked);
  };

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  };

  const berekenBlaat = () => {
    if (gekozenPeriode?.periodeStatus.toLowerCase() === 'huidig') {
      const dagenGeleden = dayjs().diff(dayjs(stand?.datumLaatsteBetaling), 'day');
      if (dagenGeleden === 0) {
        return 'vandaag';
      }
      if (dagenGeleden === 1) {
        return 'gisteren';
      }
      else if (dagenGeleden < 7) {
        return `${dagenGeleden} dagen geleden`;
      }
      return dayjs(stand?.datumLaatsteBetaling).format('D MMMM') ?? 'onbekend';
    };
    const maandStart = dayjs(gekozenPeriode?.periodeStartDatum).format('MMMM YYYY');
    const maandEinde = dayjs(gekozenPeriode?.periodeEindDatum).format('MMMM YYYY');
    return `periode ${maandStart}/${maandEinde}`;
  }


  return (
    <>
      {stand !== undefined &&
        <>
          <Typography variant='h4' sx={{ mb: 2 }}>Hi {actieveHulpvrager?.bijnaam}, hoe is 't?</Typography>
          <Grid container spacing={2} columns={{ xs: 1, md: 3 }} justifyContent="space-between">
            <Grid size={2} sx={{ boxShadow: { sm: 0, md: 3 }, p: { sm: 0, md: 2 } }}>
              <Typography variant='h6'>Samenvatting van {berekenBlaat()}</Typography>
              <Typography variant='body2'>
                {stand.datumLaatsteBetaling ? `Laatste betaling geregistreerd op ${dayjs(stand.datumLaatsteBetaling).format('D MMMM')}` : 'Er is nog geen betaling geregistreerd.'}.
              </Typography>

              {/* <Grid display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <FormGroup>
                  <FormControlLabel control={
                    <Switch
                      sx={{ transform: 'scale(0.6)' }}
                      checked={detailsVisible}
                      onChange={toggleToonBudgetDetails}
                      slotProps={{ input: { 'aria-label': 'controlled' } }}
                    />}
                    sx={{ mr: 0 }}
                    label={
                      <Box display="flex" fontSize={'0.875rem'}>
                        Toon budget toelichting
                      </Box>
                    } />
                </FormGroup>
              </Grid> */}

              <Grid container columns={{ sm: 1, lg: 2 }} onClick={toggleToonBudgetDetails} >
                {gekozenPeriode &&
                  <Grid size={1}>
                    <SamenvattingGrafiek
                      peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                      periode={gekozenPeriode}
                      budgetSamenvatting={stand.budgetSamenvatting}
                      detailsVisible={detailsVisible} />
                  </Grid>}

                {gekozenPeriode &&
                  rekeningen
                    .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                    .filter(rekening => rekening.budgetten.length >= 1)
                    .map(rekening => (
                      <Grid size={1}
                        key={rekening.id}
                        sx={{ cursor: 'pointer' }}
                      >
                        <BudgetGrafiek
                          peilDatum={dayjs(stand.peilDatum).isAfter(dayjs()) ? dayjs() : dayjs(stand.peilDatum)}
                          periode={gekozenPeriode}
                          rekening={rekening}
                          budgetten={stand.budgettenOpDatum.filter(b => b.rekeningNaam === rekening.naam)}
                          geaggregeerdBudget={stand.geaggregeerdeBudgettenOpDatum.find(b => b.rekeningNaam === rekening.naam)}
                          detailsVisible={detailsVisible} />
                      </Grid>
                    ))}

                {gekozenPeriode && stand.aflossingenOpDatum.length > 0 &&
                  <Grid size={1}
                    sx={{ cursor: 'pointer' }}
                  >
                    <AflossingGrafiek
                      visualisatie='icon-sm'
                      peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                      periode={gekozenPeriode}
                      aflossingen={stand.aflossingenOpDatum}
                      geaggregeerdeAflossingen={stand.geaggregeerdeAflossingenOpDatum} />
                  </Grid>
                }
                {/* {gekozenPeriode &&
                  rekeningen
                    .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                    .filter(rekening => rekening.budgetten.length >= 1)
                    .map((rekening) => (
                      rekening.naam === toonBarGrafiek && (
                        <BudgetGrafiek
                          key={rekening.id}
                          visualisatie='bar'
                          rekening={rekening}
                          peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                          periode={gekozenPeriode}
                          budgetten={stand.budgettenOpDatum.filter(b => b.rekeningNaam === rekening.naam)}
                          geaggregeerdBudget={stand.geaggregeerdeBudgettenOpDatum.find(b => b.rekeningNaam === rekening.naam)} 
                          detailsVisible={detailsVisible}                        />)
                    ))} */}

                {gekozenPeriode && stand.aflossingenOpDatum.length > 0 && 
                  <AflossingGrafiek
                    visualisatie='bar'
                    peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                    periode={gekozenPeriode}
                    aflossingen={stand.aflossingenOpDatum}
                    geaggregeerdeAflossingen={stand.geaggregeerdeAflossingenOpDatum} />
                }

              </Grid>
            </Grid>
            <Grid size={1} flexDirection={'column'} alignItems="start">
              <PeriodeSelect />
              <Resultaat
                title={'Stand van de geldrekeningen'}
                datum={stand.peilDatum}
                saldi={stand.balansOpDatum!.filter(saldo =>
                  rekeningen.filter(r => betaalmethodeRekeningSoorten.includes(r.rekeningSoort))
                    .map(r => r.naam).includes(saldo.rekeningNaam))} />
            </Grid>
          </Grid>

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
              <Grid sx={{ flexGrow: 1 }}>
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
              </Grid>
            </AccordionDetails>
          </Accordion>
        </>
      }
    </>
  )
}