import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import { useCustomContext } from "../context/CustomContext";
import { useAuthContext } from "@asgardeo/auth-react";
import Resultaat from "../components/Stand/Resultaat";
import type { Stand } from "../model/Saldo";
import dayjs from "dayjs";
import { PeriodeSelect } from "../components/Periode/PeriodeSelect";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import SamenvattingGrafiek from "../components/Stand/SamenvattingGrafiek";
import StandGrafiek from "../components/Stand/StandGrafiek";
import { balansRekeningGroepSoorten, betaalmethodeRekeningGroepSoorten, betaalTabelRekeningGroepSoorten, RekeningGroepSoort, resultaatRekeningGroepSoorten } from "../model/RekeningGroep";

export default function Stand() {

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, gekozenPeriode, rekeningGroepPerBetalingsSoort } = useCustomContext();

  // const [betalingen, setBetalingen] = useState<BetalingDTO[]>([])
  const [stand, setStand] = useState<Stand | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);

  const [toonDebug, setToonDebug] = useState(localStorage.getItem('toonDebug') === 'true');
  const toggleToonDebug = () => {
    localStorage.setItem('toonDebug', (!toonDebug).toString());
    setToonDebug(!toonDebug);
  };

  const periodeIsVoorbij = gekozenPeriode && dayjs(gekozenPeriode.periodeEindDatum).isBefore(dayjs());

  const [detailsVisible, setDetailsVisible] = useState<string | null>(localStorage.getItem('toonBudgetDetails'));
  const toggleToonBudgetDetails = (naam: string) => {
    if (detailsVisible === naam) { naam = '' }
    localStorage.setItem('toonBudgetDetails', naam)
    setDetailsVisible(naam);
  };

  // const fetchBetalingen = useCallback(async () => {
  //   let token
  //   try {
  //     token = await getIDToken();
  //   } catch (error) {
  //     console.error("Error fetching token", error);
  //     setIsLoading(false);
  //   }
  //   if (actieveHulpvrager && token && gekozenPeriode) {
  //     setIsLoading(true);
  //     const id = actieveHulpvrager.id
  //     const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}?fromDate=${gekozenPeriode.periodeStartDatum}&toDate=${gekozenPeriode.periodeEindDatum}&size=-1`, {
  //       method: "GET",
  //       headers: {
  //         "Authorization": `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     setIsLoading(false);
  //     if (response.ok) {
  //       const result = await response.json() as { data: { content: BetalingDTO[] } };
  //       setBetalingen(result.data.content);
  //     } else {
  //       console.error("Failed to fetch betalingen", response.status);
  //     }
  //   }
  // }, [getIDToken, actieveHulpvrager, gekozenPeriode]);

  // useEffect(() => {
  //   fetchBetalingen();
  // }, [fetchBetalingen]);

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
        const response = await fetch(`/api/v1/stand/hulpvrager/${id}/datum/${datum}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setStand(result);
        } else {
          console.error("Failed to fetch data", response.status);
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, gekozenPeriode, getIDToken]);

  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  };

  const berekenPeriodeNaam = () => {
    if (gekozenPeriode?.periodeStatus.toLowerCase() === 'huidig') {
      const dagenGeleden = dayjs().diff(dayjs(stand?.datumLaatsteBetaling), 'day');
      if (dagenGeleden === 0) {
        return 'tot en met vandaag';
      }
      if (dagenGeleden === 1) {
        return 'tot en met gisteren';
      }
      else if (dagenGeleden < 7) {
        return `tot en met ${dagenGeleden} dagen geleden`;
      }
      return dayjs(stand?.datumLaatsteBetaling).format('D MMMM') ?? 'onbekend';
    };
    const zelfdeJaar = dayjs(gekozenPeriode?.periodeStartDatum).isSame(dayjs(gekozenPeriode?.periodeEindDatum), 'year');
    const maandStart = zelfdeJaar ? dayjs(gekozenPeriode?.periodeStartDatum).format('MMMM') : dayjs(gekozenPeriode?.periodeStartDatum).format('MMMM YYYY');
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
              <Typography variant='h6'>Samenvatting {berekenPeriodeNaam()}</Typography>
              <Typography variant='body2'>
                {periodeIsVoorbij ? 'De periode is afgelopen.' :
                  stand.datumLaatsteBetaling ? `Laatste betaling geregistreerd op ${dayjs(stand.datumLaatsteBetaling).format('D MMMM')}.` : 'Er is nog geen betaling geregistreerd.'}
                {!periodeIsVoorbij && ` Er zijn nog ${dayjs(gekozenPeriode?.periodeEindDatum).diff(dayjs(), 'day') + 1} dagen tot het einde van de periode.`}
              </Typography>


              <Grid display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <FormGroup>
                  <FormControlLabel control={
                    <Switch
                      sx={{ transform: 'scale(0.6)' }}
                      checked={toonDebug}
                      onChange={toggleToonDebug}
                      slotProps={{ input: { 'aria-label': 'controlled' } }}
                    />}
                    sx={{ mr: 0 }}
                    label={
                      <Box display="flex" fontSize={'0.875rem'}>
                        Toon debug info
                      </Box>
                    } />
                </FormGroup>
              </Grid>

              <Grid container flexDirection={'row'} columns={{ sm: 1, md: 2 }} sx={{ mb: 2 }}>
                <Grid sx={{ width: '100%' }}>
                  {gekozenPeriode &&
                    <Box onClick={() => toggleToonBudgetDetails('samenvatting')}>
                      <SamenvattingGrafiek
                        peilDatum={(dayjs(gekozenPeriode.periodeEindDatum)).isAfter(dayjs()) ? dayjs() : dayjs(gekozenPeriode.periodeEindDatum)}
                        periode={gekozenPeriode}
                        resultaatSamenvattingOpDatum={stand.resultaatSamenvattingOpDatum}
                        detailsVisible={detailsVisible === 'samenvatting'} />
                    </Box>}

                  {gekozenPeriode &&
                    rekeningGroepPerBetalingsSoort
                      .flatMap((rgpb) => (rgpb.rekeningGroepen))
                      .filter(rekeningGroep => betaalTabelRekeningGroepSoorten.includes(rekeningGroep.rekeningGroepSoort))
                      .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                      // .filter(rekeningGroep => rekeningGroep.rekeningen.length >= 1)
                      .map(rekeningGroep => (
                        <Box
                          key={rekeningGroep.id}
                          onClick={() => toggleToonBudgetDetails(rekeningGroep.naam)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <StandGrafiek
                            peilDatum={dayjs(stand.peilDatum).isAfter(dayjs()) ? dayjs() : dayjs(stand.peilDatum)}
                            periode={gekozenPeriode}
                            rekeningGroep={rekeningGroep}
                            resultaatOpDatum={stand.resultaatOpDatum.filter(b => b.rekeningGroepNaam === rekeningGroep.naam)}
                            geaggregeerdResultaatOpDatum={stand.geaggregeerdResultaatOpDatum.find(b => b.rekeningGroepNaam === rekeningGroep.naam)}
                            toonDebug={toonDebug && detailsVisible === rekeningGroep.naam}
                            detailsVisible={detailsVisible === rekeningGroep.naam} />
                        </Box>
                      ))}
                </Grid>
                {/* <Grid size={1} sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Box sx={{ pl: {sm: 0, md: '20px'}}}>
                    <InkomstenUitgavenTabel
                      isFilterSelectable={true}
                      isReadOnly={true}
                      actueleRekeningGroep={undefined}
                      onBetalingBewaardChange={() => { }}
                      onBetalingVerwijderdChange={() => { }}
                      betalingen={betalingen} />
                  </Box>
                </Grid> */}
              </Grid>
            </Grid>
            <Grid size={1} flexDirection={'column'} alignItems="start">
              <PeriodeSelect />
              <Resultaat
                title={'Stand van de geldrekeningen'}
                datum={stand.peilDatum}
                saldi={stand.geaggregeerdResultaatOpDatum
                  .filter(saldo => betaalmethodeRekeningGroepSoorten.includes(saldo.rekeningGroepSoort as RekeningGroepSoort))
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map(saldo => ({ ...saldo, bedrag: saldo.openingsSaldo + saldo.budgetBetaling }))}
              />
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
                {/* <Grid size={1} alignItems={{ xs: 'start', md: 'end' }} sx={{ mb: '12px', display: 'flex' }}>
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
                </Grid> */}
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 2, md: 4 }}>
                  <Grid size={1}>
                    <Resultaat
                      title={'Opening'}
                      datum={stand.periodeStartDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter(saldo => balansRekeningGroepSoorten.includes(saldo.rekeningGroepSoort as RekeningGroepSoort))
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(saldo => ({ ...saldo, bedrag: saldo.openingsSaldo }))}
                    />
                  </Grid>
                  <Grid size={1}>
                    <Resultaat
                      title={'Inkomsten en uitgaven'}
                      datum={stand.peilDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter(saldo => resultaatRekeningGroepSoorten.includes(saldo.rekeningGroepSoort as RekeningGroepSoort))
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(saldo => ({ ...saldo, bedrag: -saldo.budgetBetaling }))}
                    />
                  </Grid>
                  <Grid size={1}>
                    <Resultaat
                      title={'Mutaties per'}
                      datum={stand.peilDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter(saldo => balansRekeningGroepSoorten.includes(saldo.rekeningGroepSoort as RekeningGroepSoort))
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(saldo => ({ ...saldo, bedrag: saldo.budgetBetaling }))}
                    />

                  </Grid>
                  <Grid size={1}>
                    <Resultaat
                      title={'Stand'}
                      datum={stand.peilDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter(saldo => balansRekeningGroepSoorten.includes(saldo.rekeningGroepSoort as RekeningGroepSoort))
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(saldo => ({ ...saldo, bedrag: saldo.openingsSaldo + saldo.budgetBetaling }))}
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* {JSON.stringify(stand.balansOpDatum)} */}
            </AccordionDetails>
          </Accordion>
        </>
      }
    </>
  )
}