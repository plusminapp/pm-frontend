import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

import { currencyFormatter } from '../../model/Betaling'
import { SaldoDTO } from '../../model/Saldo';
import dayjs from 'dayjs';


interface AflossingProps {
  aflossingSaldo?: SaldoDTO;
}

export default function AflossingTabel(props: AflossingProps) {

  const actueleStand = (props.aflossingSaldo?.openingsSaldo ?? 0) - (props.aflossingSaldo?.budgetBetaling ?? 0);
  const maandenTeGaan = ((props.aflossingSaldo?.openingsSaldo ?? 0) === 0)  ? 
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
                Actuele stand
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(actueleStand)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Maandbedrag
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(props.aflossingSaldo?.budgetMaandBedrag ?? 0)}
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
                {currencyFormatter.format(props.aflossingSaldo?.achterstandNu ?? 0)}
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
                Eindbedrag
              </TableCell>
              <TableCell align="right" size='small' >
                {currencyFormatter.format(props.aflossingSaldo?.aflossing?.eindBedrag ?? 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                Maanden te gaan
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
                {dayjs()
                  .add(props.aflossingSaldo ? maandenTeGaan : 0, 'month')
                  .set('date', props.aflossingSaldo?.budgetBetaalDag ?? 1)
                  .format('DD MMMM YYYY')}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer >
    </>
  );
}
