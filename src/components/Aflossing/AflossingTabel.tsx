import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

import { currencyFormatter } from '../../model/Betaling'
import { SaldoDTO } from '../../model/Saldo';
import dayjs from 'dayjs';
import { Typography } from '@mui/material';
import { useCustomContext } from '../../context/CustomContext';

interface AflossingProps {
  aflossingSaldo: SaldoDTO;
}

export default function AflossingTabel(props: AflossingProps) {

  const { gekozenPeriode } = useCustomContext();

  const actueleStand = (props.aflossingSaldo?.openingsSaldo ?? 0) + (props.aflossingSaldo?.budgetBetaling ?? 0);
  const maandenTeGaan = ((props.aflossingSaldo?.openingsSaldo ?? 0) === 0) ?
    0 : Math.ceil(-(actueleStand / (props.aflossingSaldo?.budgetMaandBedrag ?? 1)));

  return (
    <>
      < TableContainer sx={{ mr: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableBody>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Dossiernummer
              </TableCell>
              <TableCell align="right" size='small' >
                {props.aflossingSaldo?.aflossing?.dossierNummer}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Stand op {dayjs(props.aflossingSaldo?.budgetPeilDatum).format('D MMMM YYYY')}
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(actueleStand)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Achterstand begin periode
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(props.aflossingSaldo?.achterstand ?? 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Maandbedrag
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format((props.aflossingSaldo?.budgetMaandBedrag ?? 0) + (props.aflossingSaldo?.achterstand ?? 0))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Verwacht deze maand
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(props.aflossingSaldo?.budgetMaandBedrag ?? 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Betaling deze periode
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(Math.abs(props.aflossingSaldo?.budgetBetaling ?? 0))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Achterstand nu
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format((props.aflossingSaldo?.budgetBetaling ?? 0) - (props.aflossingSaldo?.budgetMaandBedrag ?? 0))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Betaaldag
              </TableCell>
              <TableCell align="right" size='small' >
                {props.aflossingSaldo?.budgetBetaalDag}e
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Oorspronkelijke schuld
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(props.aflossingSaldo?.aflossing?.eindBedrag ?? 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Maanden nog te gaan
              </TableCell>
              <TableCell align="right" size='small' >
                {maandenTeGaan}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Verwachte einddatum
              </TableCell>
              <TableCell align="right" size='small' >
                {dayjs(gekozenPeriode?.periodeEindDatum)
                  .add(props.aflossingSaldo ? maandenTeGaan - 1 : 0, 'month')
                  .set('date', props.aflossingSaldo?.budgetBetaalDag ?? 1)
                  .format('D-M-YYYY')}
              </TableCell>
            </TableRow>
            <TableRow >
              <TableCell colSpan={2} align="left" size='small' >
                <Typography sx={{ fontSize: '0.85rem', fontWeight: '500' }}>
                  Notitie
                </Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>
                  {props.aflossingSaldo?.aflossing?.notities}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
