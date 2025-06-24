import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { RekeningGroepDTO } from '../../model/RekeningGroep';
import StandGeneriekGrafiek from './StandGeneriekGrafiek';
import { SaldoDTO } from '../../model/Saldo';
import { berekenRekeningGroepIcoon } from './BerekenStandKleurEnTekst';

type BudgetGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  rekeningGroep: RekeningGroepDTO
  resultaatOpDatum: SaldoDTO[];
  geaggregeerdResultaatOpDatum: SaldoDTO | undefined;
  detailsVisible: boolean;
  toonDebug?: boolean;
};

export const StandGrafiek = ({ peilDatum, periode, rekeningGroep, geaggregeerdResultaatOpDatum, resultaatOpDatum, detailsVisible, toonDebug }: BudgetGrafiekProps) => {

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const budgetType = geaggregeerdResultaatOpDatum?.budgetType;
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

  return (
    <>
      <Box sx={{ maxWidth: '500px' }}>
        <Box sx={{ cursor: 'pointer' }}>
          {geaggregeerdResultaatOpDatum &&
            <StandGeneriekGrafiek
              statusIcon={berekenRekeningGroepIcoon(36, geaggregeerdResultaatOpDatum)}
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
                {meerDanBudget > 0 && budgetType !== 'CONTINU' &&
                  <TableCell
                    width={`${(meerDanBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: 'lightgreen',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(meerDanBudget.toString())}
                  </TableCell>}
                {meerDanMaandBudget > 0 && budgetType !== 'CONTINU' &&
                  <TableCell
                    width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: budgetType === 'INKOMSTEN' ? 'green' : budgetType === 'VAST' ? 'orange' : '#c00',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(meerDanMaandBudget.toString())}
                  </TableCell>}
                {(meerDanBudget > 0 || meerDanMaandBudget > 0) && budgetType === 'CONTINU' &&
                  <TableCell
                    width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: meerDanMaandBudget > 0 ? '#c00' : 'red',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount((meerDanBudget + meerDanMaandBudget).toString())}
                  </TableCell>}
                {minderDanBudget > 0 &&
                  <TableCell
                    width={`${(minderDanBudget / tabelBreedte) * 90}%`}
                    sx={{
                      backgroundColor: budgetType === 'CONTINU' ? 'green' : 'red',
                      borderBottom: !detailsVisible ? '0px' : budgetType === 'CONTINU' ? '4px solid green' : '4px solid red',
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
        {toonDebug &&
          <Grid size={2} alignItems={'flex-start'}>
            {resultaatOpDatum.map((saldo, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                {berekenRekeningGroepIcoon(15, saldo)}
                <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                  {saldo.rekeningNaam}: {formatAmount((saldo.budgetMaandBedrag ?? 0).toString())}, nu: {formatAmount((saldo.budgetOpPeilDatum ?? 0).toString())}<br />
                  {/* Betaaldag {saldo.bud && dagInPeriode(saldo.betaalDag, periode).format('D MMMM')}<br /> */}
                  Betaald {formatAmount(saldo.budgetBetaling?.toString() ?? "nvt")}&nbsp;
                  Dit is {(saldo.meerDanBudget ?? 0) === 0 && (saldo.minderDanBudget ?? 0) === 0 && (saldo.meerDanMaandBudget ?? 0) === 0 && ' zoals verwacht'}
                  {[((saldo.meerDanBudget ?? 0) > 0 || (saldo.meerDanMaandBudget ?? 0) > 0) && ` ${formatAmount(((saldo.meerDanBudget ?? 0) + (saldo.meerDanMaandBudget ?? 0)).toString())} meer dan verwacht`,
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

export default StandGrafiek;