import React, { Fragment, useCallback, useEffect } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAuthContext } from '@asgardeo/auth-react';

import { useCustomContext } from '../context/CustomContext';
import {
  bestemmingBetalingsSoorten,
  Betaling,
  currencyFormatter,
  ontdubbelBetalingsSoorten,
} from '../model/Betaling';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import {
  BudgetType,
  profielRekeningGroepSoorten,
  RekeningGroepSoort,
  balansRekeningGroepSoorten,
} from '../model/RekeningGroep';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { InkomstenIcon } from '../icons/Inkomsten';
import { UitgavenIcon } from '../icons/Uitgaven';
import { InternIcon } from '../icons/Intern';
import dayjs from 'dayjs';
import { RekeningDTO } from '../model/Rekening';
import { isPeriodeOpen } from '../model/Periode';
import { CashFlowGrafiek } from '../components/CashFlow/Graph/CashFlowGrafiek';
import { usePlusminApi } from '../api/plusminApi';
import Resultaat from '../components/Stand/Resultaat';
import { ReserveringTabel } from '../components/Profiel/ReserveringTabel';

const Profiel: React.FC = () => {
  const { state } = useAuthContext();

  const {
    gebruiker,
    actieveAdministratie,
    rekeningGroepPerBetalingsSoort,
    gekozenPeriode,
    stand,
  } = useCustomContext();
  const { getOngeldigeBetalingenVooradministratie } = usePlusminApi();

  const [ongeldigeBetalingen, setOngeldigeBetalingen] = React.useState<
    Betaling[]
  >([]);

  const reserveringBuffer = stand?.geaggregeerdResultaatOpDatum.find(
    (saldo) => saldo.rekeningGroepSoort === 'RESERVERING_BUFFER',
  );

  const openingsReservePotjesVoorNuSaldo =
    stand?.resultaatSamenvattingOpDatum.openingsReservePotjesVoorNuSaldo;
  const reserveringsSaldoPotjesVanNu = stand?.geaggregeerdResultaatOpDatum
    .filter(
      (saldo) =>
        (saldo.rekeningGroepSoort === 'UITGAVEN' &&
          saldo.budgetType !== BudgetType.sparen) ||
        saldo.rekeningGroepSoort === 'AFLOSSING',
    )
    .reduce(
      (acc, saldo) =>
        acc + saldo.openingsReserveSaldo + saldo.reservering - saldo.betaling,
      0,
    );
  const actueleStand =
    (reserveringBuffer?.openingsReserveSaldo ?? 0) +
    (reserveringBuffer?.reservering ?? 0) +
    (reserveringsSaldoPotjesVanNu ?? 0);
  const verwachteInkomsten = stand?.geaggregeerdResultaatOpDatum
    .filter((saldo) => saldo.rekeningGroepSoort === 'INKOMSTEN')
    .reduce((acc, saldo) => acc + saldo.restMaandBudget, 0);
  const verwachteUitgaven = stand?.geaggregeerdResultaatOpDatum
    .filter(
      (saldo) =>
        (saldo.rekeningGroepSoort === 'UITGAVEN' &&
          saldo.budgetType !== BudgetType.sparen) ||
        saldo.rekeningGroepSoort === 'AFLOSSING',
    )
    .reduce((acc, saldo) => acc + saldo.restMaandBudget, 0);

  const fetchfetchOngeldigeBetalingen = useCallback(async () => {
    if (!actieveAdministratie) {
      return;
    }
    const ongeldigeBetalingen =
      await getOngeldigeBetalingenVooradministratie(actieveAdministratie);
    setOngeldigeBetalingen(ongeldigeBetalingen);
  }, [actieveAdministratie, getOngeldigeBetalingenVooradministratie]);

  useEffect(() => {
    if (actieveAdministratie) {
      fetchfetchOngeldigeBetalingen();
    }
  }, [actieveAdministratie, fetchfetchOngeldigeBetalingen]);

  const creeerBudgetTekst = (): string => {
    const inkomsten = rekeningGroepPerBetalingsSoort
      .filter((rgpb) => rgpb.betalingsSoort === 'INKOMSTEN')
      .flatMap((rgpb) => rgpb.rekeningGroepen)
      .flatMap((rg) => rg.rekeningen)
      .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0);
    const uitgaven = rekeningGroepPerBetalingsSoort
      .filter((rgpb) => rgpb.betalingsSoort === 'UITGAVEN')
      .flatMap((rgpb) => rgpb.rekeningGroepen)
      .filter((rg) => rg.budgetType !== 'SPAREN')
      .flatMap((rg) => rg.rekeningen)
      .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0);
    const aflossen = rekeningGroepPerBetalingsSoort
      .filter((rgpb) => rgpb.betalingsSoort === 'AFLOSSEN')
      .flatMap((rgpb) => rgpb.rekeningGroepen)
      .flatMap((rg) => rg.rekeningen)
      .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0);
    const sparen = rekeningGroepPerBetalingsSoort
      .filter((rgpb) => rgpb.betalingsSoort === 'UITGAVEN')
      .flatMap((rgpb) => rgpb.rekeningGroepen)
      .filter((rg) => rg.budgetType === 'SPAREN')
      .flatMap((rg) => rg.rekeningen)
      .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0);
    const budgetTekst = `In: ${currencyFormatter.format(inkomsten)}, Uit: ${currencyFormatter.format(uitgaven)}, Aflossen: ${currencyFormatter.format(aflossen)}, Sparen: ${currencyFormatter.format(sparen)}, Over: ${currencyFormatter.format(inkomsten - uitgaven - aflossen - sparen)} per maand. `;
    return budgetTekst;
  };

  const creeerOngeldigeBetalingenHeader = (): string => {
    let ongeldigeBetalingenHeader;
    switch (ongeldigeBetalingen.length) {
      case 0: {
        ongeldigeBetalingenHeader = 'Er zijn geen ongeldige betalingen.';
        break;
      }
      case 1: {
        ongeldigeBetalingenHeader = 'Er is 1 ongeldige betaling.';
        break;
      }
      default: {
        ongeldigeBetalingenHeader = `Er zijn ${ongeldigeBetalingen.length} ongeldige betalingen.`;
        break;
      }
    }
    return ongeldigeBetalingenHeader;
  };

  const formatAmount = (amount: number): string => {
    if (amount === 0 || amount === undefined)
      return (0).toLocaleString('nl-NL', {
        style: 'currency',
        currency: 'EUR',
      });
    return amount.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const creeerOngeldigeBetalingenTekst = (betaling: Betaling): string => {
    const naDatum = dayjs(betaling.bron?.vanPeriode?.periodeStartDatum);
    const totEnMetDatum = dayjs(
      betaling.bestemming?.totEnMetPeriode?.periodeEindDatum,
    );
    const boekingsdatum = dayjs(betaling.boekingsdatum);

    const geldigheid = boekingsdatum.isBefore(naDatum)
      ? `na ${dayjs(betaling.bron?.vanPeriode?.periodeStartDatum).format('D MMMM')}`
      : boekingsdatum.isAfter(totEnMetDatum)
        ? `tot ${dayjs(betaling.bron?.totEnMetPeriode?.periodeEindDatum).format('D MMMM')}`
        : '';
    return `${formatAmount(betaling.bedrag)} met omschrijving ${betaling.omschrijving} op ${dayjs(betaling.boekingsdatum).format('D MMMM')} naar budget ${betaling.bron?.naam} dat geldig is ${geldigheid}.`;
  };

  const creeerReserveringsHorizonTekst = () => {
    return (
      <>
        De potjes zijn gevuld tot en met{' '}
        {dayjs(stand?.reserveringsHorizon).format('D MMMM')}.
        {dayjs(stand?.reserveringsHorizon).isBefore(dayjs(stand?.budgetHorizon))
          ? ` Ze kunnen worden gevuld tot en met ${dayjs(stand?.budgetHorizon).format('D MMMM')}.`
          : ''}
      </>
    );
  };

  const berekenCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'INKOMSTEN':
        return <InkomstenIcon />;
      case 'UITGAVEN':
      case 'AFLOSSEN':
      case 'BESTEDEN':
        return <UitgavenIcon />;
      case 'INCASSO_CREDITCARD':
      case 'OPNEMEN':
      case 'SPAREN':
      case 'OPNEMEN_CONTANT':
      case 'STORTEN_CONTANT':
        return <InternIcon />;
      default:
        return <></>;
    }
  };

  const berekenVariabiliteit = (rekening: RekeningDTO): string => {
    // const betalingWordtVerwacht = !rekening.maanden || (gekozenPeriode && rekening.maanden?.includes(dagInPeriode(rekening.budgetBetaalDag ?? 0, gekozenPeriode).month() + 1)) ? '' : ' X'
    const betalingWordtVerwacht = rekening.maanden
      ? `; ${rekening.maanden.join(', ')}`
      : '';
    const variabiliteit = rekening.budgetVariabiliteit
      ? ` ±${rekening.budgetVariabiliteit}%`
      : '';
    return `${variabiliteit}${betalingWordtVerwacht}`;
  };

  return (
    <>
      {!state.isAuthenticated && (
        <Typography variant="h4" sx={{ mb: '25px' }}>
          Je moet eerst inloggen ...
        </Typography>
      )}
      {state.isAuthenticated && (
        <>
          {/* periodes */}
          <PeriodeSelect />

          {stand && (
            <Accordion>
              <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                <Typography>
                  <strong>Saldi</strong> van de betaalmiddelen op{' '}
                  {dayjs(stand.peilDatum).format('D MMMM')}
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
                          .map((saldo) => ({
                            ...saldo,
                            bedrag: saldo.betaling,
                          }))}
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
                </Grid>
                {/* {JSON.stringify(stand.balansOpDatum)} */}
              </AccordionDetails>
            </Accordion>
          )}

          {/* de potjes obv de stand*/}
          {rekeningGroepPerBetalingsSoort &&
            rekeningGroepPerBetalingsSoort.length >= 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                  <Typography>
                    <strong>Potjes</strong> <br />
                    Openingsstand:{' '}
                    {formatAmount(
                      (reserveringBuffer?.openingsReserveSaldo ?? 0) +
                        (openingsReservePotjesVoorNuSaldo ?? 0),
                    )}
                    &nbsp; = openingssaldo buffer:{' '}
                    {formatAmount(reserveringBuffer?.openingsReserveSaldo ?? 0)}
                    &nbsp; + openingsReservePotjesVoorNuSaldo:{' '}
                    {formatAmount(openingsReservePotjesVoorNuSaldo ?? 0)}
                    <br />
                    Actuele stand{' '}
                    {formatAmount(actueleStand)}
                    &nbsp; = openingssaldo buffer:{' '}
                    {formatAmount(reserveringBuffer?.openingsReserveSaldo ?? 0)}
                    &nbsp; + inkomsten - reservering:{' '}
                    {formatAmount(reserveringBuffer?.reservering ?? 0)}&nbsp; +
                    huidige reserve in potjes voor nu:{' '}
                    {formatAmount(reserveringsSaldoPotjesVanNu ?? 0)}
                    <br />
                    Verwachte eindstand{' '}
                    {formatAmount(actueleStand + (verwachteInkomsten ?? 0) - (verwachteUitgaven ?? 0))}
                    &nbsp; = actuele stand:{' '}
                    {formatAmount(actueleStand ?? 0)}
                    &nbsp; + verwachte inkomsten:{' '}
                    {formatAmount(verwachteInkomsten ?? 0)}
                    &nbsp; - verwachte uitgaven:{' '}
                    {formatAmount(verwachteUitgaven ?? 0)}
                    <br />
                    {creeerReserveringsHorizonTekst()}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ReserveringTabel />
                </AccordionDetails>
              </Accordion>
            )}

          {gekozenPeriode && actieveAdministratie && <CashFlowGrafiek />}

          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>
                <strong>Periodes</strong>. De periode wisseldag voor{' '}
                {actieveAdministratie?.naam} is de{' '}
                {actieveAdministratie?.periodeDag}e.
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <PeriodeSelect isProfiel />
            </AccordionDetails>
          </Accordion>

          {/* de kolommen van het kasboek en potjes*/}
          {rekeningGroepPerBetalingsSoort &&
            rekeningGroepPerBetalingsSoort.length >= 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                  <Typography>
                    <strong>Potjes</strong> en bijbehorende{' '}
                    <strong>Budgetten</strong>.
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{creeerBudgetTekst()}</Typography>
                  {rekeningGroepPerBetalingsSoort.length > 0 && (
                    <TableContainer
                      component={Paper}
                      sx={{ maxWidth: 'xl', m: 'auto', mt: '10px' }}
                    >
                      <Table sx={{ width: '100%' }} aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Kolomkop</TableCell>
                            <TableCell>Potjes (gekoppelde budgetten)</TableCell>
                            <TableCell>Betaalmethoden</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <>
                            {rekeningGroepPerBetalingsSoort
                              .filter((rgpb) =>
                                ontdubbelBetalingsSoorten.includes(
                                  rgpb.betalingsSoort,
                                ),
                              )
                              .flatMap((rgpb) => rgpb.rekeningGroepen)
                              .filter((rg) =>
                                profielRekeningGroepSoorten.includes(
                                  rg.rekeningGroepSoort,
                                ),
                              )
                              .filter(
                                (value, index, self) =>
                                  self.indexOf(value) === index,
                              )
                              .map((rekeningGroep) => (
                                <Fragment key={rekeningGroep.naam}>
                                  <TableRow
                                    sx={{
                                      '&:last-child td, &:last-child th': {
                                        border: 0,
                                      },
                                    }}
                                    aria-haspopup="true"
                                  >
                                    <TableCell
                                      align="left"
                                      size="small"
                                      sx={{ p: '6px' }}
                                    >
                                      {rekeningGroep.naam} (
                                      {rekeningGroep.rekeningGroepSoort.toLowerCase()}
                                      )
                                    </TableCell>
                                    <TableCell
                                      align="left"
                                      size="small"
                                      sx={{ p: '6px' }}
                                    >
                                      {rekeningGroep.rekeningen.length > 0 && (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              rekeningGroep.rekeningen
                                                .map((r) =>
                                                  gekozenPeriode &&
                                                  isPeriodeOpen(gekozenPeriode)
                                                    ? `${r.naam} (${currencyFormatter.format(Number(r.budgetBedrag))}/${r.budgetPeriodiciteit?.toLowerCase()}
                                 ${r.budgetPeriodiciteit?.toLowerCase() === 'week' ? `= ${currencyFormatter.format(r.budgetMaandBedrag ?? 0)}/maand` : ''}
                                 ${rekeningGroep.budgetType !== BudgetType.vast ? 'doorlopend' : 'op de ' + r.budgetBetaalDag + 'e'}${berekenVariabiliteit(r)})`
                                                    : `${r.naam} (${currencyFormatter.format(r.budgetMaandBedrag ?? 0)}/maand)`,
                                                )
                                                .join('<br />') +
                                              (rekeningGroep.rekeningen.length >
                                              0
                                                ? `<br />Totaal: ${currencyFormatter.format(rekeningGroep.rekeningen.reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0))}/maand`
                                                : ''),
                                          }}
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell
                                      align="left"
                                      size="small"
                                      sx={{ p: '6px' }}
                                    >
                                      {rekeningGroep.rekeningen.length > 0 &&
                                        gekozenPeriode &&
                                        isPeriodeOpen(gekozenPeriode) && (
                                          <span
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                rekeningGroep.rekeningen
                                                  .map((r) =>
                                                    r.betaalMethoden &&
                                                    r.betaalMethoden?.length > 0
                                                      ? `${r.betaalMethoden.map((m) => m.naam).join(', ')}`
                                                      : `geen betaalmethoden`,
                                                  )
                                                  .join('<br />') +
                                                '<br />&nbsp;',
                                            }}
                                          />
                                        )}
                                    </TableCell>
                                  </TableRow>
                                </Fragment>
                              ))}
                          </>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </AccordionDetails>
              </Accordion>
            )}

          {/* ongeldige betalingen */}
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>{creeerOngeldigeBetalingenHeader()}</Typography>
            </AccordionSummary>
            {ongeldigeBetalingen.length > 0 && (
              <AccordionDetails>
                <Table sx={{ width: '100%' }} aria-label="simple table">
                  <TableBody>
                    {ongeldigeBetalingen.map((betaling) => (
                      <TableRow
                        key={betaling.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                        aria-haspopup="true"
                      >
                        <TableCell align="left" size="small" sx={{ p: '6px' }}>
                          {creeerOngeldigeBetalingenTekst(betaling)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            )}
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Nieuwsgierig naar meer info over jezelf?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ my: '5px' }}>
                Je bent ingelogd met email "{state.username}".
                <br />
                Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen.
                <br />
                Je{' '}
                {gebruiker?.roles.length && gebruiker?.roles.length > 1
                  ? ' rollen zijn '
                  : ' rol is '}
                "
                {gebruiker?.roles
                  .map((x) => x.split('_')[1].toLowerCase())
                  .join('", "')}
                ".
              </Typography>
            </AccordionDetails>
          </Accordion>
        </>
      )}
      <>
        {actieveAdministratie !== gebruiker &&
          gebruiker?.roles.includes('ROLE_VRIJWILLIGER') && (
            <>
              <Typography variant="h4" sx={{ my: '25px' }}>
                De gekozen administratie is {actieveAdministratie?.naam}.
              </Typography>
              <Typography sx={{ mb: 1 }}>
                Samen met {actieveAdministratie?.naam} is de app als volgt
                ingericht.
              </Typography>
            </>
          )}
        {/* {checked && */}
        <>
          {/* voor de boekhouders onder ons: betalingsSoorten2Rekeningen */}
          {rekeningGroepPerBetalingsSoort && (
            <Accordion>
              <AccordionSummary
                sx={{ mb: 0 }}
                expandIcon={<ArrowDropDownIcon />}
              >
                <Typography>
                  Voor de <strong>boekhouders</strong> onder ons.
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ mt: 0 }}>
                <Typography>
                  PlusMin is een boekhoudpakket, gebaseerd op dubbel boekhouden.
                  Bij een betaling moet dus worden bepaald{' '}
                  <strong>
                    op welke rekeningen de betaling moet worden geboekt
                  </strong>
                  . We delen betalingen in eerste instantie in in drie
                  categorieën: <InkomstenIcon height={16} />
                  &nbsp;Inkomsten, <UitgavenIcon height={16} />
                  &nbsp;Uitgaven en <InternIcon height={16} />
                  &nbsp;Intern. Vervolgens vragen we, indien er meerdere
                  mogelijkheden zijn, de rekeningen uit die bij de betaling
                  horen. Hieronder staat de inrichting van de betalingen voor{' '}
                  {actieveAdministratie?.naam}:
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ maxWidth: 'xl', m: 'auto', mt: '10px' }}
                >
                  <Table sx={{ width: '100%' }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Betaling categorie</TableCell>
                        <TableCell>Soort betaling</TableCell>
                        <TableCell>Kolomkop</TableCell>
                        <TableCell>Bron (credit)</TableCell>
                        <TableCell>Bestemming (debet)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rekeningGroepPerBetalingsSoort.map(
                        (rgpb) =>
                          rgpb.rekeningGroepen &&
                          rgpb.rekeningGroepen.map(
                            (rekeningGroep) =>
                              rekeningGroep &&
                              rekeningGroep.rekeningen.map((rekening) => (
                                <TableRow key={rekening.id}>
                                  <TableCell
                                    align="left"
                                    size="small"
                                    sx={{ p: '6px', pl: '16px' }}
                                  >
                                    {berekenCategorieIcon(rgpb.betalingsSoort)}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    size="small"
                                    sx={{ p: '6px', pl: '16px' }}
                                  >
                                    {rgpb.betalingsSoort}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    size="small"
                                    sx={{ p: '6px', pl: '16px' }}
                                  >
                                    {rekeningGroep.naam}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    size="small"
                                    sx={{ p: '6px', pl: '16px' }}
                                  >
                                    {bestemmingBetalingsSoorten.includes(
                                      rgpb.betalingsSoort,
                                    )
                                      ? rekening.naam
                                      : rekening.betaalMethoden
                                          ?.map((rekening) => rekening.naam)
                                          .join(', ')}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    size="small"
                                    sx={{ p: '6px', pl: '16px' }}
                                  >
                                    {!bestemmingBetalingsSoorten.includes(
                                      rgpb.betalingsSoort,
                                    )
                                      ? rekening.naam
                                      : rekening.betaalMethoden
                                          ?.map((rekening) => rekening.naam)
                                          .join(', ')}
                                  </TableCell>
                                </TableRow>
                              )),
                          ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      </>
      {/* {JSON.stringify(rekeningGroepPerBetalingsSoort)} */}
    </>
  );
};

export default Profiel;
