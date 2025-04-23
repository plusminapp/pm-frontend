import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

import { ExtendedAflossingDTO } from '../../model/Aflossing';
import { currencyFormatter } from '../../model/Betaling'
import dayjs from 'dayjs';


interface AflossingProps {
  aflossing: ExtendedAflossingDTO;
}

export default function AflossingTabel(props: AflossingProps) {
  const berekenMaandenTeGaan = (eindDatum: dayjs.Dayjs) => {
    return eindDatum.diff(dayjs(), 'month');;
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
                  {props.aflossing.dossierNummer}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Actuele stand
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossing.actueleStand ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Maandbedrag
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossing.aflossingsBedrag ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Achterstand begin periode
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(-(props.aflossing.deltaStartPeriode ?? 0))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Betaling deze periode
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossing.aflossingBetaling ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Achterstand nu
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossing.actueleAchterstand ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Betaaldag
                </TableCell>
                <TableCell align="right" size='small' >
                  {props.aflossing.betaalDag}e
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Eindbedrag
                </TableCell>
                <TableCell align="right" size='small' >
                  {currencyFormatter.format(props.aflossing.eindBedrag ?? 0)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                  Maanden te gaan
                </TableCell>
                <TableCell align="right" size='small' >
                  {berekenMaandenTeGaan(dayjs(props.aflossing.eindDatum) ?? dayjs())}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer >
    </>
  );
}
