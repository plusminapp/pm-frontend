import React, { Fragment, useCallback, useEffect } from 'react';

import { Accordion, AccordionDetails, AccordionSummary, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";

import { useCustomContext } from '../context/CustomContext';
import { Betaling, betalingsSoort2Categorie, betalingsSoortFormatter, currencyFormatter } from '../model/Betaling';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import { betaalmethodeRekeningGroepSoorten, blaatRekeningGroepSoorten, BudgetType, inkomstenRekeningGroepSoorten, RekeningGroepSoort, uitgavenRekeningGroepSoorten } from '../model/RekeningGroep';
// import { AflossingSamenvattingDTO } from '../model/Aflossing';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { InkomstenIcon } from '../icons/Inkomsten';
import { UitgavenIcon } from '../icons/Uitgaven';
import { InternIcon } from '../icons/Intern';
import dayjs from 'dayjs';

const Profiel: React.FC = () => {
  const { state, getIDToken } = useAuthContext();

  const { gebruiker, actieveHulpvrager, rekeningGroepen, betalingsSoorten2RekeningGroepen: betalingsSoorten2Rekeningen } = useCustomContext();

  const [ongeldigeBetalingen, setOngeldigeBetalingen] = React.useState<Betaling[]>([]);

  const fetchfetchOngeldigeBetalingen = useCallback(async () => {
    if (!actieveHulpvrager) {
      return;
    }
    let token
    try {
      token = await getIDToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
    }

    const responseOngeldigeBetalingen = await fetch(`/api/v1/betalingen/hulpvrager/${actieveHulpvrager.id}/valideer-budgetten`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
    const dataOngeldigeBetalingen = await responseOngeldigeBetalingen.json();
    setOngeldigeBetalingen(dataOngeldigeBetalingen as Betaling[]);

  }, [actieveHulpvrager, getIDToken]);
  useEffect(() => {
    if (actieveHulpvrager) {
      fetchfetchOngeldigeBetalingen();
    }
  }, [actieveHulpvrager, fetchfetchOngeldigeBetalingen]);


  const gebudgeteerdPerPeriode = (rekeningSoorten: RekeningGroepSoort[]) => {
    const bedrag = rekeningGroepen
      .filter(rekeningGroep => rekeningSoorten.includes(rekeningGroep.rekeningGroepSoort))
      .reduce((acc, rekeningGroep) => {
        const rekeningGroepBedrag = rekeningGroep.rekeningen.reduce((acc, rekening) => {
          return acc + Number(rekening.budgetMaandBedrag);
        }, 0);
        return acc + rekeningGroepBedrag;
      }
        , 0);
    return bedrag;
  };

  const heeftInkomstenRekeningen = () => {
    return rekeningGroepen?.some(RekeningGroep => RekeningGroep.rekeningen.length > 0 && RekeningGroep.rekeningGroepSoort === RekeningGroepSoort.inkomsten);
  }

  const heeftUitgaveRekeningen = () => {
    return rekeningGroepen?.some(RekeningGroep => RekeningGroep.rekeningen.length > 0 && RekeningGroep.rekeningGroepSoort === RekeningGroepSoort.uitgaven);
  }

  const creeerBudgetTekst = (): string => {
    const budgetTekst =
      (heeftInkomstenRekeningen() ? `De verwachte inkomsten zijn: ${currencyFormatter.format(gebudgeteerdPerPeriode(inkomstenRekeningGroepSoorten))}. ` :
        heeftUitgaveRekeningen() ? "Er zijn geen Inkomsten potjes, die moeten nog geconfigureerd worden. " : "Er zijn geen Inkomsten of Uitgave potjes, die moeten nog geconfigureerd worden.") +

      (heeftUitgaveRekeningen() ? `De verwachte uitgaven zijn: ${currencyFormatter.format(gebudgeteerdPerPeriode(uitgavenRekeningGroepSoorten))}. ` :
        heeftInkomstenRekeningen() ? "Er zijn geen Uitgave potjes, die moeten nog geconfigureerd worden. " : "") +
      (heeftInkomstenRekeningen() && heeftUitgaveRekeningen() ?
        `Verwacht over aan t einde van de maand: ${currencyFormatter.format(gebudgeteerdPerPeriode(inkomstenRekeningGroepSoorten) - gebudgeteerdPerPeriode(uitgavenRekeningGroepSoorten))}.` : "");
    return budgetTekst
  }

  const creeerOngeldigeBetalingenHeader = (): string => {
    let ongeldigeBetalingenHeader
    switch (ongeldigeBetalingen.length) {
      case 0: {
        ongeldigeBetalingenHeader = "Er zijn geen ongeldige betalingen.";
        break;
      }
      case 1: {
        ongeldigeBetalingenHeader = "Er is 1 ongeldige betaling.";
        break;
      }
      default: {
        ongeldigeBetalingenHeader = `Er zijn ${ongeldigeBetalingen.length} ongeldige betalingen.`;
        break;
      }
    }
    return ongeldigeBetalingenHeader
  }

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const creeerOngeldigeBetalingenTekst = (betaling: Betaling): string => {
    const naDatum = dayjs(betaling.budget?.vanPeriode?.periodeStartDatum);
    const totDatum = dayjs(betaling.budget?.totEnMetPeriode?.periodeEindDatum);
    const boekingsdatum = dayjs(betaling.boekingsdatum);

    const geldigheid = boekingsdatum.isBefore(naDatum) ? `na ${dayjs(betaling.budget?.vanPeriode?.periodeStartDatum).format('D MMMM')}` :
      boekingsdatum.isAfter(totDatum) ? `tot ${dayjs(betaling.budget?.totEnMetPeriode?.periodeEindDatum).format('D MMMM')}` : "";
    return `${formatAmount(betaling.bedrag.toString())} met omschrijving ${betaling.omschrijving} op ${dayjs(betaling.boekingsdatum).format('D MMMM')} naar budget ${betaling.budget?.budgetNaam} dat geldig is ${geldigheid}.`
  }

  const berekenCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'INKOMSTEN':
        return <InkomstenIcon />
      case 'UITGAVEN':
        return <UitgavenIcon />;
      case 'INTERN':
        return <InternIcon />;
      default: return <></>;
    }
  }

  return (
    <>
      {!state.isAuthenticated &&
        <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
      }
      {state.isAuthenticated &&
        <>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography sx={{ mt: '25px' }}>
                Nieuwsgierig naar meer info over jezelf?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ my: '5px' }}>Je bent ingelogd met email "{state.username}".<br />
                Je hebt "{gebruiker?.bijnaam}" als bijnaam gekozen.<br />
                Je {gebruiker?.roles.length && gebruiker?.roles.length > 1 ? " rollen zijn " : " rol is "}
                "{gebruiker?.roles.map(x => x.split('_')[1].toLowerCase()).join('", "')}".
              </Typography>
            </AccordionDetails>
          </Accordion>

          {gebruiker?.roles.includes("ROLE_HULPVRAGER") &&
            <Typography sx={{ my: '25px' }}>Je wordt begeleid door "{gebruiker.vrijwilligerBijnaam}".
            </Typography>
          }
        </>
      }
      <>
        {actieveHulpvrager === gebruiker && gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
          <>
            <Typography variant='h4' sx={{ my: '25px' }}>
              Dit is je eigen inrichting om te kunnen testen.
            </Typography>
          </>
        }
        {actieveHulpvrager !== gebruiker && gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
          <>
            <Typography variant='h4' sx={{ my: '25px' }}>
              De gekozen hulpvrager is {actieveHulpvrager?.bijnaam}.
            </Typography>
            <Typography sx={{ mb: 1 }}>
              Samen met {actieveHulpvrager?.bijnaam} is de app als volgt ingericht.
            </Typography>
          </>}
        {/* {checked && */}
        <>
          {actieveHulpvrager && actieveHulpvrager === gebruiker && gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
            <Typography sx={{ mb: 1 }}>
              Hieronder staat nu de inrichting voor jezelf (heb je zelf gedaan natuurlijk), dan kun je oefenen met de app zonder dat je de gegevens van een hulpvrager gebruikt. Eigenlijk ben je nu je eigen hulpvrager. Dus: experimenteer er op los!
            </Typography>}

          {/* periodes */}
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography ><strong>Periodes</strong>. De periode wisseldag voor {actieveHulpvrager?.bijnaam} is de {actieveHulpvrager?.periodeDag}e.
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <PeriodeSelect isProfiel={true} />
            </AccordionDetails>
          </Accordion>

          {/* de kolommen van het kasboek en potjes*/}
          {rekeningGroepen && rekeningGroepen.length >= 0 &&
            <Accordion>
              <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                <Typography ><strong>Potjes</strong> en bijbehorende <strong>Budgetten</strong>.
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography >{creeerBudgetTekst()}</Typography>
                {rekeningGroepen.length > 0 &&
                  <>
                    <PeriodeSelect />
                    <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
                      <Table sx={{ width: "100%" }} aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Potje (= kolomkop)</TableCell>
                            <TableCell>Gekoppelde budgetten</TableCell>
                            <TableCell>Betaalmethoden</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <>
                            {Array.from(rekeningGroepen.filter(rekeningGroep => blaatRekeningGroepSoorten.includes(rekeningGroep.rekeningGroepSoort)).map((rekeningGroep) => (
                              <Fragment key={rekeningGroep.naam}>
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                                  <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekeningGroep.naam}</TableCell>
                                  <TableCell align="left" size='small' sx={{ p: "6px" }}>
                                    {rekeningGroep.rekeningen.length > 0 &&
                                      <span dangerouslySetInnerHTML={{
                                        __html: rekeningGroep.rekeningen.map(r =>
                                          `${r.naam} (${currencyFormatter.format(Number(r.budgetBedrag))}/${r.budgetPeriodiciteit.toLowerCase()}
                                 ${r.budgetPeriodiciteit.toLowerCase() === 'week' ? `= ${currencyFormatter.format(r.budgetMaandBedrag ?? 0)}/maand` : ''}
                                 ${rekeningGroep.budgetType === BudgetType.continu ? 'doorlopend' : 'op de ' + r.budgetBetaalDag + 'e'})`)
                                          .join('<br />') +
                                          (rekeningGroep.rekeningen.length > 1 ? `<br />Totaal: ${currencyFormatter.format(rekeningGroep.rekeningen.reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0))}/maand` : '')
                                      }} />}
                                  </TableCell>
                                  <TableCell align="left" size='small' sx={{ p: "6px" }}>
                                    {rekeningGroep.rekeningen.length > 0 &&
                                      <span dangerouslySetInnerHTML={{
                                        __html: rekeningGroep.rekeningen.map(r =>
                                          r.betaalMethoden && r.betaalMethoden?.length > 0 ?
                                          `${r.betaalMethoden.map(m => m.naam).join(', ')}` :
                                          `geen betaalmethoden`)
                                          .join('<br />') + '<br />&nbsp;'
                                      }} />}
                                  </TableCell>
                                </TableRow>
                              </Fragment>
                            )))}
                            {/* {Array.from(rekeningGroepen.filter(rekeningGroep => rekeningGroep.rekeningGroepSoort === RekeningGroepSoort.aflossing)).length > 0 && (
                            <Fragment key={'aflossing'}>
                              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                                <TableCell align="left" size='small' sx={{ p: "6px" }}>Aflossing</TableCell>
                                <TableCell align="left" size='small' sx={{ p: "6px" }}>
                                  <span dangerouslySetInnerHTML={{
                                    __html: Array.from(rekeningGroepen.filter(rekeningGroep => rekeningGroep.rekeningGroepSoort === RekeningGroepSoort.aflossing)).map(RekeningGroep =>
                                      `${aflossingSamenvattingBijRekening(RekeningGroep)?.aflossingNaam} (${currencyFormatter.format(Number(aflossingSamenvattingBijRekening(RekeningGroep)?.aflossingsBedrag))}/maand op de ${aflossingSamenvattingBijRekening(RekeningGroep)?.betaalDag}e)`)
                                      .join('<br />') +
                                      `<br/>Totaal per periode: ${currencyFormatter.format(actieveHulpvrager?.aflossingen?.reduce((acc, aflossing) => acc + Number(aflossing.aflossingsBedrag), 0) ?? 0)}`
                                  }} />
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          )} */}
                          </>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>}
              </AccordionDetails>
            </Accordion>
          }

          {/* ongeldige betalingen */}
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography >{creeerOngeldigeBetalingenHeader()}</Typography>
            </AccordionSummary>
            {ongeldigeBetalingen.length > 0 &&
              <AccordionDetails>
                <Table sx={{ width: "100%" }} aria-label="simple table">
                  <TableBody>
                    {ongeldigeBetalingen.map(betaling => (
                      <TableRow key={betaling.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                        <TableCell align="left" size='small' sx={{ p: "6px" }}>{creeerOngeldigeBetalingenTekst(betaling)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>}
          </Accordion>

          {/* betaalMethoden */}
          {rekeningGroepen.filter(RekeningGroep => betaalmethodeRekeningGroepSoorten.includes(RekeningGroep.rekeningGroepSoort)).length > 0 &&
            <Accordion>
              <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                <Typography ><strong>Betaalmethoden.</strong></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Table sx={{ width: "100%" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Betaalmethode</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rekeningGroepen.filter(rekeningGroep => betaalmethodeRekeningGroepSoorten.includes(rekeningGroep.rekeningGroepSoort)).map(rekeningGroep =>
                      rekeningGroep.rekeningen.map(rekening =>
                        <TableRow key={rekening.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekening.naam} {rekening.bankNaam ? `(${rekening.bankNaam})` : ''}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          }

          {/* aflossen 
            <Accordion expanded={false}>
              <AccordionSummary sx={{ mb: 0 }} expandIcon={<></>}>
                <Grid container display="flex" alignItems="center" alignContent='center' justifyContent={{ xs: "flex-start", sm: "space-between" }} flexDirection={{ xs: 'column', sm: 'row' }} width={'100%'}>
                  <Grid sx={{ maxWidth: { xs: '100%', sm: `calc(100% - 200px)` }, mr: 'auto', mb: { xs: '10px', sm: 0 } }}>
                    <Typography >
                      <strong>Schulden/Aflossingen</strong> zijn voor {actieveHulpvrager?.bijnaam}
                      {actieveHulpvrager?.aflossingen && actieveHulpvrager?.aflossingen?.length > 0 ? " ingericht. Bij het kasboek kun je ze zien." : " niet ingericht."}
                    </Typography>
                  </Grid>
                  <Grid sx={{ minWidth: '170px', display: 'flex', justifyContent: 'flex-end' }}>
                    <NieuweAflossingDialoog
                      onAflossingBewaardChange={() => { }} />
                  </Grid> 
                </Grid>
              </AccordionSummary>
            </Accordion> */}

            {/* voor de boekhouders onder ons: betalingsSoorten2Rekeningen */}
            {betalingsSoorten2Rekeningen && (Array.from(betalingsSoorten2Rekeningen.entries())).length > 0 &&
              <Accordion>
                <AccordionSummary sx={{ mb: 0 }} expandIcon={<ArrowDropDownIcon />}>
                  <Typography >
                    Voor de <strong>boekhouders</strong> onder ons.
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ mt: 0 }}>
                  <Typography>
                    PlusMin is een boekhoudpakket, gebaseerd op dubbel boekhouden. Bij een betaling moet dus worden bepaald <strong>op welke rekeningen de betaling moet worden geboekt</strong>.
                    We delen betalingen in eerste instantie in in drie categorieën: <InkomstenIcon height={16} />&nbsp;Inkomsten, <UitgavenIcon height={16} />&nbsp;Uitgaven en <InternIcon height={16} />&nbsp;Intern.
                    Vervolgens vragen we, indien er meerdere mogelijkheden zijn, de rekeningen uit die bij de betaling horen.
                    Hieronder staat de inrichting van de betalingen voor {actieveHulpvrager?.bijnaam}:
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
                    <Table sx={{ width: "100%" }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Betaling categorie</TableCell>
                          <TableCell>Soort betaling</TableCell>
                          <TableCell>Bron (debet)</TableCell>
                          <TableCell>Bestemming (credit)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from(betalingsSoorten2Rekeningen.entries()).map((entry) => (
                          <Fragment key={entry[0]}>
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                              <TableCell align="left" size='small' sx={{ p: "6px", pl: '16px' }}>{berekenCategorieIcon(betalingsSoort2Categorie(entry[0]) ?? '')}</TableCell>
                              <TableCell align="left" size='small' sx={{ p: "6px" }}>{betalingsSoortFormatter(entry[0])}</TableCell>
                              <TableCell align="left" size='small' sx={{ p: "6px" }}>{entry[1].bron.map(c => c.naam).join(', ')}</TableCell>
                              <TableCell align="left" size='small' sx={{ p: "6px" }}>{entry[1].bestemming.map(c => c.naam).join(', ')}</TableCell>
                            </TableRow>
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>}
          </>
      </>
    </>
  );
};

export default Profiel;
