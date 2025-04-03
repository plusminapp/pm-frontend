import React, { Fragment, useEffect, useState } from 'react';

import { Accordion, AccordionDetails, AccordionSummary, FormControlLabel, FormGroup, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAuthContext } from "@asgardeo/auth-react";

import { useCustomContext } from '../context/CustomContext';
import { betalingsSoort2Categorie, betalingsSoortFormatter, currencyFormatter } from '../model/Betaling';
import { PeriodeSelect } from '../components/Periode/PeriodeSelect';
import { betaalmethodeRekeningSoorten, BudgetType, inkomstenRekeningSoorten, Rekening, RekeningSoort, resultaatRekeningSoorten, uitgavenRekeningSoorten } from '../model/Rekening';
import { AflossingSamenvattingDTO } from '../model/Aflossing';
import { berekenPeriodeBudgetBedrag } from '../model/Budget';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import { InkomstenIcon } from '../icons/Inkomsten';
import { UitgavenIcon } from '../icons/Uitgaven';
import { InternIcon } from '../icons/Intern';
import NieuweAflossingDialoog from '../components/Aflossing/NieuweAflossingDialoog';
import { NaamPlaatje } from '../components/NaamPlaatje';
import { Gebruiker } from '../model/Gebruiker';

const Profiel: React.FC = () => {
  const { state } = useAuthContext();

  const { gebruiker, actieveHulpvrager, setActieveHulpvrager, setActieveHulpvragerData, hulpvragers, rekeningen, betaalMethoden, betalingsSoorten2Rekeningen, gekozenPeriode } = useCustomContext();

  const [checked, setChecked] = useState(actieveHulpvrager === gebruiker && gebruiker?.roles.includes("ROLE_VRIJWILLIGER"));
  useEffect(() => {
    setChecked(actieveHulpvrager !== gebruiker || !gebruiker?.roles.includes("ROLE_VRIJWILLIGER"));
  }, [actieveHulpvrager, gebruiker]);

  const aflossingSamenvattingBijRekening = (rekening: Rekening): AflossingSamenvattingDTO | undefined =>
    actieveHulpvrager?.aflossingen.filter(a => a.aflossingNaam === rekening.naam)[0]

  const gebudgeteerdPerPeriode = (rekeningSoorten: RekeningSoort[]) => {
    return rekeningen?.
      filter(rekening => rekeningSoorten.includes(rekening.rekeningSoort)).
      reduce((uitgavenAcc, rekening) => {
        const budgetUitgaven = rekening.budgetten.reduce((acc, budget) => {
          return acc + Number(berekenPeriodeBudgetBedrag(gekozenPeriode, budget));
        }, 0);
        const aflossing = aflossingSamenvattingBijRekening(rekening)
          ? Number(aflossingSamenvattingBijRekening(rekening)?.aflossingsBedrag)
          : 0;
        return uitgavenAcc + budgetUitgaven + aflossing;
      }, 0) || 0;
  };

  const heeftInkomstenBudgetten = () => {
    return rekeningen?.some(rekening => rekening.budgetten.length > 0 && rekening.rekeningSoort === RekeningSoort.inkomsten);
  }

  const heeftUitgaveBudgetten = () => {
    return rekeningen?.some(rekening => rekening.budgetten.length > 0 && rekening.rekeningSoort === RekeningSoort.uitgaven);
  }

  const creeerBudgetTekst = (): string => {
    const budgetTekst =
      (heeftInkomstenBudgetten() ? `De verwachte inkomsten zijn: ${currencyFormatter.format(gebudgeteerdPerPeriode(inkomstenRekeningSoorten))}. ` :
        heeftUitgaveBudgetten() ? "Er zijn geen Inkomsten potjes, dus daar kunnen we niets over zeggen. " : "Er zijn geen Inkomsten of Uitgave potjes, dus daar kunnen we niets over zeggen en dus ook niet over wat er aan het eind van de maand over kan zijn.") +

      (heeftUitgaveBudgetten() ? `De verwachte uitgaven zijn: ${currencyFormatter.format(gebudgeteerdPerPeriode(uitgavenRekeningSoorten))}. ` :
        heeftInkomstenBudgetten() ? "Er zijn geen Uitgave budgetten, dus daar kunnen we niets over zeggen en dus ook niet over wat er aan het eind van de maand over kan zijn. " : "") +
      (heeftInkomstenBudgetten() && heeftUitgaveBudgetten() ?
        `Verwacht over aan t einde van de maand: ${currencyFormatter.format(gebudgeteerdPerPeriode(inkomstenRekeningSoorten) - gebudgeteerdPerPeriode(uitgavenRekeningSoorten))}.` : "");
    return budgetTekst
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

  const handleActieveHulpvragerChange = (nieuweActieveHulpvrager: Gebruiker | undefined) => {
    if (nieuweActieveHulpvrager !== actieveHulpvrager) {
      setActieveHulpvrager(nieuweActieveHulpvrager);
      setActieveHulpvragerData(nieuweActieveHulpvrager, undefined);
    } else {
      setActieveHulpvrager(gebruiker);
      setActieveHulpvragerData(gebruiker, undefined);
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  return (
    <>
      {!state.isAuthenticated &&
        <Typography variant='h4' sx={{ mb: '25px' }}>Je moet eerst inloggen ...</Typography>
      }
      {state.isAuthenticated &&
        <>
          <Typography variant='h4'>Hi {gebruiker?.bijnaam}, hoe is 't?</Typography>
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
          {gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
            <Typography sx={{ my: '25px' }}>Je begeleidt
              {hulpvragers.length === 0 ? " (nog) niemand " : hulpvragers.length > 1 ? " de hulpvragers " : " de hulpvrager "}
              <Grid display={'flex'} direction={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                {hulpvragers.map(hulpvrager => (
                  <Grid onClick={() => handleActieveHulpvragerChange(hulpvrager)} mt={1}>
                    <NaamPlaatje bijnaam={hulpvrager.bijnaam} key={hulpvrager.bijnaam} geselecteerd={hulpvrager === actieveHulpvrager} />
                  </Grid>
                ))}
              </Grid>
            </Typography>
          }
        </>
      }
      <>
        {actieveHulpvrager === gebruiker && gebruiker?.roles.includes("ROLE_VRIJWILLIGER") &&
          <>
            <Typography variant='h4' sx={{ my: '25px' }}>
              Je hebt nog geen hulpvrager gekozen.
            </Typography>
            <FormGroup sx={{ ml: 'auto' }} >
              <FormControlLabel control={
                <Switch
                  sx={{ transform: 'scale(0.6)' }}
                  checked={checked}
                  onChange={handleChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                />}
                label={`Toon de inrichting van ${gebruiker.bijnaam}`} />
            </FormGroup>
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
        {checked &&
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
            {rekeningen && rekeningen.length > 0 &&
              <Accordion>
                <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                  <Typography ><strong>Potjes</strong> en bijbehorende <strong>Budgetten</strong>.
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ my: '25px' }}>{creeerBudgetTekst()}</Typography>
                  <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
                    <Table sx={{ width: "100%" }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Potje (= kolomkop)</TableCell>
                          <TableCell>Gekoppelde budgetten</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <>
                          {Array.from(rekeningen.filter(rekening => resultaatRekeningSoorten.includes(rekening.rekeningSoort)).map((rekening) => (
                            <Fragment key={rekening.naam}>
                              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                                <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekening.naam}</TableCell>
                                <TableCell align="left" size='small' sx={{ p: "6px" }}>
                                  {rekening.budgetten.length > 0 &&
                                    <span dangerouslySetInnerHTML={{
                                      __html: rekening.budgetten.map(b =>
                                        `${b.budgetNaam} (${currencyFormatter.format(Number(b.bedrag))}/${b.budgetPeriodiciteit.toLowerCase()}
                                 ${b.budgetPeriodiciteit.toLowerCase() === 'week' ? `= ${currencyFormatter.format(berekenPeriodeBudgetBedrag(gekozenPeriode, b) ?? 0)}/maand` : ''}
                                 ${rekening.budgetType === BudgetType.continu ? 'doorlopend' : 'op de ' + b.betaalDag + 'e'})`)
                                        .join('<br />') +
                                        (rekening.budgetten.length > 1 ? `<br />Totaal: ${currencyFormatter.format(rekening.budgetten.reduce((acc, b) => acc + Number(b.bedrag), 0))}/maand` : '')
                                    }} />}
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          )))}
                          {Array.from(rekeningen.filter(rekening => rekening.rekeningSoort === RekeningSoort.aflossing)).length > 0 && (
                            <Fragment key={'aflossing'}>
                              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                                <TableCell align="left" size='small' sx={{ p: "6px" }}>Aflossing</TableCell>
                                <TableCell align="left" size='small' sx={{ p: "6px" }}>
                                  <span dangerouslySetInnerHTML={{
                                    __html: Array.from(rekeningen.filter(rekening => rekening.rekeningSoort === RekeningSoort.aflossing)).map(rekening =>
                                      `${aflossingSamenvattingBijRekening(rekening)?.aflossingNaam} (${currencyFormatter.format(Number(aflossingSamenvattingBijRekening(rekening)?.aflossingsBedrag))}/maand op de ${aflossingSamenvattingBijRekening(rekening)?.betaalDag}e)`)
                                      .join('<br />') +
                                      `<br/>Totaal per periode: ${currencyFormatter.format(actieveHulpvrager?.aflossingen?.reduce((acc, aflossing) => acc + Number(aflossing.aflossingsBedrag), 0) ?? 0)}`
                                  }} />
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          )}
                        </>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            }

            {/* betaalMethoden */}
            {betaalMethoden && betaalMethoden.length > 0 &&
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
                      {rekeningen.filter(rekening => betaalmethodeRekeningSoorten.includes(rekening.rekeningSoort)).map(rekening => (
                        <TableRow key={rekening.naam} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} aria-haspopup="true" >
                          <TableCell align="left" size='small' sx={{ p: "6px" }}>{rekening.naam} {rekening.bankNaam ? `(${rekening.bankNaam})` : ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            }

            {/* aflossen  */}
            <Accordion expanded={false}>
              <AccordionSummary sx={{ mb: 0 }} expandIcon={<></>}>
                <Grid container display="flex" alignItems="center" alignContent='center' justifyContent={{xs: "flex-start", sm: "space-between"}} flexDirection={{ xs: 'column', sm: 'row' }} width={'100%'}>
                  <Grid sx={{ maxWidth: { xs: '100%', sm: `calc(100% - 200px)`}, mr: 'auto', mb:{xs: '10px', sm: 0} }}>
                    <Typography >
                      <strong>Schulden/Aflossingen</strong> zijn voor {actieveHulpvrager?.bijnaam}
                      {actieveHulpvrager?.aflossingen && actieveHulpvrager?.aflossingen?.length === 0 ? " niet ingericht." : " ingericht. Bij het kasboek kun je ze zien."}
                    </Typography>
                  </Grid>
                  <Grid sx={{ minWidth: '170px', display: 'flex', justifyContent: 'flex-end' }}>
                    <NieuweAflossingDialoog
                      onAflossingBewaardChange={() => { }} />
                  </Grid>
                </Grid>
              </AccordionSummary>
            </Accordion>

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
          </>}
      </>
    </>
  );
};

export default Profiel;
