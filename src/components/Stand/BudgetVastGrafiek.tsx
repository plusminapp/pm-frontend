import { Box, FormControlLabel, FormGroup, Switch, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { dagInPeriode, Periode } from '../../model/Periode';
import { Rekening, RekeningSoort } from '../../model/Rekening';
import { useState } from 'react';
import { BudgetDTO } from '../../model/Budget';
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';

type BudgetVastGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  budgetten: BudgetDTO[];
  visualisatie: string;
};

export const BudgetVastGrafiek = (props: BudgetVastGrafiekProps) => {

  const [toonBudgetVastDetails, setToonBudgetVastDetails] = useState<boolean>(localStorage.getItem('toonBudgetAflossingDetails') === 'true');
  const handleToonBudgetVastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonBudgetAflossingDetails', event.target.checked.toString());
    setToonBudgetVastDetails(event.target.checked);
  };

  if (props.rekening.rekeningSoort.toLowerCase() !== RekeningSoort.uitgaven.toLowerCase() ||
    props.budgetten.length === 0 ||
    props.budgetten.some(budget => budget.betaalDag === undefined) ||
    props.budgetten.some(budget => (budget?.betaalDag ?? 0) < 1) ||
    props.budgetten.some(budget => (budget?.betaalDag ?? 30) > 28)) {
      return null;
    // throw new Error(`BudgetVastGrafiek: ${JSON.stringify(props.budgetten)}rekeningSoort moet \'uitgaven\' zijn, er moet minimaal 1 budget zijn en alle budgetten moeten een geldige betaalDag hebben.`);
  }

  const uitgaveMoetBetaaldZijn = (betaalDag: number | undefined) => {
    if (betaalDag === undefined) return true;
    const betaalDagInPeriode = dagInPeriode(betaalDag, props.periode);
    return betaalDagInPeriode.isBefore(props.peilDatum) || betaalDagInPeriode.isSame(props.peilDatum);
  }
  type ExtendedVastBudget = BudgetDTO & {
    uitgaveMoetBetaaldZijn: boolean;
    meerDanBudget: number;
    minderDanBudget: number;
    meerDanMaandBudget: number;
  }
  const extendedVastBudget = props.budgetten.map((budget) => (
    {
      ...budget,
      budgetBetaling: (budget.budgetBetaling ?? 0),
      uitgaveMoetBetaaldZijn: uitgaveMoetBetaaldZijn(budget.betaalDag),
      meerDanBudget: uitgaveMoetBetaaldZijn(budget.betaalDag) ? 0 : Math.min((budget.budgetBetaling ?? 0), budget.bedrag),
      minderDanBudget: uitgaveMoetBetaaldZijn(budget.betaalDag) ? Math.max(0, budget.bedrag - (budget.budgetBetaling ?? 0)) : 0,
      meerDanMaandBudget: Math.max(0, -(budget.budgetBetaling ?? 0) - budget.bedrag)
    } as ExtendedVastBudget));

  const maandBudget = extendedVastBudget.reduce((acc, budget) => (acc + budget.bedrag), 0)

  const betaaldBinnenBudget = extendedVastBudget.reduce((acc, budget) =>
    (acc + (uitgaveMoetBetaaldZijn(budget.betaalDag) ? Math.min(budget.bedrag, budget.budgetBetaling ?? 0) : 0)), 0);

  const minderDanBudget = extendedVastBudget.reduce((acc, budget) =>
    (acc + (uitgaveMoetBetaaldZijn(budget.betaalDag) ? Math.max(0, budget.bedrag - (budget.budgetBetaling ?? 0)) : 0)), 0);

  const meerDanBudget = extendedVastBudget.reduce((acc, budget) =>
    acc + (uitgaveMoetBetaaldZijn(budget.betaalDag) ? 0 : Math.min(budget.budgetBetaling ?? 0, budget.bedrag)), 0);

  const meerDanMaandBudget = extendedVastBudget.reduce((acc, budget) =>
    (acc + Math.max(0, (budget.budgetBetaling ?? 0) - budget.bedrag)), 0);

  const restMaandBudget = extendedVastBudget.reduce((acc, budget) =>
    (acc + (uitgaveMoetBetaaldZijn(budget.betaalDag) ? 0 : Math.max(0, budget.bedrag - (budget.budgetBetaling ?? 0)))), 0);


  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const tabelBreedte = maandBudget + meerDanMaandBudget + 5;

  const berekenToestandVastIcoon = (budget: ExtendedVastBudget): JSX.Element => {
    if (budget.meerDanBudget === 0 && budget.minderDanBudget === 0 && budget.meerDanMaandBudget === 0) {
      if (!budget.uitgaveMoetBetaaldZijn)
        return <PlusIcon color="#1977d3" height={18} />
      else return <PlusIcon color="#green" height={18} />
    }
    if (budget.minderDanBudget > 0) return <MinIcon color="red" height={18} />
    if (budget.meerDanMaandBudget > 0) return <PlusIcon color="orange" height={18} />
    if (budget.meerDanBudget > 0) return <PlusIcon color="lightgreen" height={18} />
    return <PlusIcon color="black" height={18} />
  }
  const berekenRekeningVastIcoon = (): JSX.Element => {
    if (meerDanBudget === 0 && minderDanBudget === 0 && meerDanMaandBudget === 0) return <PlusIcon color="#green" height={30} />
    if (minderDanBudget > 0) return <MinIcon color="red" height={30} />
    if (meerDanMaandBudget > 0) return <PlusIcon color="orange" height={30} />
    if (meerDanBudget > 0) return <PlusIcon color="lightgreen" height={30} />
    return <MinIcon color="black" />
  }

  // console.log('----------------------------------------------');
  // console.log('props.periode.periodeStartDatum.', JSON.stringify(props.periode.periodeStartDatum));
  // console.log('props.periode.periodeEindDatum.', JSON.stringify(props.periode.periodeEindDatum));
  // console.log('peilDatum', JSON.stringify(props.peilDatum));
  // console.log('periodeLengte', JSON.stringify(periodeLengte));
  // console.log('budgetten', JSON.stringify(extendedVastBudget));
  // console.log('maandBudget', JSON.stringify(maandBudget));
  // console.log('betaaldBinnenBudget', JSON.stringify(betaaldBinnenBudget));
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
        {(props.visualisatie === 'icon-sm' || props.visualisatie === 'all') &&
          <Grid
            size={1}
            border={props.visualisatie === 'all' ? 1 : 0}
            borderRadius={2}
            p={props.visualisatie === 'all' ? 2 : 0}
            my={props.visualisatie === 'all' ? 5 : 1}
            boxShadow={props.visualisatie === 'all' ? 2 : 0} display="flex" alignItems="center">
            {berekenRekeningVastIcoon()}
            <Typography
              sx={{ color: 'FFF', ml: 1, whiteSpace: 'nowrap' }}
              component="span"
              align="left">
              <strong>{props.rekening.naam}</strong>
            </Typography>
          </Grid>}
      </Grid>

      {(props.visualisatie === 'bar' || props.visualisatie === 'all') &&
        <>
          <Grid size={2} flexDirection={'row'}>
            <Box display="flex" alignItems="center">
              <Typography variant='body2' sx={{ mr: 2 }}>
              <strong>{props.rekening.naam}</strong>
              </Typography>
              {extendedVastBudget.length >= 1 &&
              <FormGroup>
                <FormControlLabel control={
                <Switch
                  sx={{ transform: 'scale(0.6)' }}
                  checked={toonBudgetVastDetails}
                  onChange={handleToonBudgetVastChange}
                  slotProps={{ input: { 'aria-label': 'controlled' } }}
                />}
                sx={{ mr: 0 }}
                label={
                  <Box display="flex" fontSize={'0.875rem'}>
                  Toon budget details vast
                  </Box>
                } />
              </FormGroup>}
            </Box>
          </Grid>
          {toonBudgetVastDetails &&
            <Grid size={2} alignItems={'flex-start'}>
              {extendedVastBudget.map((budget, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {berekenToestandVastIcoon(budget)}
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                    {budget.budgetNaam}: {formatAmount(budget.bedrag.toString())}, betaaldag {budget.betaalDag && dagInPeriode(budget.betaalDag, props.periode).format('D MMMM')},&nbsp;
                    waarvan {formatAmount(budget.budgetBetaling?.toString() ?? "nvt")} is betaald; dit is
                    {budget.meerDanBudget === 0 && budget.minderDanBudget === 0 && budget.meerDanMaandBudget === 0 && ' zoals verwacht'}
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
                  {betaaldBinnenBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanBudget === 0 && meerDanMaandBudget === 0 ? '2px dotted #333' : 'none' }}
                      align="right"
                      width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
                    />}
                  {meerDanBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudget === 0 ? '2px dotted #333' : 'none', }}
                      align="right"
                      width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenBudget + meerDanBudget).toString())}
                    </TableCell>}
                  {meerDanMaandBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                      align="right"
                      width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenBudget + meerDanBudget + meerDanMaandBudget).toString())}
                    </TableCell>}
                  {minderDanBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px' }}
                      align="right"
                      width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenBudget + meerDanBudget + meerDanMaandBudget + minderDanBudget).toString())}
                    </TableCell>}
                  {restMaandBudget > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderLeft: minderDanBudget === 0 ? '2px dotted #333' : 'none' }}
                      align="right"
                      width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenBudget + meerDanBudget + minderDanBudget + meerDanMaandBudget + restMaandBudget).toString())}
                    </TableCell>}
                  {restMaandBudget === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                    <TableCell />}
                </TableRow>

                <TableRow>
                  <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
                  {betaaldBinnenBudget > 0 &&
                    <TableCell
                      width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'grey',
                        borderBottom: '10px solid #333',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(betaaldBinnenBudget.toString())}
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
                        backgroundColor: 'orange',
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
                  {betaaldBinnenBudget > 0 &&
                    <TableCell
                      align="right"
                      width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
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

export default BudgetVastGrafiek;