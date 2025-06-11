import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { BudgetType, RekeningGroepDTO, RekeningGroepSoort } from '../../model/RekeningGroep';
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';
import StandGeneriekGrafiek from './StandGeneriekGrafiek';
import { SaldoDTO } from '../../model/Saldo';
import { berekenBudgetStand } from '../../model/Budget';

type BudgetGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  rekeningGroep: RekeningGroepDTO
  resultaatOpDatum: SaldoDTO[];
  geaggregeerdResultaatOpDatum: SaldoDTO | undefined;
  detailsVisible: boolean;
};

export const BudgetGrafiek = ({ peilDatum, periode, rekeningGroep, geaggregeerdResultaatOpDatum, resultaatOpDatum, detailsVisible }: BudgetGrafiekProps) => {

  const grafiekType = rekeningGroep.rekeningGroepSoort === RekeningGroepSoort.inkomsten ? 'inkomsten' :
    rekeningGroep.budgetType === BudgetType.continu ? 'continu' :
      rekeningGroep.budgetType === BudgetType.vast ? 'vast' : 'onbekend';

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const betaaldBinnenBudget = geaggregeerdResultaatOpDatum?.betaaldBinnenBudget ?? 0;
  const maandBudget = geaggregeerdResultaatOpDatum?.budgetMaandBedrag ?? 0;
  const restMaandBudget = geaggregeerdResultaatOpDatum?.restMaandBudget ?? 0;
  const meerDanBudget = geaggregeerdResultaatOpDatum?.meerDanBudget ?? 0;
  const minderDanBudget = geaggregeerdResultaatOpDatum?.minderDanBudget ?? 0;
  const meerDanMaandBudget = geaggregeerdResultaatOpDatum?.meerDanMaandBudget ?? 0;

  const tabelBreedte = maandBudget + meerDanMaandBudget + 5;

  const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
  const periodeVoorbij = dayjs(peilDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
  const percentagePeriodeVoorbij = periodeVoorbij / periodeLengte * 100;

  const berekenBudgetIcoon = (budget: SaldoDTO): JSX.Element => {
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

  // const berekenRekeningIcoon = (): JSX.Element => {
  //   const height = visualisatie === 'icon-xs' ? 15 : 30;
  //   // console.log('berekenRekeningInkomstenIcoon', height);
  //   if (meerDanBudget === 0 && minderDanBudget === 0 && meerDanMaandBudget === 0) return <PlusIcon color="#green" height={height} />
  //   if (minderDanBudget > 0 && meerDanMaandBudget > 0) return <MinIcon color="green" height={height} />
  //   if (minderDanBudget > 0) return <MinIcon color="red" height={height} />
  //   if (meerDanMaandBudget > 0) return <PlusIcon color="green" height={height} />
  //   if (meerDanBudget > 0) return <PlusIcon color="green" height={height} />
  //   return <MinIcon color="black" />
  // }

  return (
    <>
      <Box sx={{ maxWidth: '500px' }}>
        <Box sx={{ cursor: 'pointer' }}>
          {geaggregeerdResultaatOpDatum &&
            <StandGeneriekGrafiek
              status={berekenBudgetStand(geaggregeerdResultaatOpDatum)}
              percentageFill={percentagePeriodeVoorbij}
              headerText={rekeningGroep.naam}
              bodyText={"Deze tekst moet nog wijzigen, maar dat kan ik nu nog niet"}
              cfoText={"En deze ook ..."}
              rekeningIconNaam={rekeningGroep.rekeningGroepIcoonNaam} />}
        </Box>

        <TableContainer >
          <Table size={'small'}>
            <TableBody>

              <TableRow>
                {betaaldBinnenBudget > 0 &&
                  <TableCell
                    width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: 'grey',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(betaaldBinnenBudget.toString())}
                  </TableCell>}
                {meerDanBudget > 0 &&
                  <TableCell
                    width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: grafiekType === 'continu' ? 'red' : 'lightgreen',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(meerDanBudget.toString())}
                  </TableCell>}
                {meerDanMaandBudget > 0 &&
                  <TableCell
                    width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: grafiekType === 'inkomsten' ? 'green' : grafiekType === 'vast' ? 'orange' : '#c00',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(meerDanMaandBudget.toString())}
                  </TableCell>}
                {minderDanBudget > 0 &&
                  <TableCell
                    width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: grafiekType === 'continu' ? 'green' : 'red',
                      borderBottom: !detailsVisible ? '0px' : grafiekType === 'continu' ? '4px solid green' : '4px solid red',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(minderDanBudget.toString())}
                  </TableCell>}
                {restMaandBudget > 0 &&
                  <TableCell
                    width={`${(restMaandBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: '#1977d3',
                      borderBottom: detailsVisible ? '4px solid #1977d3' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(restMaandBudget.toString())}
                  </TableCell>}
              </TableRow>

            </TableBody>
          </Table>
        </TableContainer >
        {detailsVisible && 
          <Grid size={2} alignItems={'flex-start'}>
            {resultaatOpDatum.map((saldo, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                {berekenBudgetIcoon(saldo)}
                <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                  {saldo.rekeningNaam}: {formatAmount((saldo.budgetMaandBedrag ?? 0).toString())}<br />
                  {/* Betaaldag {saldo.bud && dagInPeriode(saldo.betaalDag, periode).format('D MMMM')}<br /> */}
                  Betaald {formatAmount(saldo.budgetBetaling?.toString() ?? "nvt")}<br />
                  Dit is {(saldo.meerDanBudget ?? 0) === 0 && (saldo.minderDanBudget ?? 0) === 0 && (saldo.meerDanMaandBudget ?? 0) === 0 && ' zoals verwacht'}
                  {[(saldo.meerDanBudget ?? 0) > 0 && ' eerder dan verwacht',
                  (saldo.minderDanBudget ?? 0) > 0 && ` ${formatAmount((saldo.minderDanBudget ?? 0).toString())} minder dan verwacht`,
                  (saldo.meerDanMaandBudget ?? 0) > 0 && ` ${formatAmount((saldo.meerDanMaandBudget ?? 0).toString())} meer dan verwacht`
                  ].filter(Boolean).join(' en ')}.
                </Typography>
              </Box>
            ))}
          </Grid>}

      </Box>
    </>
  );
};

export default BudgetGrafiek;