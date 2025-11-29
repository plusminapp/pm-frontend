import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import StandGeneriekGrafiek from '../../components/Stand/StandGeneriekGrafiek';
import { SaldoDTO } from '../../model/Saldo';
import {
  berekenRekeningGroepIcoon,
  berekenRekeningGroepIcoonKleur,
} from './BerekenStandKleurEnTekst';
import { RekeningGroepDTO } from '../../model/RekeningGroep';

type SpaarGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  rekeningGroep: RekeningGroepDTO;
  resultaatOpDatum: SaldoDTO[];
  geaggregeerdResultaatOpDatum: SaldoDTO | undefined;
  toonDebug: boolean;
  detailsVisible: boolean;
};

export const SpaarGrafiek = ({
  peilDatum,
  periode,
  geaggregeerdResultaatOpDatum,
  resultaatOpDatum,
  detailsVisible,
  toonDebug,
}: SpaarGrafiekProps) => {
  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const betaaldBinnenBudget =
    geaggregeerdResultaatOpDatum?.betaaldBinnenBudget ?? 0;
  const maandBudget = geaggregeerdResultaatOpDatum?.budgetMaandBedrag ?? 0;
  const restMaandBudget = geaggregeerdResultaatOpDatum?.restMaandBudget ?? 0;
  const meerDanBudget = geaggregeerdResultaatOpDatum?.meerDanBudget ?? 0;
  const minderDanBudget = geaggregeerdResultaatOpDatum?.minderDanBudget ?? 0;
  const meerDanMaandBudget =
    geaggregeerdResultaatOpDatum?.meerDanMaandBudget ?? 0;

  const tabelBreedte = maandBudget + meerDanMaandBudget;

  const periodeLengte =
    dayjs(periode.periodeEindDatum).diff(
      dayjs(periode.periodeStartDatum),
      'day',
    ) + 1;
  const periodeVoorbij =
    dayjs(peilDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
  const percentagePeriodeVoorbij = (periodeVoorbij / periodeLengte) * 100;

  return (
    <Box sx={{ width: '100%', maxWidth: '500px' }}>
      <Box>
        {geaggregeerdResultaatOpDatum && (
          <StandGeneriekGrafiek
            statusIcon={berekenRekeningGroepIcoon(
              36,
              geaggregeerdResultaatOpDatum,
            )}
            percentageFill={percentagePeriodeVoorbij}
            headerText={'Spaarpotten'}
            rekeningIconNaam="spaartegoed"
            bodyText={'Je spaarpotten zijn helemaal bij!'}
            cfaText={''}
          />
        )}
      </Box>
      <TableContainer>
        <Table size={'small'}>
          <TableBody>
            <TableRow>
              {betaaldBinnenBudget > 0 && (
                <TableCell
                  width={`${(betaaldBinnenBudget / tabelBreedte) * 100}%`}
                  sx={{
                    backgroundColor: 'grey',
                    borderBottom: detailsVisible ? '4px solid #333' : '0px',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                  }}
                >
                  {detailsVisible && (
                    <>
                      {formatAmount(betaaldBinnenBudget.toString())}
                      <br />
                      gespaard
                    </>
                  )}
                </TableCell>
              )}
              {(meerDanMaandBudget > 0 || meerDanBudget > 0) && (
                <TableCell
                  width={`${((meerDanBudget + meerDanMaandBudget) / tabelBreedte) * 100}%`}
                  sx={{
                    backgroundColor: 'green',
                    borderBottom: detailsVisible ? '4px solid #333' : '0px',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                  }}
                >
                  {detailsVisible && (
                    <>
                      {formatAmount(
                        (meerDanBudget + meerDanMaandBudget).toString(),
                      )}
                      <br />
                      extra gespaard
                    </>
                  )}
                </TableCell>
              )}
              {minderDanBudget > 0 && (
                <TableCell
                  width={`${(minderDanBudget / tabelBreedte) * 100}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: !detailsVisible ? '0px' : '4px solid #1977d3',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                  }}
                >
                  {detailsVisible && (
                    <>
                      {formatAmount(minderDanBudget.toString())}
                      <br />
                      nog verwacht
                    </>
                  )}
                </TableCell>
              )}
              {restMaandBudget > 0 && (
                <TableCell
                  width={`${(restMaandBudget / tabelBreedte) * 100}%`}
                  sx={{
                    backgroundColor: '#1977d3',
                    borderBottom: detailsVisible ? '4px solid #1977d3' : '0px',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.7rem',
                  }}
                >
                  {detailsVisible && (
                    <>
                      {formatAmount(
                        (minderDanBudget + restMaandBudget).toString(),
                      )}
                      <br />
                      nog nodig
                    </>
                  )}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {toonDebug && (
        <Grid size={2} alignItems={'flex-start'}>
          <Typography
            variant="body2"
            sx={{ fontSize: '0.875rem', ml: 1, my: 2 }}
          >
            {resultaatOpDatum
              .filter(
                (saldo) => berekenRekeningGroepIcoonKleur(saldo) === 'red',
              )
              .map((saldo) => saldo.rekeningNaam)}
          </Typography>
          {geaggregeerdResultaatOpDatum && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              {berekenRekeningGroepIcoon(15, geaggregeerdResultaatOpDatum)}
              <Typography variant="body2" sx={{ fontSize: '0.875rem', ml: 1 }}>
                {geaggregeerdResultaatOpDatum.rekeningGroepNaam} geaggregeerd:{' '}
                <br />
                openingsBalansSaldo{' '}
                {formatAmount(
                  (
                    geaggregeerdResultaatOpDatum.openingsBalansSaldo ?? 0
                  ).toString(),
                )}
                <br />
                budgetMaandBedrag{' '}
                {formatAmount(
                  (
                    geaggregeerdResultaatOpDatum.budgetMaandBedrag ?? 0
                  ).toString(),
                )}
                <br />
                budgetOpPeilDatum:{' '}
                {formatAmount(
                  (
                    geaggregeerdResultaatOpDatum.budgetOpPeilDatum ?? 0
                  ).toString(),
                )}
                <br />
                achterstand $
                {formatAmount(
                  (geaggregeerdResultaatOpDatum.openingsAchterstand ?? 0).toString(),
                )}
                ,<br />
                betaald{' '}
                {formatAmount(
                  geaggregeerdResultaatOpDatum.periodeBetaling?.toString() ?? 'nvt',
                )}
                , <br />
                betaaldBinnenBudget{' '}
                {formatAmount(
                  geaggregeerdResultaatOpDatum.betaaldBinnenBudget?.toString() ??
                    'nvt',
                )}
                , <br />
                minderDanBudget $
                {formatAmount(
                  (
                    geaggregeerdResultaatOpDatum.minderDanBudget ?? 0
                  ).toString(),
                )}
                ,<br />
                meerDanBudget $
                {formatAmount(
                  (geaggregeerdResultaatOpDatum.meerDanBudget ?? 0).toString(),
                )}
                ,<br />
                meerDanMaandBudget $
                {formatAmount(
                  (
                    geaggregeerdResultaatOpDatum.meerDanMaandBudget ?? 0
                  ).toString(),
                )}
                ,<br />
                restMaandBudget $
                {formatAmount(
                  (
                    geaggregeerdResultaatOpDatum.restMaandBudget ?? 0
                  ).toString(),
                )}
                ,<br />
                achterstandOpPeilDatum $
                {formatAmount(
                  (
                    geaggregeerdResultaatOpDatum.periodeAchterstand ?? 0
                  ).toString(),
                )}
                ,
              </Typography>
            </Box>
          )}

          {resultaatOpDatum.map((saldo, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              {berekenRekeningGroepIcoon(15, saldo)}
              <Typography variant="body2" sx={{ fontSize: '0.875rem', ml: 1 }}>
                {saldo.rekeningNaam}: <br />
                openingsBalansSaldo{' '}
                {formatAmount((saldo.openingsBalansSaldo ?? 0).toString())}
                <br />
                budgetMaandBedrag{' '}
                {formatAmount((saldo.budgetMaandBedrag ?? 0).toString())}
                <br />
                budgetBetaalDag: {(saldo.budgetBetaalDag ?? 0).toString()}e
                <br />
                budgetOpPeilDatum:{' '}
                {formatAmount((saldo.budgetOpPeilDatum ?? 0).toString())}
                <br />
                achterstand ${formatAmount((saldo.openingsAchterstand ?? 0).toString())}
                ,<br />
                betaald {formatAmount(
                  saldo.periodeBetaling?.toString() ?? 'nvt',
                )}, <br />
                betaaldBinnenBudget{' '}
                {formatAmount(
                  saldo.betaaldBinnenBudget?.toString() ?? 'nvt',
                )}, <br />
                minderDanBudget $
                {formatAmount((saldo.minderDanBudget ?? 0).toString())},<br />
                meerDanBudget $
                {formatAmount((saldo.meerDanBudget ?? 0).toString())},<br />
                meerDanMaandBudget $
                {formatAmount((saldo.meerDanMaandBudget ?? 0).toString())},
                <br />
                restMaandBudget $
                {formatAmount((saldo.restMaandBudget ?? 0).toString())},<br />
                achterstandOpPeilDatum $
                {formatAmount((saldo.periodeAchterstand ?? 0).toString())},
              </Typography>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SpaarGrafiek;
