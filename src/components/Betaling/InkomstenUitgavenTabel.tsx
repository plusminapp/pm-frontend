import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { BetalingDTO, currencyFormatter } from '../../model/Betaling';
import { useEffect, useState } from 'react';

import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useCustomContext } from '../../context/CustomContext';
import { berekenBedragVoorRekenining, Rekening } from '../../model/Rekening';
import UpsertBetalingDialoog from './UpsertBetalingDialoog';
import dayjs from 'dayjs';
import React from 'react';
import { InfoIcon } from '../../icons/Info';

interface InUitTabelProps {
  actueleRekening: Rekening | undefined;
  isFilterSelectable?: boolean;
  isOcr?: boolean;
  betalingen: BetalingDTO[];
  onBetalingBewaardChange: (betalingDTO: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betalingDTO: BetalingDTO) => void;
}

export default function InkomstenUitgavenTabel(props: InUitTabelProps) {

  const { actieveHulpvrager, gebruiker, rekeningen, gekozenPeriode, setSnackbarMessage } = useCustomContext();
  const betalingen = props.betalingen
  const [actueleRekening, setActueleRekening] = useState<Rekening | undefined>(props.actueleRekening)
  const [filteredBetalingen, setFilteredBetalingen] = useState<{ [key: string]: BetalingDTO[] }>({})
  const [selectedBetaling, setSelectedBetaling] = useState<BetalingDTO | undefined>(undefined);
  const [verwerkteBetalingen, setVerwerkteBetalingen] = useState<string[]>([]);
  const handleEditClick = (sortOrder: string) => {
    if (props.isOcr && verwerkteBetalingen.includes(sortOrder)) {
      setSnackbarMessage({ message: toonVerwerkteBetalingMeassage, type: 'info' });
    } else {
      const betaling = betalingen.find(b => b.sortOrder === sortOrder);
      setSelectedBetaling(betaling);
    }
  };

  useEffect(() => {
    if (betalingen.length > 0) {
      const filterBetalingenOpBronBestemming = betalingen
        .filter((betaling) => betaling.bron === actueleRekening?.naam || betaling.bestemming === actueleRekening?.naam || actueleRekening === undefined)
        .reduce((acc, item) => {
          if (!acc[item.boekingsdatum.toString()]) {
            acc[item.boekingsdatum.toString()] = [];
          }
          acc[item.boekingsdatum.toString()].push(item);
          return acc;
        }, {} as { [key: string]: BetalingDTO[] });
      setFilteredBetalingen(filterBetalingenOpBronBestemming)
    }
  }, [actueleRekening, betalingen, setFilteredBetalingen]);

  const handleWeergaveChange = (event: SelectChangeEvent) => {
    setActueleRekening(rekeningen.find(r => r.naam === event.target.value))
  };

  const onUpsertBetalingClose = () => {
    setSelectedBetaling(undefined);
  };

  const formatAmount = (amount: string): string => {
    return currencyFormatter.format(parseFloat(amount))
  };

  const onBetalingBewaardChange = (betalingDTO: BetalingDTO) => {
    props.onBetalingBewaardChange(betalingDTO);
    if (props.isOcr) setVerwerkteBetalingen([...verwerkteBetalingen, betalingDTO?.sortOrder]);
  };

  const onBetalingVerwijderdChange = (betalingDTO: BetalingDTO) => {
    props.onBetalingVerwijderdChange(betalingDTO);
    if (props.isOcr) setVerwerkteBetalingen([...verwerkteBetalingen, betalingDTO?.sortOrder]);
  };

  const toonVerwerkteBetalingMeassage = 'Deze betaling is verwerkt. Je kunt deze hier niet meer bewerken of verwijderen. ' +
    'Je kunt m terugvinden in het kasboek. Daar kan je m eventueel nog aanpassen. Als je de betaling hier onbedoeld hebt ' +
    'verwijderd kun je de schermafbeelding nog een keer inlezen: dubbele betaingen zijn duidelijk herkenbaar en kun je ' +
    'gemakkelijk overslaan of weggooien.';

  const isPeriodeOpen = gekozenPeriode?.periodeStatus === 'OPEN' || gekozenPeriode?.periodeStatus === 'HUIDIG';

  return (
    <>
      {props.isFilterSelectable &&
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">Weergave kiezen</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={actueleRekening ? actueleRekening.naam : 'alles'}
            onChange={handleWeergaveChange}
            label="Weergave kiezen">
            <MenuItem value='alles'>Alle betalingen</MenuItem>
            {rekeningen.map((rekening) => (
              <MenuItem value={rekening.naam}>{rekening.naam}</MenuItem>
            ))}
          </Select>
        </FormControl>
      }
      {Object.keys(filteredBetalingen).length === 0 &&
        <Typography sx={{ mx: '25px', fontSize: '12px' }}>
          {actieveHulpvrager?.id !== gebruiker?.id ? `${actieveHulpvrager!.bijnaam} heeft` : "Je hebt"} nog geen betalingen geregistreerd{actueleRekening ? ` voor ${actueleRekening.naam}` : ''}.
        </Typography>
      }
      {Object.keys(filteredBetalingen).length > 0 &&
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {Object.keys(filteredBetalingen).map((date) => (
                  <React.Fragment key={date}>
                    {props.isOcr &&
                      <TableRow>
                        <TableCell colSpan={3} sx={{ fontWeight: '900', padding: '5px' }}>
                          {dayjs(date).year() === dayjs().year() ? dayjs(date).format('D MMMM') : dayjs(date).format('D MMMM YYYY')}
                        </TableCell>
                      </TableRow>}
                    {filteredBetalingen[date].map((item) => (
                      <TableRow key={item.sortOrder}>
                        {!props.isOcr &&
                          <TableCell sx={{ padding: '5px' }} onClick={() => handleEditClick(item.sortOrder)}>
                            {dayjs(date).year() === dayjs().year() ? dayjs(date).format('D MMMM') : dayjs(date).format('D MMMM YYYY')}
                          </TableCell>}
                        <TableCell sx={{ padding: '5px', color: verwerkteBetalingen.includes(item.sortOrder) ? 'lightgrey' : 'inherit' }}
                          onClick={() => handleEditClick(item.sortOrder)}>
                          {props.isOcr ? item.ocrOmschrijving : item.omschrijving}
                          {item.bestaatAl && !verwerkteBetalingen.includes(item.sortOrder) &&
                            <>
                              <br />
                              <Typography variant="caption" color="error">Bestaat al met omschrijving {item.omschrijving}</Typography>
                            </>}
                        </TableCell>
                        <TableCell sx={{ padding: '5px', color: verwerkteBetalingen.includes(item.sortOrder) ? 'lightgrey' : 'inherit' }}
                          onClick={() => handleEditClick(item.sortOrder)}>
                          {formatAmount(berekenBedragVoorRekenining(item, actueleRekening).toString())}
                        </TableCell>
                        {/* <TableCell sx={{ padding: '5px' }}>{item.sortOrder}</TableCell> */}
                        <TableCell sx={{ padding: '5px' }}>
                          {isPeriodeOpen && !verwerkteBetalingen.includes(item.sortOrder) &&
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton onClick={() => handleEditClick(item.sortOrder)}>
                                <EditIcon />
                              </IconButton>
                              {props.isOcr &&
                                <IconButton onClick={() => onBetalingVerwijderdChange(item)} color={item.bestaatAl ? 'error' : 'default'}>
                                  <DeleteIcon />
                                </IconButton>}
                            </Box>}
                          {verwerkteBetalingen.includes(item.sortOrder) &&
                            <Box alignItems={'center'} display={'flex'} sx={{ cursor: 'pointer' }}
                              onClick={() => setSnackbarMessage({ message: toonVerwerkteBetalingMeassage, type: 'info' })}>
                              <InfoIcon height='16' />
                            </Box>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {selectedBetaling &&
            <UpsertBetalingDialoog
              onUpsertBetalingClose={onUpsertBetalingClose}
              onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO)}
              onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO)}
              isOcr={props.isOcr}
              editMode={true}
              betaling={{ ...selectedBetaling, bron: selectedBetaling.bron, bestemming: selectedBetaling.bestemming }}
            />
          }
        </>
      }
    </>
  );
}