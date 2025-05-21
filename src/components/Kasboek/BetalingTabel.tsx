import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Link, Button, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link as RouterLink } from 'react-router-dom';
import { BetalingDTO, BetalingsSoort, betalingsSoortFormatter, internBetalingsSoorten } from '../../model/Betaling';
import dayjs from 'dayjs';
import { useCustomContext } from '../../context/CustomContext';
import { interneRekeningSoorten, RekeningSoort } from '../../model/Rekening';
import { BudgetDTO } from '../../model/Budget';
import { ExternalLinkIcon } from '../../icons/ExternalLink';
import EditIcon from '@mui/icons-material/Edit';
import { isPeriodeOpen } from '../../model/Periode';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';
import { AflossingDTO } from '../../model/Aflossing';
import { BudgetStatusIcon } from '../../icons/BudgetStatus';
import { AflossingStatusIcon } from '../../icons/AflossingStatus';
import { InfoIcon } from '../../icons/Info';
import BudgetInkomstenGrafiek from '../Stand/BudgetInkomstenGrafiek';

type BetalingTabelProps = {
  peilDatum: string | undefined;
  betalingen: BetalingDTO[];
  budgetten: BudgetDTO[];
  aflossingen: AflossingDTO[];
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
};

const BetalingTabel: React.FC<BetalingTabelProps> = (props: BetalingTabelProps) => {
  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });

  const { rekeningen, gekozenPeriode, setSnackbarMessage } = useCustomContext();

  const [selectedBetaling, setSelectedBetaling] = useState<BetalingDTO | undefined>(undefined);
  const [toonIntern, setToonIntern] = useState<boolean>(localStorage.getItem('toonIntern') === 'true');

  const handleEditClick = (betaling: BetalingDTO) => {
    setSelectedBetaling(betaling);
  };

  const getFormattedBedrag = (betaling: BetalingDTO) => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente
      ? betaling.bedrag
      : -betaling.bedrag;
    return formatter.format(bedrag);
  };

  const bestemmingen = rekeningen.filter(r => r.rekeningSoort === RekeningSoort.uitgaven).map(r => r.naam);

  const totalen = {
    inkomsten: 0,
    aflossing: 0,
    bestemmingen: rekeningen.reduce((acc, rekening) => {
      acc[rekening.naam] = 0;
      return acc;
    }, {} as Record<string, number>)
  };

  props.betalingen.forEach(betaling => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente
      ? betaling.bedrag
      : -betaling.bedrag;

    if (betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente) {
      totalen.inkomsten += Number(bedrag);
    } else if (betaling.betalingsSoort === BetalingsSoort.uitgaven && betaling.bestemming) {
      totalen.bestemmingen[betaling.bestemming] += Number(bedrag);
    } else if (betaling.betalingsSoort === BetalingsSoort.aflossen) {
      totalen.aflossing += bedrag;
    }
  });

  const maandAflossingsBedrag = props.aflossingen.reduce((acc, aflossing) => acc + (Number(aflossing.aflossingsBedrag)), 0);
  const aflossingOpPeildatum = props.aflossingen.reduce((acc, aflossing) => acc + (Number(aflossing.aflossingOpPeilDatum)), 0);
  const heeftAflossing = maandAflossingsBedrag > 0;

  const maandBudget = (rekeningNaam: string) => props.budgetten
    .filter(b => rekeningNaam === b.rekeningNaam)
    .reduce((acc, budget) => acc + (budget.budgetMaandBedrag ?? 0), 0)

  const budgetOpPeilDatum = (rekeningNaam: string) => props.budgetten
    .filter(b => rekeningNaam === b.rekeningNaam)
    .reduce((acc, budget) => acc + (budget.budgetOpPeilDatum ?? 0), 0)

  const heeftBudgetten = props.budgetten.length > 0;

  const heeftIntern = rekeningen.some(rekening => rekening.rekeningSoort && interneRekeningSoorten.includes(rekening.rekeningSoort));

  const isInkomsten = (betaling: BetalingDTO) => betaling.betalingsSoort === BetalingsSoort.inkomsten || betaling.betalingsSoort === BetalingsSoort.rente;
  const isUitgaven = (betaling: BetalingDTO) => betaling.betalingsSoort === BetalingsSoort.uitgaven;
  const isAflossing = (betaling: BetalingDTO) => betaling.betalingsSoort === BetalingsSoort.aflossen;
  const isIntern = (betaling: BetalingDTO) => betaling.betalingsSoort && internBetalingsSoorten.includes(betaling.betalingsSoort);

  const afgerondOp2Decimalen = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const onUpsertBetalingClose = () => {
    setSelectedBetaling(undefined);
  };
  const handleToonInternChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonIntern', event.target.checked.toString());
    setToonIntern(event.target.checked);
  };

  const interneRekeningenNamen = rekeningen.filter(r => r.rekeningSoort === RekeningSoort.betaalrekening || interneRekeningSoorten.includes(r.rekeningSoort)).map(r => r.naam).join(', ')
  const toonInterneBetalingMeassage = `Interne betalingen zijn betalingen tussen eigen rekeningen (${interneRekeningenNamen}), ze maken niets uit voor het beschikbare geld, en worden daarom niet vanzelf getoond.`
  const interneBetalingKopMessage = 'Interne betalingen worden als negatief getal getoond als ze van de betaalrekening af gaan, positief als ze er bij komen.'
  const interneBetalingTotaalMessage = `Interne betalingen schuiven met geld tussen eigen rekeningen (${interneRekeningenNamen}), een totaal betekent daarom niks zinvols en daarom worden de betalingen niet opgeteld.`

  const betaalAchterstand = props.aflossingen.reduce((acc, aflossing) => acc + (Number(aflossing.deltaStartPeriode)), 0)

  return (
    <>
      {heeftIntern &&
        <>
          <Grid display="flex" flexDirection="row" alignItems={'center'} >
            <FormGroup >
              <FormControlLabel control={
                <Switch
                  sx={{ transform: 'scale(0.6)' }}
                  checked={toonIntern}
                  onChange={handleToonInternChange}
                  slotProps={{ input: { 'aria-label': 'controlled' } }}
                />}
                sx={{ mr: 0 }}
                label={
                  <Box display="flex" fontSize={'0.875rem'} >
                    Toon interne betalingen
                  </Box>
                } />
            </FormGroup>
            <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer' }}
              onClick={() => setSnackbarMessage({ message: toonInterneBetalingMeassage, type: 'info' })}>
              <InfoIcon height='16' />
            </Box>
          </Grid>
        </>
      }
      <TableContainer sx={{ maxHeight: '80vh', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <TableRow sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey' }}>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }}></TableCell>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', fontWeight: 'bold', maxWidth: '300px' }}>Totalen</TableCell>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.inkomsten)}</TableCell>
              {bestemmingen.map(bestemming => (
                <TableCell key={bestemming} sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', fontWeight: 'bold' }} align="right">
                  {formatter.format(totalen.bestemmingen[bestemming])}
                </TableCell>
              ))}
              {heeftAflossing &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', fontWeight: 'bold' }} align="right">{formatter.format(totalen.aflossing)}</TableCell>}
              {heeftIntern && toonIntern &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', fontWeight: 'bold' }} align="right">
                  <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer', mr: 0, pr: 0 }} justifyContent="flex-end"
                    onClick={() => setSnackbarMessage({ message: interneBetalingTotaalMessage, type: 'info' })}>
                    <InfoIcon height='16' />
                  </Box>
                </TableCell>}
              {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right" />
              }
            </TableRow>
            {(heeftBudgetten || heeftAflossing) &&
              <>
                <TableRow sx={{ borderBottom: '1px' }}>
                  <TableCell sx={{ padding: '5px' }}></TableCell>
                  <TableCell sx={{ padding: '5px' }}>Verwacht</TableCell>
                  <TableCell sx={{ padding: '5px' }} align="right" >
                    {maandBudget('Inkomsten') != 0 ? formatter.format(budgetOpPeilDatum('Inkomsten')) : ''}
                  </TableCell>
                  {bestemmingen.map(bestemming => (
                    <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                      {maandBudget(bestemming) != 0 ? formatter.format(budgetOpPeilDatum(bestemming)) : ''}
                    </TableCell>
                  ))}
                  <TableCell sx={{ padding: '5px' }} align="right" >
                    {maandAflossingsBedrag > 0 ? formatter.format(aflossingOpPeildatum - betaalAchterstand) : ''}
                  </TableCell>
                  {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                    <TableCell sx={{ padding: '5px' }} align="right" />
                  }
                </TableRow>
                <TableRow sx={{ borderBottom: '1px' }}>
                  <TableCell sx={{ padding: '5px' }}></TableCell>
                  <TableCell sx={{ padding: '5px' }}>Overschot/tekort</TableCell>
                  <TableCell key={'Inkomsten'} sx={{ padding: '5px' }} align="right">
                    {maandBudget('Inkomsten') != 0 && gekozenPeriode &&
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          {/* <BudgetStatusIcon verwachtHoog={totalen['inkomsten']} verwachtLaag={budgetOpPeilDatum('Inkomsten')} /> */}
                          <BudgetInkomstenGrafiek
                            peilDatum={dayjs(props.peilDatum)}
                            periode={gekozenPeriode}
                            rekening={rekeningen.find(r => r.rekeningSoort=== RekeningSoort.inkomsten)!}
                            budgetten={props.budgetten.filter(b => b.rekeningNaam === 'Inkomsten')}
                            visualisatie={'icon-xs'}
                            />
                        </Box>
                        &nbsp;
                        {formatter.format(totalen['inkomsten'] - budgetOpPeilDatum('Inkomsten'))}
                      </Box>}
                  </TableCell>
                  {bestemmingen.map(bestemming => (
                    <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                      {maandBudget(bestemming) != 0 &&
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <BudgetStatusIcon verwachtHoog={budgetOpPeilDatum(bestemming)} verwachtLaag={Math.floor(-totalen.bestemmingen[bestemming])} />
                          </Box>
                          &nbsp;
                          {formatter.format(afgerondOp2Decimalen(budgetOpPeilDatum(bestemming) + totalen.bestemmingen[bestemming]))}
                        </Box>}
                    </TableCell>
                  ))}
                  {heeftAflossing &&
                    <TableCell sx={{ padding: '5px' }} align="right" >
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <Link component={RouterLink} to="/schuld-aflossingen" display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                          <AflossingStatusIcon verwachtHoog={-totalen.aflossing} verwachtLaag={aflossingOpPeildatum - betaalAchterstand} />
                          <ExternalLinkIcon />
                        </Link>
                        &nbsp;
                        {maandAflossingsBedrag != 0 ? formatter.format(betaalAchterstand - aflossingOpPeildatum - totalen.aflossing) : ''}
                      </Box>
                    </TableCell>}
                  {heeftIntern && toonIntern &&
                    <TableCell sx={{ padding: '5px' }} align="right" />}
                  {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                    <TableCell sx={{ padding: '5px' }} align="right" />}
                </TableRow>
              </>}

            <TableRow sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey' }}>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }}>Datum</TableCell>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', maxWidth: '300px' }}>Omschrijving</TableCell>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right">Inkomsten</TableCell>
              {rekeningen.filter(r => r.rekeningSoort === RekeningSoort.uitgaven).map(uitgaveRekening => (
                <TableCell key={uitgaveRekening.naam} sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right">{uitgaveRekening.naam}</TableCell>
              ))}
              {heeftAflossing &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right">Aflossing</TableCell>
              }
              {heeftIntern && toonIntern &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right">
                  <Grid display="flex" flexDirection="row" alignItems={'center'} justifyContent="flex-end" >
                    Intern
                    <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer', mr: 0, pr: 0 }}
                      onClick={() => setSnackbarMessage({ message: interneBetalingKopMessage, type: 'info' })}>
                      <InfoIcon height='16' />
                    </Box>
                  </Grid>
                </TableCell>
              }
              {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right" />
              }
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {props.betalingen
                .sort((a, b) => a.sortOrder > b.sortOrder ? -1 : 1)
                .map((betaling) => (!isIntern(betaling) || toonIntern) &&
                  <TableRow key={betaling.id}>
                    <TableCell sx={{ padding: '5px' }}>{dayjs(betaling.boekingsdatum).format('YYYY-MM-DD')}</TableCell>
                    <TableCell sx={{ padding: '5px', maxWidth: '300px' }}>
                      {isIntern(betaling) ? betaling.betalingsSoort && betalingsSoortFormatter(betaling.betalingsSoort) + ': ' : ''}
                      {betaling.omschrijving}
                    </TableCell>
                    <TableCell sx={{ padding: '5px' }} align="right">{isInkomsten(betaling) ? getFormattedBedrag(betaling) : ''}</TableCell>
                    {bestemmingen.map(bestemming => (
                      <TableCell key={bestemming} sx={{ padding: '5px' }} align="right">
                        {isUitgaven(betaling) && betaling.bestemming === bestemming ? getFormattedBedrag(betaling) : ''}
                      </TableCell>
                    ))}
                    {heeftAflossing &&
                      <TableCell sx={{ padding: '5px' }} align="right">{isAflossing(betaling) ? getFormattedBedrag(betaling) : ''}</TableCell>}
                    {heeftIntern && toonIntern &&
                      <TableCell sx={{ padding: '5px' }} align="right">{isIntern(betaling) ? getFormattedBedrag(betaling) : ''}</TableCell>}
                    {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                      <TableCell size='small' sx={{ p: "5px" }}>
                        <Button onClick={() => handleEditClick(betaling)} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
                          <EditIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    }
                  </TableRow>
                )}

            </>
          </TableBody>
        </Table>
      </TableContainer >
      {selectedBetaling &&
        <UpsertBetalingDialoog
          onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
          onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)}
          onUpsertBetalingClose={onUpsertBetalingClose}
          editMode={true}
          betaling={{ ...selectedBetaling, bron: selectedBetaling.bron, bestemming: selectedBetaling.bestemming }}
        />
      }
    </>
  );
};

export default BetalingTabel;