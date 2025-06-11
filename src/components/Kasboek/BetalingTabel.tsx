import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Button, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BetalingDTO, BetalingsSoort, betalingsSoortFormatter, internBetalingsSoorten } from '../../model/Betaling';
import dayjs from 'dayjs';
import { useCustomContext } from '../../context/CustomContext';
import { betaalTabelRekeningGroepSoorten, interneRekeningGroepSoorten, RekeningGroepSoort } from '../../model/RekeningGroep';
import EditIcon from '@mui/icons-material/Edit';
import { isPeriodeOpen } from '../../model/Periode';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';
import { InfoIcon } from '../../icons/Info';
import { SaldoDTO } from '../../model/Saldo';

type BetalingTabelProps = {
  peilDatum: string | undefined;
  betalingen: BetalingDTO[];
  geaggregeerdResultaatOpDatum: SaldoDTO[];
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
};

const BetalingTabel: React.FC<BetalingTabelProps> = (props: BetalingTabelProps) => {
  const formatter = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });

  const { gekozenPeriode, setSnackbarMessage, rekeningGroepPerBetalingsSoort } = useCustomContext();

  const [selectedBetaling, setSelectedBetaling] = useState<BetalingDTO | undefined>(undefined);
  const [toonIntern, setToonIntern] = useState<boolean>(localStorage.getItem('toonIntern') === 'true');

  const handleEditClick = (betaling: BetalingDTO) => {
    setSelectedBetaling(betaling);
  };

  const getFormattedBedrag = (betaling: BetalingDTO) => {
    const bedrag = betaling.betalingsSoort === BetalingsSoort.inkomsten
      ? betaling.bedrag
      : -betaling.bedrag;
    return formatter.format(bedrag);
  };

  const rekeningGroepen = rekeningGroepPerBetalingsSoort
    .flatMap(r => r.rekeningGroepen)

  const betaalTabelRekeningGroepen = rekeningGroepPerBetalingsSoort
    .flatMap(r => r.rekeningGroepen)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter(r => betaalTabelRekeningGroepSoorten.includes(r.rekeningGroepSoort));

  const handleToonInternChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonIntern', event.target.checked.toString());
    setToonIntern(event.target.checked);
  };
  const heeftIntern = rekeningGroepen.some(RekeningGroep => RekeningGroep.rekeningGroepSoort && interneRekeningGroepSoorten.includes(RekeningGroep.rekeningGroepSoort));
  const isIntern = (betaling: BetalingDTO) => betaling.betalingsSoort && internBetalingsSoorten.includes(betaling.betalingsSoort);

  const onUpsertBetalingClose = () => {
    setSelectedBetaling(undefined);
  };

  const interneRekeningenNamen = rekeningGroepPerBetalingsSoort
    .flatMap(r => r.rekeningGroepen)
    .filter(r => r.rekeningGroepSoort === RekeningGroepSoort.betaalrekening || interneRekeningGroepSoorten.includes(r.rekeningGroepSoort))
    .map(r => r.naam).join(', ')
  const interneBetalingKopMessage = 'Interne betalingen worden als negatief getal getoond als ze van de betaalrekening af gaan, positief als ze er bij komen.'
  const toonInterneBetalingMeassage = `Interne betalingen zijn betalingen tussen eigen rekeningen (${interneRekeningenNamen}), ze maken niets uit voor het beschikbare geld, en worden daarom niet vanzelf getoond.`

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
            {/* Totalen */}
            <TableRow sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey' }}>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }}></TableCell>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', fontWeight: 'bold', maxWidth: '300px' }}>Totalen</TableCell>
              {props.geaggregeerdResultaatOpDatum
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(saldo => (
                  <TableCell key={saldo.rekeningGroepNaam} sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', fontWeight: 'bold' }} align="right">
                    {formatter.format(saldo.budgetBetaling)}
                  </TableCell>
                ))}
              {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right" />
              }
              {heeftIntern && toonIntern &&
                <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right" />
              }
            </TableRow>

            <TableRow >
              <TableCell sx={{ padding: '5px' }}></TableCell>
              <TableCell sx={{ padding: '5px', maxWidth: '300px' }}>Verwacht</TableCell>
              {props.geaggregeerdResultaatOpDatum
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(saldo => (
                  <TableCell key={saldo.rekeningGroepNaam} sx={{ padding: '5px' }} align="right">
                    {formatter.format(saldo.budgetOpPeilDatum)}
                  </TableCell>
                ))}
              {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                <TableCell sx={{ padding: '5px' }} align="right" />
              }
              {heeftIntern && toonIntern &&
                <TableCell sx={{ padding: '5px' }} align="right" />
              }
            </TableRow>

            <TableRow >
              <TableCell sx={{ padding: '5px' }}></TableCell>
              <TableCell sx={{ padding: '5px', maxWidth: '300px' }}>Overschot/tekort</TableCell>
              {props.geaggregeerdResultaatOpDatum
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(saldo => (
                  <TableCell key={saldo.rekeningGroepNaam} sx={{ padding: '5px' }} align="right">
                    {formatter.format(saldo.budgetBetaling - saldo.budgetOpPeilDatum)}
                  </TableCell>
                ))}
              {gekozenPeriode && isPeriodeOpen(gekozenPeriode) &&
                <TableCell sx={{ padding: '5px' }} align="right" />
              }
              {heeftIntern && toonIntern &&
                <TableCell sx={{ padding: '5px' }} align="right" />
              }
            </TableRow>

            <TableRow sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey' }}>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }}>Datum</TableCell>
              <TableCell sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px', maxWidth: '300px' }}>Omschrijving</TableCell>
              {betaalTabelRekeningGroepen.map(rekeningGroep => (
                <TableCell key={rekeningGroep.naam} sx={{ borderTop: '2px solid grey', borderBottom: '2px solid grey', padding: '5px' }} align="right">{rekeningGroep.naam}</TableCell>
              ))}
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
                .map((betaling) =>
                  <TableRow key={betaling.id}>
                    <TableCell sx={{ padding: '5px' }}>{dayjs(betaling.boekingsdatum).format('YYYY-MM-DD')}</TableCell>
                    <TableCell sx={{ padding: '5px', maxWidth: '300px' }}>
                      {isIntern(betaling) ? betaling.betalingsSoort && betalingsSoortFormatter(betaling.betalingsSoort) + ': ' : ''}
                      {betaling.omschrijving}
                    </TableCell>
                    {betaalTabelRekeningGroepen
                      .map(rekeningGroep => (
                        <TableCell key={rekeningGroep.id} sx={{ padding: '5px' }} align="right">
                          {(rekeningGroep.rekeningen.map(r => r.naam).includes(betaling.bestemming!!) ||
                            rekeningGroep.rekeningen.map(r => r.naam).includes(betaling.bron!!))
                            && getFormattedBedrag(betaling)}
                        </TableCell>
                      ))}
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
      {/* {JSON.stringify(props.geaggregeerdResultaatOpDatum)} */}
    </>
  );
};

export default BetalingTabel;