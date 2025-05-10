import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { dagInPeriode, Periode } from '../../model/Periode';
import { BudgetType, Rekening, RekeningSoort } from '../../model/Rekening';
import { BudgetDTO } from '../../model/Budget';
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';
import { useState } from 'react';

type BudgetGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  rekening: Rekening
  geaggregeerdBudget: BudgetDTO | undefined;
  budgetten: BudgetDTO[];
  toonBudgetDetails: boolean;
  visualisatie?: 'bar' | 'icon-sm' | 'icon-xs' | 'all';
};

export const BudgetGrafiek = ({ periode, rekening, geaggregeerdBudget, budgetten, toonBudgetDetails, visualisatie }: BudgetGrafiekProps) => {

  const grafiekType = rekening.rekeningSoort === RekeningSoort.inkomsten  || rekening.rekeningSoort === RekeningSoort.rente ? 'inkomsten' :
    rekening.budgetType === BudgetType.continu ? 'continu' : 
    rekening.budgetType === BudgetType.vast ? 'vast' : 'onbekend';

  console.log('BudgetGrafiek', grafiekType, rekening.naam);

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const betaaldBinnenBudget = geaggregeerdBudget?.betaaldBinnenBudget ?? 0;
  const maandBudget = geaggregeerdBudget?.budgetMaandBedrag ?? 0;
  const restMaandBudget = geaggregeerdBudget?.restMaandBudget ?? 0;
  const meerDanBudget = geaggregeerdBudget?.meerDanBudget ?? 0;
  const minderDanBudget = geaggregeerdBudget?.minderDanBudget ?? 0;
  const meerDanMaandBudget = geaggregeerdBudget?.meerDanMaandBudget ?? 0;

  const tabelBreedte = maandBudget + meerDanMaandBudget + 5;

  const berekenBudgetIcoon = (budget: BudgetDTO): JSX.Element => {
    if ((budget.meerDanBudget ?? 0) === 0 && (budget.minderDanBudget ?? 0) === 0 && (budget.meerDanMaandBudget ?? 0) === 0) {
      if ((budget.betaaldBinnenBudget ?? 0) === 0)
        return <PlusIcon color="#1977d3" height={18} />
      else return <PlusIcon color="#green" height={18} />
    }
    if ((budget.minderDanBudget ?? 0) > 0) return <MinIcon color="red" height={18} />
    if ((budget.meerDanBudget ?? 0) > 0) return <PlusIcon color="lightgreen" height={18} />
    if ((budget.meerDanMaandBudget ?? 0) > 0) return <PlusIcon color="green" height={18} />
    return <PlusIcon color="black" />
  }

  const berekenRekeningIcoon = (): JSX.Element => {
    const height = visualisatie === 'icon-xs' ? 15 : 30;
    // console.log('berekenRekeningInkomstenIcoon', height);
    if (meerDanBudget === 0 && minderDanBudget === 0 && meerDanMaandBudget === 0) return <PlusIcon color="#green" height={height} />
    if (minderDanBudget > 0 && meerDanMaandBudget > 0) return <MinIcon color="green" height={height} />
    if (minderDanBudget > 0) return <MinIcon color="red" height={height} />
    if (meerDanMaandBudget > 0) return <PlusIcon color="green" height={height} />
    if (meerDanBudget > 0) return <PlusIcon color="green" height={height} />
    return <MinIcon color="black" />
  }

    const [detailsVisible, setDetailsVisible] = useState(false);
    const toggleDetails = () => {
      setDetailsVisible(!detailsVisible);
    }
  
  return (
    <>
      <Grid container
        columns={visualisatie === 'all' ? 2 : 0}
        size={visualisatie === 'all' ? 0 : 1}
        spacing={visualisatie === 'all' ? 2 : 0}>
        {(visualisatie === 'icon-sm' || visualisatie === 'icon-xs' || visualisatie === 'all') &&
          <Grid
            size={1}
            border={visualisatie === 'all' ? 1 : 0}
            borderRadius={2}
            p={visualisatie === 'all' ? 2 : 0}
            my={visualisatie === 'all' ? 5 : 1}
            boxShadow={visualisatie === 'all' ? 2 : 0} display="flex" alignItems="center">
            {berekenRekeningIcoon()}
            {visualisatie !== 'icon-xs' &&
              <Typography
                sx={{ color: 'FFF', ml: 1, whiteSpace: 'nowrap' }}
                component="span"
                align="left">
                <strong>{rekening.naam}</strong>
              </Typography>}
          </Grid>}
      </Grid>
        <>
          <TableContainer onClick={toggleDetails}>
            <Table>
              <TableBody>

                <TableRow>
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
                        backgroundColor: grafiekType === 'continu' ? 'red' : 'lightgreen',
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
                        backgroundColor: grafiekType === 'inkomsten' ? 'green' : grafiekType === 'vast' ? 'orange' : '#c00',
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
                        backgroundColor: grafiekType === 'continu' ? 'green' : 'red',
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
                </TableRow>

                <TableRow>
                  <TableCell width={'5%'} />
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
                      sx={{ p: 1, fontSize: '10px' }}//, borderRight: '2px dotted #333' }}
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
                </TableRow>

              </TableBody>
            </Table>
          </TableContainer >
          {toonBudgetDetails &&
            <Grid size={2} alignItems={'flex-start'}>
              {budgetten.map((budget, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {berekenBudgetIcoon(budget)}
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                    {budget.budgetNaam}: {formatAmount((budget.budgetMaandBedrag ?? 0).toString())}<br />
                    Betaaldag {budget.betaalDag && dagInPeriode(budget.betaalDag, periode).format('D MMMM')}<br />
                    Betaald {formatAmount(budget.budgetBetaling?.toString() ?? "nvt")}<br />
                    Dit is {(budget.meerDanBudget ?? 0) === 0 && (budget.minderDanBudget ?? 0) === 0 && (budget.meerDanMaandBudget ?? 0) === 0 && ' zoals verwacht'}
                    {[(budget.meerDanBudget ?? 0) > 0 && ' eerder dan verwacht',
                    (budget.minderDanBudget ?? 0) > 0 && ` ${formatAmount((budget.minderDanBudget ?? 0).toString())} minder dan verwacht`,
                    (budget.meerDanMaandBudget ?? 0) > 0 && ` ${formatAmount((budget.meerDanMaandBudget ?? 0).toString())} meer dan verwacht`
                    ].filter(Boolean).join(' en ')}.
                  </Typography>
                </Box>
              ))}
            </Grid>}

        </>
    </>
  );
};

export default BudgetGrafiek;