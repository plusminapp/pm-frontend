import { Box, FormControlLabel, FormGroup, Switch, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { Rekening, RekeningSoort } from '../../model/Rekening';
import { useState } from 'react';
import { BudgetDTO } from '../../model/Budget';
import { MinIcon } from '../../icons/Min';
import { PlusIcon } from '../../icons/Plus';

type BudgetContinuGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  budgetten: BudgetDTO[];
};

export const BudgetContinuGrafiek = (props: BudgetContinuGrafiekProps) => {

  const [toonBudgetContinuDetails, setToonBudgetContinuDetails] = useState<boolean>(localStorage.getItem('toonBudgetDetails') === 'true');
  const handleToonBudgetContinuChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonBudgetDetails', event.target.checked.toString());
    setToonBudgetContinuDetails(event.target.checked);
  };

  if (props.rekening.rekeningSoort.toLowerCase() !== RekeningSoort.uitgaven.toLowerCase() ||
    props.rekening.budgetType?.toLowerCase() !== 'continu' ||
    props.budgetten.length === 0) {
    throw new Error('BudgetContinuGrafiek: rekeningSoort moet \'uitgaven\' zijn, er moet minimaal 1 budget zijn en het BudgetType moet \'continu\' zijn.');
  }
  const periodeLengte = dayjs(props.periode.periodeEindDatum).diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;
  const dagenTotPeilDatum = props.peilDatum.diff(dayjs(props.periode.periodeStartDatum), 'day') + 1;

  const berekenBudgetBedragOpPeilDatum = (bedrag: number) => {
    return Math.round((dagenTotPeilDatum / periodeLengte) * bedrag);
  }
  const berekenMaandBedrag = (periodiciteit: string, bedrag: number) => {
    if (periodiciteit.toLowerCase() === 'maand') {
      return bedrag;
    } else {
      return periodeLengte * bedrag / 7;
    }
  }

  type ExtendedContinuBudget = BudgetDTO & {
    maandBudget: number;
    budgetOpPeilDatum: number;
    meerDanBudget: number;
    minderDanBudget: number;
    meerDanMaandBudget: number;
  }
  const extendedContinuBudget = props.budgetten.map((budget) => {
    const budgetBetaling = -(budget.budgetBetaling ?? 0)
    const budgetMaandBedrag = berekenMaandBedrag(budget.budgetPeriodiciteit, budget.bedrag)
    const opPeilDatum = berekenBudgetBedragOpPeilDatum(budgetMaandBedrag)
    const meerDanMaandBudget = Math.max((budgetBetaling) - budgetMaandBedrag, 0)
    return {
      ...budget,
      budgetBetaling: budgetBetaling,
      maandBudget: budgetMaandBedrag,
      meerDanMaandBudget: meerDanMaandBudget,
      budgetOpPeilDatum: opPeilDatum,
      minderDanBudget: Math.max(opPeilDatum - (budgetBetaling ?? 0) - meerDanMaandBudget, 0),
      meerDanBudget: Math.max((budgetBetaling ?? 0) - opPeilDatum, 0) - meerDanMaandBudget,
    } as ExtendedContinuBudget;
  });

  const geaggregeerdMaandBudget = extendedContinuBudget.reduce((acc, budget) => (acc + budget.maandBudget), 0);

  const geaggregeerdBudgetOpPeilDatum = extendedContinuBudget.reduce((acc, budget) => (acc + budget.budgetOpPeilDatum), 0);

  const geaggregeerdBesteedOpPeilDatum = extendedContinuBudget.reduce((acc, budget) => (acc + (budget.budgetBetaling ?? 0)), 0);

  const besteedBinnenBudget = extendedContinuBudget.reduce((acc, budget) =>
    (acc + (Math.min(budget.budgetBetaling ?? 0, budget.budgetOpPeilDatum ?? 0))), 0);

  const meerDanMaandBudget = Math.max(geaggregeerdBesteedOpPeilDatum - geaggregeerdMaandBudget, 0);

  const meerDanBudget = Math.max(extendedContinuBudget.reduce((acc, budget) =>
    (acc + (Math.max((budget.budgetBetaling ?? 0) - budget.budgetOpPeilDatum, 0))), 0) - meerDanMaandBudget, 0);

  const minderDanBudget = Math.max(geaggregeerdBudgetOpPeilDatum - geaggregeerdBesteedOpPeilDatum - meerDanMaandBudget, 0);

  const restMaandBudget = Math.max(geaggregeerdMaandBudget - geaggregeerdBesteedOpPeilDatum - minderDanBudget - meerDanMaandBudget, 0);

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = geaggregeerdMaandBudget + meerDanMaandBudget + 5;

  const berekenToestandVastIcoon = (budget: ExtendedContinuBudget): JSX.Element => {
    if (budget.meerDanBudget === 0 && budget.minderDanBudget === 0 && budget.meerDanMaandBudget === 0) return <PlusIcon color="#green" height={18} />
    if (budget.minderDanBudget > 0) return <PlusIcon color="green" height={18} />
    if (budget.meerDanMaandBudget > 0) return <MinIcon color="#cc0000" height={18} />
    if (budget.meerDanBudget > 0) return <MinIcon color="red" height={18} />
    return <MinIcon color="black" />
  }

  console.log('------------------------------------------');
  console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  console.log('peilDatum', JSON.stringify(props.peilDatum.format('YYYY-MM-DD')));
  console.log('budgetten', JSON.stringify(extendedContinuBudget));
  console.log('budgetOpPeilDatum', JSON.stringify(geaggregeerdBudgetOpPeilDatum));
  console.log('besteedOpPeilDatum', JSON.stringify(geaggregeerdBesteedOpPeilDatum));
  console.log('periodeLengte', JSON.stringify(periodeLengte));
  console.log('maandBudget', JSON.stringify(geaggregeerdMaandBudget));
  console.log('besteed', JSON.stringify(besteedBinnenBudget));
  console.log('minder', JSON.stringify(minderDanBudget));
  console.log('meer', JSON.stringify(meerDanBudget));
  console.log('rest', JSON.stringify(restMaandBudget));
  console.log('meerDanMaand', JSON.stringify(meerDanMaandBudget));

  return (
    <>
      <Grid display={'flex'} direction={'row'} alignItems={'center'}>
        <Typography variant='body2'>
          <strong>{props.rekening.naam}</strong>
        </Typography>
        {extendedContinuBudget.length >= 1 &&
          <FormGroup >
            <FormControlLabel control={
              <Switch
                sx={{ transform: 'scale(0.6)' }}
                checked={toonBudgetContinuDetails}
                onChange={handleToonBudgetContinuChange}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />}
              sx={{ mr: 0 }}
              label={
                <Box display="flex" fontSize={'0.875rem'} >
                  Toon budget details
                </Box>
              } />
          </FormGroup>}
      </Grid>
      {toonBudgetContinuDetails &&
        <Grid alignItems={'center'}>
          {extendedContinuBudget.map((budget, index) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {berekenToestandVastIcoon(budget)}
              <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                {budget.budgetNaam}: maandBudget{formatAmount(budget.maandBudget.toString())},
                waarvan vandaag {formatAmount(budget.budgetOpPeilDatum.toString())} uitgegeven had mogen worden,
                er is tot en met vandaag {formatAmount(budget.budgetBetaling?.toString() ?? "nvt")} uitgegeven; dit is
                {budget.meerDanBudget === 0 && budget.minderDanBudget === 0 && budget.meerDanMaandBudget === 0 && ' zoals verwacht'}
                {[
                  budget.minderDanBudget > 0 && ` ${formatAmount(budget.minderDanBudget.toString())} minder dan verwacht`,
                  (budget.meerDanBudget > 0 || budget.meerDanMaandBudget > 0) && ` ${formatAmount((budget.meerDanBudget + budget.meerDanMaandBudget).toString())} meer dan verwacht`,
                ].filter(Boolean).join(' en ')}.
              </Typography>
            </Box>
          ))}
        </Grid>}
      <TableContainer >
        <Table>
          <TableBody>

            <TableRow>
              <TableCell width={'5%'} />
              {besteedBinnenBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(besteedBinnenBudget / tabelBreedte) * 90}%`}
                />}
              {meerDanBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget === 0 ? '2px dotted #333' : 'none', }}
                  align="right"
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget).toString())}
                </TableCell>}
              {meerDanMaandBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                  align="right"
                  width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget + meerDanMaandBudget).toString())}
                </TableCell>}
              {minderDanBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: '2px dotted #333' }}
                  align="right"
                  width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget + meerDanMaandBudget + minderDanBudget).toString())}
                </TableCell>}
              {restMaandBudget > 0 &&
                <TableCell
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget === 0 ? '2px dotted #333' : 'none' }}
                  align="right"
                  width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                >
                  {formatAmount((besteedBinnenBudget + meerDanBudget + meerDanMaandBudget + minderDanBudget + restMaandBudget).toString())}
                </TableCell>}
              {restMaandBudget === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell />}
            </TableRow>

            <TableRow>
              <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
              {besteedBinnenBudget > 0 &&
                <TableCell
                  width={`${(besteedBinnenBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(besteedBinnenBudget.toString())}
                </TableCell>}
              {meerDanBudget > 0 &&
                <TableCell
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'red',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanBudget.toString())}
                </TableCell>}
              {meerDanMaandBudget > 0 &&
                <TableCell
                  width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: '#cc0000',
                    borderBottom: '10px solid #333',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(meerDanMaandBudget.toString())}
                </TableCell>}
              {minderDanBudget > 0 &&
                <TableCell
                  width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: 'green',
                    borderBottom: '10px solid green',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(minderDanBudget.toString())}
                </TableCell>}
              {restMaandBudget > 0 &&
                <TableCell
                  width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: '10px solid #1977d3',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                  {formatAmount(restMaandBudget.toString())}
                </TableCell>}
              {restMaandBudget === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell
                  sx={{
                    backgroundColor: '#333',
                    borderBottom: '10px solid #333',
                  }} />}
            </TableRow>

            <TableRow>
              <TableCell
                align="right"
                width={'5%'}
                sx={{ p: 1, fontSize: '10px' }} >
                {dayjs(props.periode.periodeStartDatum).format('D/M')}
              </TableCell>
              {besteedBinnenBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(besteedBinnenBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: minderDanBudget === 0 && meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }} >
                  {(minderDanBudget === 0 && meerDanBudget === 0 && meerDanMaandBudget === 0) && props.peilDatum.format('D/M')}
                </TableCell>}
              {meerDanBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget === 0 ? '2px dotted #333' : 'none', }} >
                  {meerDanMaandBudget === 0 && props.peilDatum.format('D/M')}
                </TableCell>}
              {meerDanMaandBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }} >
                  {props.peilDatum.format('D/M')}
                </TableCell>}
              {minderDanBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderLeft: '2px dotted #333' }}>
                  {props.peilDatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum && props.peilDatum.format('D/M')}
                </TableCell>}
              {restMaandBudget > 0 &&
                <TableCell
                  align="right"
                  width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                  sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget === 0 ? '2px dotted #333' : 'none' }} >
                  {dayjs(props.periode.periodeEindDatum).format('D/M')}
                </TableCell>}
              {restMaandBudget === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                <TableCell
                  align="right"
                  sx={{ p: 1, fontSize: '10px' }} >
                  {dayjs(props.periode.periodeEindDatum).format('D/M')}
                </TableCell>}
            </TableRow>

          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default BudgetContinuGrafiek;