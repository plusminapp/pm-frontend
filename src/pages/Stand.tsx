import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useState } from 'react';

import { useCustomContext } from '../context/CustomContext';
import Resultaat from '../components/Stand/Resultaat';
import type { Stand } from '../model/Saldo';
import dayjs from 'dayjs';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import SamenvattingGrafiek from '../components/Stand/SamenvattingGrafiek';
import StandGrafiek from '../components/Stand/StandGrafiek';
import {
  balansRekeningGroepSoorten,
  betaalmethodeRekeningGroepSoorten,
  betaalTabelRekeningGroepSoorten,
  BudgetType,
  RekeningGroepSoort,
  reserveRekeningGroepSoorten,
  resultaatRekeningGroepSoorten,
} from '../model/RekeningGroep';
import SpaarGrafiek from '../components/Stand/SpaarGrafiek';
import { BetalingsSoort } from '../model/Betaling';
import RekeningResultaat from '../components/Stand/RekeningResultaat';

export default function Stand() {
  const {
    gebruiker,
    gekozenPeriode,
    rekeningGroepPerBetalingsSoort,
    stand,
    vandaag
  } = useCustomContext();

  const [toonDebug, setToonDebug] = useState(
    localStorage.getItem('toonDebug') === 'true',
  );
  const toggleToonDebug = () => {
    localStorage.setItem('toonDebug', (!toonDebug).toString());
    setToonDebug(!toonDebug);
  };

  const periodeIsVoorbij =
    (gekozenPeriode &&
      dayjs(gekozenPeriode.periodeEindDatum).endOf('day').isBefore(dayjs(vandaag))) ??
    true;

  const [detailsVisible, setDetailsVisible] = useState<string | null>(
    localStorage.getItem('toonBudgetDetails'),
  );
  const toggleToonBudgetDetails = (naam: string) => {
    if (detailsVisible === naam) {
      naam = '';
    }
    localStorage.setItem('toonBudgetDetails', naam);
    setDetailsVisible(naam);
  };

  const berekenPeriodeNaam = () => {
    if (gekozenPeriode?.periodeStatus.toLowerCase() === 'huidig') {
      const dagenGeleden = dayjs(vandaag).diff(
        dayjs(stand?.datumLaatsteBetaling),
        'day',
      );
      if (dagenGeleden === 0) {
        return 'tot en met vandaag';
      }
      if (dagenGeleden === 1) {
        return 'tot en met gisteren';
      } else if (dagenGeleden < 7) {
        return `tot en met ${dagenGeleden} dagen geleden`;
      }
      return dayjs(stand?.datumLaatsteBetaling).format('D MMMM') ?? 'onbekend';
    }
    const zelfdeJaar = dayjs(gekozenPeriode?.periodeStartDatum).isSame(
      dayjs(gekozenPeriode?.periodeEindDatum),
      'year',
    );
    const maandStart = zelfdeJaar
      ? dayjs(gekozenPeriode?.periodeStartDatum).format('MMMM')
      : dayjs(gekozenPeriode?.periodeStartDatum).format('MMMM YYYY');
    const maandEinde = dayjs(gekozenPeriode?.periodeEindDatum).format(
      'MMMM YYYY',
    );
    return `periode ${maandStart}/${maandEinde}`;
  };
  const aantalDagenResterend =
    dayjs(gekozenPeriode?.periodeEindDatum).diff(dayjs(vandaag), 'day') + 1;

  return (
    <>
      {stand !== undefined && (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Hi {gebruiker?.bijnaam}, hoe is 't?
          </Typography>
          <Grid
            container
            spacing={2}
            columns={{ xs: 1, md: 3 }}
            justifyContent="space-between"
          >
            <Grid
              size={2}
              sx={{ boxShadow: { sm: 0, md: 3 }, p: { sm: 0, md: 2 } }}
            >
              <Typography variant="h6">
                Samenvatting {berekenPeriodeNaam()}
              </Typography>
              <Typography variant="body2">
                {periodeIsVoorbij
                  ? 'De periode is afgelopen.'
                  : stand.datumLaatsteBetaling
                    ? `Laatste betaling geregistreerd op ${dayjs(stand.datumLaatsteBetaling).format('D MMMM')}.`
                    : 'Er is nog geen betaling geregistreerd.'}
                {!periodeIsVoorbij &&
                  ` Er ${aantalDagenResterend == 1 ? 'is' : 'zijn'} nog ${aantalDagenResterend} ${aantalDagenResterend == 1 ? 'dag' : 'dagen'} tot het einde van de periode.`}
              </Typography>

              <Grid
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        sx={{ transform: 'scale(0.6)' }}
                        checked={toonDebug}
                        onChange={toggleToonDebug}
                        slotProps={{ input: { 'aria-label': 'controlled' } }}
                      />
                    }
                    sx={{ mr: 0 }}
                    label={
                      <Box display="flex" fontSize={'0.875rem'}>
                        Toon debug info
                      </Box>
                    }
                  />
                </FormGroup>
              </Grid>

              <Grid
                container
                flexDirection={'row'}
                columns={{ sm: 1, md: 2 }}
                sx={{ mb: 2 }}
              >
                <Grid sx={{ width: '100%' }}>
                  {gekozenPeriode && (
                    <Box
                      onClick={() => toggleToonBudgetDetails('samenvatting')}
                    >
                      <SamenvattingGrafiek
                        periodeIsVoorbij={periodeIsVoorbij ?? true}
                        periode={gekozenPeriode}
                        resultaatSamenvattingOpDatum={
                          stand.resultaatSamenvattingOpDatum
                        }
                        detailsVisible={detailsVisible === 'samenvatting'}
                      />
                    </Box>
                  )}

                  {gekozenPeriode &&
                    rekeningGroepPerBetalingsSoort
                      .flatMap((rgpb) => rgpb.rekeningGroepen)
                      .filter((rekeningGroep) =>
                        betaalTabelRekeningGroepSoorten.includes(
                          rekeningGroep.rekeningGroepSoort,
                        ),
                      )
                      .filter(
                        (rekeningGroep) => rekeningGroep.budgetType != 'SPAREN',
                      )
                      .sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
                      // .filter(rekeningGroep => rekeningGroep.rekeningen.length >= 1)
                      .map((rekeningGroep) => (
                        <Box
                          key={rekeningGroep.id}
                          onClick={() =>
                            toggleToonBudgetDetails(rekeningGroep.naam)
                          }
                          sx={{ cursor: 'pointer' }}
                        >
                          <StandGrafiek
                            peilDatum={
                              dayjs(stand.peilDatum).isAfter(dayjs(vandaag))
                                ? dayjs(vandaag)
                                : dayjs(stand.peilDatum)
                            }
                            periode={gekozenPeriode}
                            rekeningGroep={rekeningGroep}
                            resultaatOpDatum={stand.resultaatOpDatum.filter(
                              (b) => b.rekeningGroepNaam === rekeningGroep.naam,
                            )}
                            geaggregeerdResultaatOpDatum={stand.geaggregeerdResultaatOpDatum.find(
                              (b) => b.rekeningGroepNaam === rekeningGroep.naam,
                            )}
                            toonDebug={
                              toonDebug && detailsVisible === rekeningGroep.naam
                            }
                            detailsVisible={
                              detailsVisible === rekeningGroep.naam
                            }
                          />
                        </Box>
                      ))}

                  {gekozenPeriode &&
                    rekeningGroepPerBetalingsSoort
                      .filter(
                        (rgpb) =>
                          rgpb.betalingsSoort === BetalingsSoort.opnemen,
                      )
                      .flatMap((rgpb) => rgpb.rekeningGroepen)
                      .filter(
                        (rekeningGroep) =>
                          rekeningGroep.rekeningGroepSoort ===
                          RekeningGroepSoort.spaarrekening,
                      )
                      .sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
                      // .filter(rekeningGroep => rekeningGroep.rekeningen.length >= 1)
                      .map((rekeningGroep) => (
                        <Box
                          key={rekeningGroep.id}
                          onClick={() =>
                            toggleToonBudgetDetails(rekeningGroep.naam)
                          }
                        >
                          <SpaarGrafiek
                            peilDatum={
                              dayjs(stand.peilDatum).isAfter(dayjs(vandaag))
                                ? dayjs(vandaag)
                                : dayjs(stand.peilDatum)
                            }
                            periode={gekozenPeriode}
                            rekeningGroep={rekeningGroep}
                            resultaatOpDatum={stand.resultaatOpDatum.filter(
                              (b) => b.rekeningGroepNaam === rekeningGroep.naam,
                            )}
                            geaggregeerdResultaatOpDatum={stand.geaggregeerdResultaatOpDatum.find(
                              (b) => b.rekeningGroepNaam === rekeningGroep.naam,
                            )}
                            toonDebug={
                              toonDebug && detailsVisible === rekeningGroep.naam
                            }
                            detailsVisible={
                              detailsVisible === rekeningGroep.naam
                            }
                          />
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
                  .filter((saldo) =>
                    betaalmethodeRekeningGroepSoorten.includes(
                      saldo.rekeningGroepSoort as RekeningGroepSoort,
                    ),
                  )
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((saldo) => ({
                    ...saldo,
                    bedrag: saldo.openingsBalansSaldo + saldo.betaling,
                  }))}
              />
              <Resultaat
                title={'Stand van de reserve'}
                datum={stand.peilDatum}
                saldi={stand.geaggregeerdResultaatOpDatum
                  .filter((saldo) =>
                    reserveRekeningGroepSoorten.includes(
                      saldo.rekeningGroepSoort as RekeningGroepSoort,
                    ),
                  )
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((saldo) => ({
                    ...saldo,
                    bedrag:
                      saldo.openingsReserveSaldo +
                      saldo.reservering -
                      saldo.betaling,
                  }))}
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
              <Grid sx={{ flexGrow: 1 }}>
                <Grid
                  container
                  spacing={{ xs: 2, md: 3 }}
                  columns={{ xs: 1, md: 3 }}
                >
                  <Grid size={1}>
                    <Resultaat
                      title={'Opening'}
                      datum={stand.periodeStartDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter((saldo) =>
                          balansRekeningGroepSoorten.includes(
                            saldo.rekeningGroepSoort as RekeningGroepSoort,
                          ),
                        )
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((saldo) => ({
                          ...saldo,
                          bedrag: saldo.openingsBalansSaldo,
                        }))}
                    />
                  </Grid>
                  <Grid size={1}>
                    <Resultaat
                      title={'Mutaties per'}
                      datum={stand.peilDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter((saldo) =>
                          balansRekeningGroepSoorten.includes(
                            saldo.rekeningGroepSoort as RekeningGroepSoort,
                          ),
                        )
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((saldo) => ({ ...saldo, bedrag: saldo.betaling }))}
                    />
                  </Grid>
                  <Grid size={1}>
                    <Resultaat
                      title={'Stand'}
                      datum={stand.peilDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter((saldo) =>
                          balansRekeningGroepSoorten.includes(
                            saldo.rekeningGroepSoort as RekeningGroepSoort,
                          ),
                        )
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((saldo) => ({
                          ...saldo,
                          bedrag: saldo.openingsBalansSaldo + saldo.betaling,
                        }))}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={{ xs: 2, md: 3 }}
                  columns={{ xs: 1, md: 3 }}
                >
                  <Grid size={1}>
                    <Resultaat
                      title={'Inkomsten en uitgaven'}
                      datum={stand.peilDatum}
                      saldi={stand.geaggregeerdResultaatOpDatum
                        .filter((saldo) =>
                          resultaatRekeningGroepSoorten.includes(
                            saldo.rekeningGroepSoort as RekeningGroepSoort,
                          ),
                        )
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((saldo) => ({
                          ...saldo,
                          bedrag: -saldo.betaling,
                        }))}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={{ xs: 2, md: 3 }}
                  columns={{ xs: 1, md: 3 }}
                >
                  <Grid size={1}>
                    <RekeningResultaat
                      title={'Spaarpotten opening'}
                      datum={stand.periodeStartDatum}
                      saldi={stand.resultaatOpDatum
                        .filter(
                          (saldo) => saldo.budgetType === BudgetType.sparen,
                        )
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((saldo) => ({
                          ...saldo,
                          bedrag: saldo.openingsReserveSaldo,
                        }))}
                    />
                  </Grid>
                  <Grid size={1}>
                    <RekeningResultaat
                      title={'Mutaties per'}
                      datum={stand.peilDatum}
                      saldi={stand.resultaatOpDatum
                        .filter(
                          (saldo) => saldo.budgetType === BudgetType.sparen,
                        )
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((saldo) => ({
                          ...saldo,
                          bedrag: saldo.reservering - saldo.betaling,
                        }))}
                    />
                  </Grid>
                  <Grid size={1}>
                    <RekeningResultaat
                      title={'Stand'}
                      datum={stand.peilDatum}
                      saldi={stand.resultaatOpDatum
                        .filter(
                          (saldo) => saldo.budgetType === BudgetType.sparen,
                        )
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((saldo) => ({
                          ...saldo,
                          bedrag:
                            saldo.openingsReserveSaldo +
                            saldo.reservering -
                            saldo.betaling,
                        }))}
                    />
                  </Grid>
                </Grid>
              </Grid>
              {/* {JSON.stringify(stand.balansOpDatum)} */}
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </>
  );
}
