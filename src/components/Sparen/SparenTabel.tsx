import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

import { currencyFormatter } from '../../model/Betaling';
import { SaldoDTO } from '../../model/Saldo';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import { useCustomContext } from '../../context/CustomContext';

interface SparenProps {
  sparenSaldo: SaldoDTO;
}

export default function SparenTabel(props: SparenProps) {
  const { gekozenPeriode } = useCustomContext();

  const actueleStand =
    (props.sparenSaldo?.openingsBalansSaldo ?? 0) +
    (props.sparenSaldo?.periodeBetaling ?? 0);
  const maandenTeGaan =
    (props.sparenSaldo?.openingsBalansSaldo ?? 0) >=
    (props.sparenSaldo.spaarpot?.doelBedrag ?? 0)
      ? 0
      : Math.ceil(
          ((props.sparenSaldo.spaarpot?.doelBedrag ?? 0) - actueleStand) /
            (props.sparenSaldo?.budgetMaandBedrag ?? 1),
        );

  return (
    <>
      <TableContainer sx={{ mr: 'auto', my: '10px' }}>
        <Table sx={{ width: '100%' }} aria-label="simple table">
          <TableBody>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Stand op{' '}
                {dayjs(props.sparenSaldo?.budgetPeilDatum).format(
                  'D MMMM YYYY',
                )}
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(actueleStand)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Maandbedrag
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  (props.sparenSaldo?.budgetMaandBedrag ?? 0) +
                    (props.sparenSaldo?.openingsAchterstand ?? 0),
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Verwacht deze maand
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  props.sparenSaldo?.budgetMaandBedrag ?? 0,
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Betaling deze periode
              </TableCell>
              <TableCell align="right" size="small">
                {currencyFormatter.format(
                  Math.abs(props.sparenSaldo?.periodeBetaling ?? 0),
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Betaaldag
              </TableCell>
              <TableCell align="right" size="small">
                {props.sparenSaldo?.budgetBetaalDag}e
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                Spaardoel
              </TableCell>
              <TableCell align="right" size="small">
                {props.sparenSaldo?.spaarpot?.doelBedrag
                  ? currencyFormatter.format(
                      props.sparenSaldo?.spaarpot?.doelBedrag ?? 0,
                    )
                  : 'Geen bedrag ingesteld.'}
              </TableCell>
            </TableRow>
            {props.sparenSaldo?.spaarpot?.doelBedrag && (
              <TableRow>
                <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                  Maanden nog te gaan
                </TableCell>
                <TableCell align="right" size="small">
                  {maandenTeGaan}
                </TableCell>
              </TableRow>
            )}
            {props.sparenSaldo?.spaarpot?.doelBedrag && (
              <TableRow>
                <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                  Verwachte einddatum
                </TableCell>
                <TableCell align="right" size="small">
                  {dayjs(gekozenPeriode?.periodeEindDatum)
                    .add(props.sparenSaldo ? maandenTeGaan - 1 : 0, 'month')
                    .set('date', props.sparenSaldo?.budgetBetaalDag ?? 1)
                    .format('D-M-YYYY')}
                </TableCell>
              </TableRow>
            )}
            {props.sparenSaldo?.spaarpot?.doelBedrag && (
              <TableRow>
                <TableCell align="left" size="small" sx={{ fontWeight: '500' }}>
                  Doel einddatum
                </TableCell>
                <TableCell align="right" size="small">
                {props.sparenSaldo?.spaarpot?.doelDatum
                  ? dayjs(props.sparenSaldo?.spaarpot?.doelDatum).format('D-M-YYYY')
                  : 'Geen datum ingesteld.'}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={2} align="left" size="small">
                <Typography sx={{ fontSize: '0.85rem', fontWeight: '500' }}>
                  Notitie
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  {props.sparenSaldo?.spaarpot?.notities}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
