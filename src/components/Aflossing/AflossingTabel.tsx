import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';

import { ExtendedAflossingDTO } from '../../model/Aflossing';
import { currencyFormatter } from '../../model/Betaling'
import { Box } from '@mui/material';


interface AflossingProps {
  aflossing: ExtendedAflossingDTO;
}

export default function AflossingTabel(props: AflossingProps) {

  return (
    <>
      <TableContainer sx={{ mr: 'auto', my: '10px' }}>
        <Table sx={{ width: "100%" }} aria-label="simple table">
          <TableHead>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align="left" size='small'>Startdatum</TableCell>
              <TableCell align="left" size='small'>Einddatum</TableCell>
              <TableCell align="right" size='small'>Bedrag totaal</TableCell>
              <TableCell align="right" size='small'>Bedrag/maand</TableCell>
              <TableCell align="right" size='small'>Betaaldag</TableCell>
              <TableCell align="left" size='small'>Dossiernummer</TableCell>
              <TableCell align="right" size='small'>Actuele {props.aflossing.actueleAchterstand <= 0 ? 'betaalachterstand' : 'betaalvoorsprong'}</TableCell>
              <TableCell align="right" size='small'>Actuele restschuld</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="left" size='small'>{props.aflossing.startDatum.toString()}</TableCell>
              <TableCell align="left" size='small'>{props.aflossing.eindDatum?.toString()}</TableCell>
              <TableCell align="right" size='small'>{currencyFormatter.format(props.aflossing.eindBedrag)}</TableCell>
              <TableCell align="right" size='small'>{currencyFormatter.format(props.aflossing.aflossingsBedrag)}</TableCell>
              <TableCell align="right" size='small'>{props.aflossing.betaalDag}</TableCell>
              <TableCell align="left" size='small'>{props.aflossing.dossierNummer}</TableCell>
              <TableCell align="right" size='small'>{currencyFormatter.format(props.aflossing.actueleAchterstand ?? 0)}</TableCell>
              <TableCell align="right" size='small'>{currencyFormatter.format(props.aflossing.actueleStand ?? 0)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' colSpan={4} >
                <Box sx={{ fontSize: '0.875rem' }}>
                  Betalingen deze periode: {currencyFormatter.format(props.aflossing.aflossingBetaling ?? 0)}
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left" size='small' colSpan={8}>
                <Box sx={{ fontSize: '0.875rem' }}>
                  Notities<br />{props.aflossing.notities}
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
