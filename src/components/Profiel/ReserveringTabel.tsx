import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  reserverenRekeningGroepSoorten,
  RekeningGroepSoort,
  BudgetType,
} from '../../model/RekeningGroep';
import { useCustomContext } from '../../context/CustomContext';
import { SaldoDTO } from '../../model/Saldo';
import { useState } from 'react';
import { HevelReserveOverForm } from './HevelReserveOverForm';

export const ReserveringTabel: React.FC = () => {
  const { rekeningGroepPerBetalingsSoort, stand, gekozenPeriode } =
    useCustomContext();

  const [overTeHevelenReserve, setOverTeHevelenReserve] = useState<
    string | undefined
  >(undefined);

  const handleHevelReserveOverClick = (rekeningNaam: string) => {
    console.log(
      'handleHevelReserveOverClick',
      rekeningNaam,
      stand?.resultaatOpDatum.find((item) => item.rekeningGroepNaam === rekeningNaam),
    );
    setOverTeHevelenReserve(rekeningNaam);
  };
  const formatAmount = (amount: number): string => {
    if (!amount) amount = 0;
    return amount.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const isHuidigePeriode = gekozenPeriode?.periodeStatus === 'HUIDIG';

  const isSpaarpot = (saldo: SaldoDTO) =>
    saldo.budgetType === BudgetType.sparen;

  return (
    <>
      {rekeningGroepPerBetalingsSoort.length > 0 && (
        <TableContainer
          component={Paper}
          sx={{ maxWidth: 'xl', m: 'auto', mt: '10px' }}
        >
          <Table sx={{ width: '100%' }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#888' }}>
                <TableCell sx={{ color: '#fff', padding: '15px' }}></TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  betaaldag
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  budget
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  opening
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  reservering
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  opgenomen
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  betalingen
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  reserve nu
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  nog nodig
                </TableCell>
                <TableCell align="right" sx={{ color: '#fff', padding: '5px' }}>
                  eindreserve
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <>
                {stand &&
                  stand.resultaatOpDatum
                    .filter((saldo) =>
                      reserverenRekeningGroepSoorten.includes(
                        saldo.rekeningGroepSoort as RekeningGroepSoort,
                      ),
                    )
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .reduce<{
                      rows: React.ReactNode[];
                      lastGroep?: string;
                    }>(
                      (acc, saldo, index) => {
                        if (saldo.rekeningGroepNaam !== acc.lastGroep) {
                          acc.rows.push(
                            <TableRow
                              key={`groep-${saldo.rekeningGroepNaam}-${index}`}
                            >
                              <TableCell
                                colSpan={10}
                                sx={{
                                  backgroundColor: '#f5f5f5',
                                  fontWeight: 'bold',
                                  padding: '5px',
                                }}
                              >
                                {saldo.rekeningGroepNaam}
                              </TableCell>
                            </TableRow>,
                          );
                          acc.lastGroep = saldo.rekeningGroepNaam;
                        }
                        acc.rows.push(
                          <TableRow key={saldo.rekeningNaam + index}>
                            <TableCell sx={{ padding: '5px' }}>
                              {saldo.rekeningNaam}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {saldo.budgetBetaalDag}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {formatAmount(saldo.budgetMaandBedrag)}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {formatAmount(saldo.openingsReserveSaldo)}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {formatAmount(saldo.reservering)}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {isSpaarpot(saldo)
                                ? formatAmount(
                                    saldo.openingsOpgenomenSaldo +
                                      saldo.opgenomenSaldo,
                                  )
                                : null}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {formatAmount(saldo.betaling)}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {formatAmount(
                                saldo.openingsReserveSaldo +
                                  saldo.reservering -
                                  saldo.betaling,
                              )}
                              {isHuidigePeriode ? (
                                <Button
                                  onClick={() =>
                                    handleHevelReserveOverClick(saldo.rekeningNaam)
                                  }
                                  sx={{
                                    minWidth: '24px',
                                    color: 'grey',
                                    p: '5px',
                                  }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </Button>
                              ) : (
                                ''
                              )}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {formatAmount(saldo.restMaandBudget)}
                            </TableCell>
                            <TableCell sx={{ padding: '5px' }} align="right">
                              {formatAmount(
                                saldo.openingsReserveSaldo +
                                  saldo.reservering -
                                  saldo.betaling -
                                  saldo.restMaandBudget,
                              )}
                            </TableCell>
                          </TableRow>,
                        );
                        return acc;
                      },
                      { rows: [], lastGroep: undefined },
                    ).rows}
              </>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {overTeHevelenReserve !== undefined && stand !== undefined && (
        <HevelReserveOverForm
          resultaatOpDatum={stand.resultaatOpDatum}
          geselecteerdeBestemming={overTeHevelenReserve}
          onHevelReserveOverClose={() => setOverTeHevelenReserve(undefined)}
        />
      )}
    </>
  );
};
