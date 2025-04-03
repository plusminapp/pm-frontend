import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';

import { aflossenBetalingsSoorten, BetalingDTO, BetalingsSoort, reserverenBetalingsSoorten } from '../../model/Betaling';
import { Fragment, useState } from 'react';

import { useCustomContext } from '../../context/CustomContext';
import { currencyFormatter } from '../../model/Betaling'
import { Button, Typography } from '@mui/material';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';

interface AflossingReserveringTabelProps {
  betalingen: BetalingDTO[];
  isAflossing: boolean;
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
}

export default function AflossingReserveringTabel(props: AflossingReserveringTabelProps) {

  const { actieveHulpvrager, gebruiker, gekozenPeriode } = useCustomContext();
  const betalingsSoorten = props.isAflossing ? aflossenBetalingsSoorten : reserverenBetalingsSoorten
  const betalingen = props.betalingen.filter(betaling => betaling.betalingsSoort && betalingsSoorten.includes(betaling.betalingsSoort))
  const [selectedBetaling, setSelectedBetaling] = useState<BetalingDTO | undefined>(undefined);

  const dateFormatter = (date: string) => {
    return new Intl.DateTimeFormat('nl-NL', { month: "short", day: "numeric" }).format(Date.parse(date))
  }

  const handleEditClick = (betaling: BetalingDTO) => {
    setSelectedBetaling(betaling);
  };

  const onUpsertBetalingClose = () => {
    setSelectedBetaling(undefined);
  };

  const isPeriodeOpen = gekozenPeriode?.periodeStatus === 'OPEN' || gekozenPeriode?.periodeStatus === 'HUIDIG';

  return (
    <>
      {betalingen.length === 0 &&
        <Typography sx={{ mx: '25px', fontSize: '12px' }}>{actieveHulpvrager?.id !== gebruiker?.id ? `${actieveHulpvrager!.bijnaam} heeft` : "Je hebt"} nog geen betalingen geregistreerd.</Typography>
      }
      {betalingen.length > 0 &&
        <>
          <TableContainer component={Paper} sx={{ maxWidth: "xl", m: 'auto', mt: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ p: "5px" }}>Datum</TableCell>
                  <TableCell sx={{ p: "5px" }} align="right">Bedrag</TableCell>
                  <TableCell sx={{ p: "5px" }}>Omschrijving</TableCell>
                  <TableCell sx={{ p: "5px" }}>&nbsp;</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {betalingen
                  .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1)
                  .map((betaling) => (
                    <Fragment key={betaling.id}>
                      <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        aria-haspopup="true"
                      >
                        <TableCell align="left" size='small' sx={{ p: "5px" }}>{dateFormatter(betaling["boekingsdatum"]?.toString())}</TableCell>
                        <TableCell align="right" size='small' sx={{ p: "5px" }}>
                          {betaling.betalingsSoort === BetalingsSoort.toevoegen_reservering ? currencyFormatter.format(betaling.bedrag) : currencyFormatter.format(-betaling.bedrag)}
                        </TableCell>
                        <TableCell align="left" size='small' sx={{ p: "5px" }}>{betaling["omschrijving"]}</TableCell>
                        {isPeriodeOpen &&
                          <TableCell size='small' sx={{ p: "5px" }}>
                            <Button onClick={() => handleEditClick(betaling)} sx={{ minWidth: '24px', p: "5px", color: 'grey' }}>
                              <EditIcon fontSize="small" />
                            </Button>
                          </TableCell>
                        }
                      </TableRow>
                    </Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {selectedBetaling &&
            <UpsertBetalingDialoog
              onUpsertBetalingClose={onUpsertBetalingClose}
              onBetalingBewaardChange={(betalingDTO) => props.onBetalingBewaardChange(betalingDTO)}
              onBetalingVerwijderdChange={(betalingDTO) => props.onBetalingVerwijderdChange(betalingDTO)}
              editMode={true}
              betaling={{ ...selectedBetaling, bron: selectedBetaling.bron, bestemming: selectedBetaling.bestemming }}
            />
          }
        </>}
    </>
  );
}
