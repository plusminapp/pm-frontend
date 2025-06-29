import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { RekeningGroepDTO } from '../../model/RekeningGroep';
import StandGeneriekGrafiek from './StandGeneriekGrafiek';
import { SaldoDTO } from '../../model/Saldo';
import { berekenRekeningGroepIcoon, berekenRekeningGroepIcoonKleur } from './BerekenStandKleurEnTekst';

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
  const achterstandNu = geaggregeerdResultaatOpDatum?.achterstandNu ?? 0;
  const betaaldBinnenBudget = geaggregeerdResultaatOpDatum?.betaaldBinnenBudget ?? 0;
  const maandBudget = geaggregeerdResultaatOpDatum?.budgetMaandBedrag ?? 0;
  const restMaandBudget = geaggregeerdResultaatOpDatum?.restMaandBudget ?? 0;
  const eerderDanBudget = geaggregeerdResultaatOpDatum?.eerderDanBudget ?? 0;
  const meerDanBudget = geaggregeerdResultaatOpDatum?.meerDanBudget ?? 0;
  const minderDanBudget = geaggregeerdResultaatOpDatum?.minderDanBudget ?? 0;
  const meerDanMaandBudget = geaggregeerdResultaatOpDatum?.meerDanMaandBudget ?? 0;

  const tabelBreedte = -achterstandNu + maandBudget + meerDanMaandBudget;

  const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
  const periodeVoorbij = dayjs(peilDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
  const percentagePeriodeVoorbij = periodeVoorbij / periodeLengte * 100;

  return (
    <>
      <Box sx={{ width: '100%', maxWidth: '500px' }}>
        <Box sx={{ cursor: 'pointer' }}>
          {geaggregeerdResultaatOpDatum &&
            <StandGeneriekGrafiek
              statusIcon={berekenRekeningGroepIcoon(36, geaggregeerdResultaatOpDatum)}
              percentageFill={percentagePeriodeVoorbij}
              headerText={rekeningGroep.naam}
              bodyText={"Nog te verzinnen tekst ... "}
              cfaText={berekenRekeningGroepIcoonKleur(geaggregeerdResultaatOpDatum) === 'red' ? "En deze ook ..." : ''}
              rekeningIconNaam={rekeningGroep.rekeningGroepIcoonNaam} />}
        </Box>

        <TableContainer >
          <Table size={'small'}>
            <TableBody>

              <TableRow>
                {achterstandNu < 0 &&
                  <TableCell
                    width={`${(achterstandNu / tabelBreedte) * 100}%`}
                    sx={{
                      backgroundColor: 'darkred',
                      borderBottom: detailsVisible ? '4px solid darkred' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount((-achterstandNu).toString())}
                  </TableCell>}
                {betaaldBinnenBudget > 0 &&
                  <TableCell
                    width={`${(betaaldBinnenBudget / tabelBreedte) * 100}%`}
                    sx={{
                      backgroundColor: 'grey',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(betaaldBinnenBudget.toString())}
                  </TableCell>}
                {eerderDanBudget > 0 && budgetType !== 'CONTINU' &&
                  <TableCell
                    width={`${(eerderDanBudget / tabelBreedte) * 100}%`}
                    sx={{
                      backgroundColor: 'lightgreen',
                      borderBottom: detailsVisible ? '4px solid #333' : '0px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '0.7rem'
                    }}>
                    {detailsVisible && formatAmount(eerderDanBudget.toString())}
                  </TableCell>}
                {meerDanMaandBudget > 0 && budgetType !== 'CONTINU' &&
                  <TableCell
                    width={`${(meerDanMaandBudget / tabelBreedte) * 100}%`}
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
                    width={`${(meerDanMaandBudget / tabelBreedte) * 100}%`}
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
                    width={`${(minderDanBudget / tabelBreedte) * 100}%`}
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
                    width={`${(restMaandBudget / tabelBreedte) * 100}%`}
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
            {geaggregeerdResultaatOpDatum && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                {berekenRekeningGroepIcoon(15, geaggregeerdResultaatOpDatum)}
                <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                  {geaggregeerdResultaatOpDatum.rekeningGroepNaam} geaggregeerd: <br />
                  budgetMaandBedrag {formatAmount(((geaggregeerdResultaatOpDatum.budgetMaandBedrag ?? 0)).toString())}<br />
                  budgetOpPeilDatum: {formatAmount((geaggregeerdResultaatOpDatum.budgetOpPeilDatum ?? 0).toString())}<br />
                  achterstand ${formatAmount(((geaggregeerdResultaatOpDatum.achterstand ?? 0)).toString())},<br />
                  betaald {formatAmount(geaggregeerdResultaatOpDatum.budgetBetaling?.toString() ?? "nvt")}, <br />
                  betaaldBinnenBudget {formatAmount(geaggregeerdResultaatOpDatum.betaaldBinnenBudget?.toString() ?? "nvt")}, <br />
                  eerderDanBudget ${formatAmount(((geaggregeerdResultaatOpDatum.eerderDanBudget ?? 0)).toString())},<br />
                  minderDanBudget ${formatAmount(((geaggregeerdResultaatOpDatum.minderDanBudget ?? 0)).toString())},<br />
                  meerDanBudget ${formatAmount(((geaggregeerdResultaatOpDatum.meerDanBudget ?? 0)).toString())},<br />
                  meerDanMaandBudget ${formatAmount(((geaggregeerdResultaatOpDatum.meerDanMaandBudget ?? 0)).toString())},<br />
                  achterstandNu ${formatAmount(((geaggregeerdResultaatOpDatum.achterstandNu ?? 0)).toString())},
                </Typography>
              </Box>)}

            {resultaatOpDatum.map((saldo, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                {berekenRekeningGroepIcoon(15, saldo)}
                <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                  {saldo.rekeningNaam}: <br />
                  budgetMaandBedrag {formatAmount(((saldo.budgetMaandBedrag ?? 0)).toString())}<br />
                  budgetBetaalDag: {(saldo.budgetBetaalDag ?? 0).toString()}e<br />
                  budgetOpPeilDatum: {formatAmount((saldo.budgetOpPeilDatum ?? 0).toString())}<br />
                  achterstand ${formatAmount(((saldo.achterstand ?? 0)).toString())},<br />
                  betaald {formatAmount(saldo.budgetBetaling?.toString() ?? "nvt")}, <br />
                  betaaldBinnenBudget {formatAmount(saldo.betaaldBinnenBudget?.toString() ?? "nvt")}, <br />
                  eerderDanBudget ${formatAmount(((saldo.eerderDanBudget ?? 0)).toString())},<br />
                  minderDanBudget ${formatAmount(((saldo.minderDanBudget ?? 0)).toString())},<br />
                  meerDanBudget ${formatAmount(((saldo.meerDanBudget ?? 0)).toString())},<br />
                  meerDanMaandBudget ${formatAmount(((saldo.meerDanMaandBudget ?? 0)).toString())},<br />
                  achterstandNu ${formatAmount(((saldo.achterstandNu ?? 0)).toString())},
                </Typography>
              </Box>
            ))}
          </Grid>}

      </Box>
    </>
  );
};

export default StandGrafiek;