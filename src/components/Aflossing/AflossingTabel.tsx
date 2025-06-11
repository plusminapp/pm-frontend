import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

import { currencyFormatter } from '../../model/Betaling'
import { SaldoDTO } from '../../model/Saldo';
import { RekeningDTO } from '../../model/Rekening';


interface AflossingProps {
  aflossingSaldo: SaldoDTO;
  aflossing: RekeningDTO;
}

export default function AflossingTabel(props: AflossingProps) {
  const berekenMaandenTeGaan = () => {
    if (props.aflossingSaldo.saldo > 0) { 
      return 0 
    } else {
      return Math.ceil(
        -(props.aflossingSaldo.saldo ?? 0) / (props.aflossing.budgetMaandBedrag ?? 1)
      );  
    }
  }

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
                  {props.aflossing.aflossing?.dossierNummer}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Actuele stand
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossingSaldo.saldo ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Maandbedrag
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossing.budgetMaandBedrag ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Achterstand begin periode
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossingSaldo.achterstand ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Betaling deze periode
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(-(props.aflossingSaldo.budgetBetaling ?? 0))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Achterstand nu
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossingSaldo.achterstandNu ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Betaaldag
                </TableCell>
                <TableCell align="right" size='small' >
                  {props.aflossing.budgetBetaalDag}e
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Eindbedrag
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossing.aflossing?.eindBedrag ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Maanden te gaan
                </TableCell>
                <TableCell align="right" size='small' >
                  {berekenMaandenTeGaan()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer >
    </>
  );
}
