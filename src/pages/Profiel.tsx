import React, { Fragment, useCallback, useEffect } from 'react';

import { Accordion, AccordionDetails, AccordionSummary, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { useAuthContext } from "@asgardeo/auth-react";

import { useCustomContext } from '../context/CustomContext';
import { bestemmingBetalingsSoorten, Betaling, currencyFormatter, ontdubbelBetalingsSoorten } from '../model/Betaling';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import { BudgetType, profielRekeningGroepSoorten } from '../model/RekeningGroep';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { InkomstenIcon } from '../icons/Inkomsten';
import { UitgavenIcon } from '../icons/Uitgaven';
import { InternIcon } from '../icons/Intern';
import dayjs from 'dayjs';
import { RekeningDTO } from '../model/Rekening';
import { isPeriodeOpen } from '../model/Periode';

const Profiel: React.FC = () => {
  const { state, getIDToken } = useAuthContext();

  const { gebruiker, actieveHulpvrager, rekeningGroepPerBetalingsSoort, gekozenPeriode } = useCustomContext();

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

    const responseOngeldigeBetalingen = await fetch(`/api/v1/betalingen/hulpvrager/${actieveHulpvrager.id}/valideer-betalingen`, {
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

  const creeerBudgetTekst = (): string => {
    const inkomsten = rekeningGroepPerBetalingsSoort
      .filter(rgpb => rgpb.betalingsSoort === 'INKOMSTEN')
      .flatMap(rgpb => rgpb.rekeningGroepen)
      .flatMap(rg => rg.rekeningen)
      .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0)
      const uitgaven = rekeningGroepPerBetalingsSoort
        .filter(rgpb => rgpb.betalingsSoort === 'UITGAVEN')
        .flatMap(rgpb => rgpb.rekeningGroepen)
        .flatMap(rg => rg.rekeningen)
        .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0)
      const aflossen = rekeningGroepPerBetalingsSoort
        .filter(rgpb => rgpb.betalingsSoort === 'AFLOSSEN')
        .flatMap(rgpb => rgpb.rekeningGroepen)
        .flatMap(rg => rg.rekeningen)
        .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0)
      const sparen = rekeningGroepPerBetalingsSoort
        .filter(rgpb => rgpb.betalingsSoort === 'SPAREN')
        .flatMap(rgpb => rgpb.rekeningGroepen)
        .flatMap(rg => rg.rekeningen)
        .reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0)
      const budgetTekst = `In: ${currencyFormatter.format(inkomsten)}, Uit: ${currencyFormatter.format(uitgaven)}, Aflossen: ${currencyFormatter.format(aflossen)}, Sparen: ${currencyFormatter.format(sparen)}, Over: ${currencyFormatter.format(inkomsten - uitgaven - aflossen - sparen)} per maand. `;
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
    const naDatum = dayjs(betaling.bron?.vanPeriode?.periodeStartDatum);
    const totEnMetDatum = dayjs(betaling.bestemming?.totEnMetPeriode?.periodeEindDatum);
    const boekingsdatum = dayjs(betaling.boekingsdatum);

    const geldigheid = boekingsdatum.isBefore(naDatum) ? `na ${dayjs(betaling.bron?.vanPeriode?.periodeStartDatum).format('D MMMM')}` :
      boekingsdatum.isAfter(totEnMetDatum) ? `tot ${dayjs(betaling.bron?.totEnMetPeriode?.periodeEindDatum).format('D MMMM')}` : "";
    return `${formatAmount(betaling.bedrag.toString())} met omschrijving ${betaling.omschrijving} op ${dayjs(betaling.boekingsdatum).format('D MMMM')} naar budget ${betaling.bron?.naam} dat geldig is ${geldigheid}.`
  }

  const berekenCategorieIcon = (categorie: string) => {
    switch (categorie) {
      case 'INKOMSTEN':
        return <InkomstenIcon />
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
      default: return <></>;
    }
  }

  const berekenVariabiliteit = (rekening: RekeningDTO): string => {
    // const betalingWordtVerwacht = !rekening.maanden || (gekozenPeriode && rekening.maanden?.includes(dagInPeriode(rekening.budgetBetaalDag ?? 0, gekozenPeriode).month() + 1)) ? '' : ' X'
    const betalingWordtVerwacht = rekening.maanden ? `; ${rekening.maanden.join(', ')}` : '';
    const variabiliteit = rekening.budgetVariabiliteit ? ` ±${rekening.budgetVariabiliteit}%` : '';
    return `${variabiliteit}${betalingWordtVerwacht}`
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
          <Typography sx={{ mb: 1 }}>
            De inrichting kan per periode verschillen (bijvoorbeeld andere potjes en budgetten), dus kies eerst de periode waar je de inrichting van wilt zien.
          </Typography>
          <PeriodeSelect />
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography ><strong>Periodes</strong>. De periode wisseldag voor {actieveHulpvrager?.bijnaam} is de {actieveHulpvrager?.periodeDag}e.
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <PeriodeSelect isProfiel />
            </AccordionDetails>
          </Accordion>

          {/* de kolommen van het kasboek en potjes*/}
          {rekeningGroepPerBetalingsSoort && rekeningGroepPerBetalingsSoort.length >= 0 &&
            <Accordion>
              <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                <Typography ><strong>Potjes</strong> en bijbehorende <strong>Budgetten</strong>.
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography >{creeerBudgetTekst()}</Typography>
                {rekeningGroepPerBetalingsSoort.length > 0 &&
                  <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
                    <Table sx={{ width: "100%" }} aria-label="simple table">
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
                            .filter(rgpb => ontdubbelBetalingsSoorten.includes(rgpb.betalingsSoort))
                            .flatMap(rgpb => rgpb.rekeningGroepen)
                            .filter(rg => profielRekeningGroepSoorten.includes(rg.rekeningGroepSoort))
                            .filter((value, index, self) => self.indexOf(value) === index).map((rekeningGroep) => (
                              <Fragment key={rekeningGroep.naam}>
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                                  <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekeningGroep.naam} ({rekeningGroep.rekeningGroepSoort.toLowerCase()})</TableCell>
                                  <TableCell align="left" size='small' sx={{ p: "6px" }}>
                                    {rekeningGroep.rekeningen.length > 0 &&
                                      <span dangerouslySetInnerHTML={{
                                        __html: rekeningGroep.rekeningen.map(r =>
                                          gekozenPeriode && isPeriodeOpen(gekozenPeriode) ?
                                            `${r.naam} (${currencyFormatter.format(Number(r.budgetBedrag))}/${r.budgetPeriodiciteit?.toLowerCase()}
                                 ${r.budgetPeriodiciteit?.toLowerCase() === 'week' ? `= ${currencyFormatter.format(r.budgetMaandBedrag ?? 0)}/maand` : ''}
                                 ${rekeningGroep.budgetType === BudgetType.continu ? 'doorlopend' : 'op de ' + r.budgetBetaalDag + 'e'}${berekenVariabiliteit(r)})` :
                                            `${r.naam} (${currencyFormatter.format(r.budgetMaandBedrag ?? 0)}/maand)`)
                                          .join('<br />') +
                                          (rekeningGroep.rekeningen.length > 0 ? `<br />Totaal: ${currencyFormatter.format(rekeningGroep.rekeningen.reduce((acc, b) => acc + Number(b.budgetMaandBedrag), 0))}/maand` : '')
                                      }} />}
                                  </TableCell>
                                  <TableCell align="left" size='small' sx={{ p: "6px" }}>
                                    {rekeningGroep.rekeningen.length > 0 && gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
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
                            ))}
                        </>
                      </TableBody>
                    </Table>
                  </TableContainer>}
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

          {/* voor de boekhouders onder ons: betalingsSoorten2Rekeningen */}
          {rekeningGroepPerBetalingsSoort &&
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
                        <TableCell>Kolomkop</TableCell>
                        <TableCell>Bron (credit)</TableCell>
                        <TableCell>Bestemming (debet)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rekeningGroepPerBetalingsSoort.map((rgpb) =>
                        rgpb.rekeningGroepen && rgpb.rekeningGroepen.map((rekeningGroep) =>
                          rekeningGroep && rekeningGroep.rekeningen.map(rekening =>
                            <TableRow key={rekening.id} >
                              <TableCell align="left" size='small' sx={{ p: "6px", pl: '16px' }}>{berekenCategorieIcon(rgpb.betalingsSoort)}</TableCell>
                              <TableCell align="left" size='small' sx={{ p: "6px", pl: '16px' }}>{rgpb.betalingsSoort}</TableCell>
                              <TableCell align="left" size='small' sx={{ p: "6px", pl: '16px' }}>{rekeningGroep.naam}</TableCell>
                              <TableCell align="left" size='small' sx={{ p: "6px", pl: '16px' }}>{bestemmingBetalingsSoorten.includes(rgpb.betalingsSoort) ? rekening.naam : rekening.betaalMethoden?.map(rekening => rekening.naam).join(', ')}</TableCell>
                              <TableCell align="left" size='small' sx={{ p: "6px", pl: '16px' }}>{!bestemmingBetalingsSoorten.includes(rgpb.betalingsSoort) ? rekening.naam : rekening.betaalMethoden?.map(rekening => rekening.naam).join(', ')}</TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>}
        </>
      </>
      {/* {JSON.stringify(rekeningGroepPerBetalingsSoort)} */}
    </>
  );
};

export default Profiel;
