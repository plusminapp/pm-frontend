import { Box, FormControlLabel, FormGroup, Switch, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { dagInPeriode, Periode } from '../../model/Periode';
import { RekeningGroepDTO } from '../../model/RekeningGroep';
import { useState } from 'react';
import { BudgetDTO } from '../../model/Budget';
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';

type BudgetInkomstenGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  RekeningGroep: RekeningGroepDTO
  budgetten: BudgetDTO[];
  visualisatie: string;
};

export const BudgetInkomstenGrafiek = (props: BudgetInkomstenGrafiekProps) => {

  const [toonBudgetInkomstenDetails, setToonBudgetInkomstenDetails] = useState<boolean>(localStorage.getItem('toonBudgetAflossingDetails') === 'true');
  const handleToonBudgetInkomstenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonBudgetAflossingDetails', event.target.checked.toString());
    setToonBudgetInkomstenDetails(event.target.checked);
  };

  if (//props.RekeningGroep.rekeningGroepSoort.toLowerCase() !== rekeningGroepSoort.inkomsten.toLowerCase() ||
    props.budgetten.length ===  0) {
    // props.budgetten.some(budget => budget.betaalDag === undefined) ||
    // props.budgetten.some(budget => (budget?.betaalDag ?? 0) < 1) ||
    // props.budgetten.some(budget => (budget?.betaalDag ?? 30) > 28)) {
      // console.error(`BudgetInkomstenGrafiek: ${JSON.stringify(props.budgetten)} rekeningGroepSoort moet \'inkomsten\' zijn, er moet minimaal 1 budget zijn en alle budgetten moeten een geldige betaalDag hebben.`);
      return null
    // throw new Error(`BudgetInkomstenGrafiek: ${JSON.stringify(props.budgetten)} rekeningGroepSoort moet \'inkomsten\' zijn, er moet minimaal 1 budget zijn en alle budgetten moeten een geldige betaalDag hebben.`);
  }

  const inkomstenMoetOntvangenZijn = (betaalDag: number | undefined) => {
    if (betaalDag === undefined) return true;
    const betaalDagInPeriode = dagInPeriode(betaalDag, props.periode);
    return betaalDagInPeriode.isBefore(props.peilDatum) || betaalDagInPeriode.isSame(props.peilDatum);
  }

  type ExtendedInkomstenBudget = BudgetDTO & {
    inkomstenMoetOntvangenZijn: boolean;
    meerDanBudget: number;
    minderDanBudget: number;
    meerDanMaandBudget: number;
  }
  const extendedInkomstenBudget = props.budgetten.map((budget) => (
    {
      ...budget,
      inkomstenMoetOntvangenZijn: inkomstenMoetOntvangenZijn(budget.betaalDag),
      meerDanBudget: inkomstenMoetOntvangenZijn(budget.betaalDag) ? 0 : Math.min(budget.budgetBetaling ?? 0, budget.bedrag),
      minderDanBudget: inkomstenMoetOntvangenZijn(budget.betaalDag) ? Math.max(0, budget.bedrag - (budget.budgetBetaling ?? 0)) : 0,
      meerDanMaandBudget: Math.max(0, (budget.budgetBetaling ?? 0) - budget.bedrag),
    }));

  const maandBudget = extendedInkomstenBudget.reduce((acc, budget) => (acc + budget.bedrag), 0)

  const ontvangenBinnenBudget = extendedInkomstenBudget.reduce((acc, budget) =>
    (acc + (inkomstenMoetOntvangenZijn(budget.betaalDag) ? Math.min(budget.bedrag, budget.budgetBetaling ?? 0) : 0)), 0);

  const minderDanBudget = extendedInkomstenBudget.reduce((acc, budget) =>
    (acc + (inkomstenMoetOntvangenZijn(budget.betaalDag) ? Math.max(0, budget.bedrag - (budget.budgetBetaling ?? 0)) : 0)), 0);

  const meerDanBudget = extendedInkomstenBudget.reduce((acc, budget) =>
    acc + (inkomstenMoetOntvangenZijn(budget.betaalDag) ? 0 : Math.min(budget.budgetBetaling ?? 0, budget.bedrag)), 0);

  // const blaatToiTnuToe = ontvangenBinnenBudget + minderDanBudget + meerDanBudget;
  const meerDanMaandBudget = extendedInkomstenBudget.reduce((acc, budget) =>
    (acc + Math.max(0, (budget.budgetBetaling ?? 0) - budget.bedrag)), 0);

  const restMaandBudget = extendedInkomstenBudget.reduce((acc, budget) =>
    (acc + (inkomstenMoetOntvangenZijn(budget.betaalDag) ? 0 : Math.max(0, budget.bedrag - (budget.budgetBetaling ?? 0)))), 0);


  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = maandBudget + meerDanMaandBudget + 5;

  const berekenToestandInkomstenIcoon = (budget: ExtendedInkomstenBudget): JSX.Element => {
    if (budget.meerDanBudget === 0 && budget.minderDanBudget === 0 && budget.meerDanMaandBudget === 0) {
      if (!budget.inkomstenMoetOntvangenZijn)
        return <PlusIcon color="#1977d3" height={18} />
      else return <PlusIcon color="#green" height={18} />
    }
    if (budget.minderDanBudget > 0) return <MinIcon color="red" height={18} />
    if (budget.meerDanBudget > 0) return <PlusIcon color="lightgreen" height={18} />
    if (budget.meerDanMaandBudget > 0) return <PlusIcon color="green" height={18} />
    return <PlusIcon color="black" />
  }

  const berekenRekeningInkomstenIcoon = (): JSX.Element => {
    const height = props.visualisatie === 'icon-xs' ? 15 : 30;
    // console.log('berekenRekeningInkomstenIcoon', height);
    if (meerDanBudget === 0 && minderDanBudget === 0 && meerDanMaandBudget === 0) return <PlusIcon color="#green" height={height} />
    if (minderDanBudget > 0 && meerDanMaandBudget > 0) return <MinIcon color="green" height={height} />
    if (minderDanBudget > 0) return <MinIcon color="red" height={height} />
    if (meerDanMaandBudget > 0) return <PlusIcon color="green" height={height} />
    if (meerDanBudget > 0) return <PlusIcon color="green" height={height} />
    return <MinIcon color="black" />
  }
  // console.log('----------------------------------------------');
  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  // console.log('peilDatum', JSON.stringify(props.peilDatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  // console.log('budgetten', JSON.stringify(budgettenMetUitbreidingen));
  // console.log('maandBudget', JSON.stringify(maandBudget));
  // console.log('ontvangenBinnenBudget', JSON.stringify(ontvangenBinnenBudget));
  // console.log('minderDanBudget', JSON.stringify(minderDanBudget));
  // console.log('meerDanBudget', JSON.stringify(meerDanBudget));
  // console.log('restMaandBudget', JSON.stringify(restMaandBudget));
  // console.log('meerDanMaandBudget', JSON.stringify(meerDanMaandBudget));

  return (
    <>
      <Grid container
        columns={props.visualisatie === 'all' ? 2 : 0}
        size={props.visualisatie === 'all' ? 0 : 1}
        spacing={props.visualisatie === 'all' ? 2 : 0}>
        {(props.visualisatie === 'icon-sm' || props.visualisatie === 'icon-xs' || props.visualisatie === 'all') &&
          <Grid
            size={1}
            border={props.visualisatie === 'all' ? 1 : 0}
            borderRadius={2}
            p={props.visualisatie === 'all' ? 2 : 0}
            my={props.visualisatie === 'all' ? 5 : 1}
            boxShadow={props.visualisatie === 'all' ? 2 : 0} display="flex" alignItems="center">
            {berekenRekeningInkomstenIcoon()}
            {props.visualisatie !== 'icon-xs' &&
              <Typography
              sx={{ color: 'FFF', ml: 1, whiteSpace: 'nowrap' }}
              component="span"
              align="left">
              <strong>{props.RekeningGroep.naam}</strong>
            </Typography>}
          </Grid>}
      </Grid>
      {(props.visualisatie === 'bar' || props.visualisatie === 'all') &&
        <>
          <Grid size={2}>
            <Box display="flex" alignItems="center">
              <Typography variant='body2' sx={{ mr: 2 }}>
              <strong>{props.RekeningGroep.naam}</strong>
              </Typography>
              {extendedInkomstenBudget.length >= 1 &&
              <FormGroup>
                <FormControlLabel control={
                <Switch
                  sx={{ transform: 'scale(0.6)' }}
                  checked={toonBudgetInkomstenDetails}
                  onChange={handleToonBudgetInkomstenChange}
                  slotProps={{ input: { 'aria-label': 'controlled' } }}
                />}
                sx={{ mr: 0 }}
                label={
                  <Box display="flex" fontSize={'0.875rem'}>
                  Toon budget details inkomsten
                  </Box>
                } />
              </FormGroup>}
            </Box>
          </Grid>
          {toonBudgetInkomstenDetails &&
            <Grid size={2} alignItems={'flex-start'}>
              {extendedInkomstenBudget.map((budget, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {berekenToestandInkomstenIcoon(budget)}
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                    {budget.budgetNaam}: {formatAmount(budget.bedrag.toString())}<br/>
                    Betaaldag {budget.betaalDag && dagInPeriode(budget.betaalDag, props.periode).format('D MMMM')}<br/>
                    Ontvangen {formatAmount(budget.budgetBetaling?.toString() ?? "nvt")}<br/>
                    Dit is {budget.meerDanBudget === 0 && budget.minderDanBudget === 0 && budget.meerDanMaandBudget === 0 && ' zoals verwacht'}
                    {[budget.meerDanBudget > 0 && ' eerder dan verwacht',
                    budget.minderDanBudget > 0 && ` ${formatAmount(budget.minderDanBudget.toString())} minder dan verwacht`,
                    budget.meerDanMaandBudget > 0 && ` ${formatAmount(budget.meerDanMaandBudget.toString())} meer dan verwacht`
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
                  {ontvangenBinnenBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }}
                      align="right"
                      width={`${(ontvangenBinnenBudget / tabelBreedte) * 90}%`}
                    />}
                  {meerDanBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget === 0 ? '2px dotted #333' : 'none', }}
                      align="right"
                      width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((ontvangenBinnenBudget + meerDanBudget).toString())}
                    </TableCell>}
                  {meerDanMaandBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                      align="right"
                      width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((ontvangenBinnenBudget + meerDanBudget + meerDanMaandBudget).toString())}
                    </TableCell>}
                  {minderDanBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px' }}
                      align="right"
                      width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((ontvangenBinnenBudget + meerDanBudget + meerDanMaandBudget + minderDanBudget).toString())}
                    </TableCell>}
                  {restMaandBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget === 0 ? '2px dotted #333' : 'none' }}
                      align="right"
                      width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((ontvangenBinnenBudget + meerDanBudget + minderDanBudget + meerDanMaandBudget + restMaandBudget).toString())}
                    </TableCell>}
                  {restMaandBudget === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                    <TableCell />}
                </TableRow>

                <TableRow>
                  <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
                  {ontvangenBinnenBudget > 0 &&
                    <TableCell
                      width={`${(ontvangenBinnenBudget / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'grey',
                        borderBottom: '10px solid #333',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(ontvangenBinnenBudget.toString())}
                    </TableCell>}
                  {meerDanBudget > 0 &&
                    <TableCell
                      width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'lightGreen',
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
                        backgroundColor: 'green',
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
                        backgroundColor: 'red',
                        borderBottom: '10px solid red',
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
                  {ontvangenBinnenBudget > 0 &&
                    <TableCell
                      align="right"
                      width={`${(ontvangenBinnenBudget / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }} >
                      {meerDanBudget === 0 && meerDanMaandBudget === 0 && props.peilDatum.format('D/M')}
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
                      sx={{ p: 1, fontSize: '10px' }}>
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
          </TableContainer >
        </>}
    </>
  );
};

export default BudgetInkomstenGrafiek;