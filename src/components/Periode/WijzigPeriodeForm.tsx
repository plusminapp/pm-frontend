import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

import {
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { usePlusminApi } from '../../api/plusminApi';
import { useCustomContext } from '../../context/CustomContext';
import { currencyFormatter } from '../../model/Betaling';
import { Periode } from '../../model/Periode';
import { SaldoDTO, Stand } from '../../model/Saldo';
import {
  defaultFormSaldos,
  defaultHeeftAflossingen,
  FormSaldo,
} from './WijzigPeriodeFormUtil';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface WijzigPeriodeFormProps {
  periodes: Periode[];
  index: number;
  editMode?: boolean;
  onWijzigPeriodeClose: () => void;
  stand: Stand;
}

export function WijzigPeriodeForm({
  periodes,
  index,
  editMode,
  stand,
  onWijzigPeriodeClose,
}: WijzigPeriodeFormProps) {
  const { actieveHulpvrager, setSnackbarMessage } = useCustomContext();
  const { putPeriodeOpeningWijziging } = usePlusminApi();
  const [formSaldi, setFormSaldi] = useState<FormSaldo[]>(
    defaultFormSaldos(stand),
  );
  const [open, setOpen] = useState<boolean>(true);
  const heeftAflossingen = defaultHeeftAflossingen(stand);

  const saveWijzigingen = async () => {
    if (actieveHulpvrager) {
      const saldos = formSaldi.map((formSaldo) => ({
        rekeningNaam: formSaldo.naam,
        openingsBalansSaldo: formSaldo.bedrag,
      }));
      console.log('Saving wijzigingen', formSaldi, saldos);
      try {
        await putPeriodeOpeningWijziging(
          actieveHulpvrager,
          periodes[index],
          saldos as unknown as SaldoDTO[],
        );
        setSnackbarMessage({
          message: `De periodeopening is succesvol aangepast.`,
          type: 'success',
        });
      } catch (error) {
        console.error('Error saving wijzigingen', error);
        setSnackbarMessage({
          message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
          type: 'warning',
        });
      }
    }
  };

  const handleClose = () => {
    onWijzigPeriodeClose();
    setOpen(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'NumpadEnter') {
      // handleSubmit(event as unknown as React.FormEvent);
      console.log('Enter pressed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveWijzigingen();
    handleClose();
    setSnackbarMessage({
      message: `De beginstand van de periode is aangepast.`,
      type: 'success',
    });
  };

  const handleInputChange = (saldo: FormSaldo, event: string) => {
    const raw = event.replace(/[^0-9,\-.]/g, '').replace(',', '.');
    const newValue = parseFloat(raw) || 0;
    const delta = saldo.delta + newValue - parseFloat(saldo.bedrag);
    const newSaldi = formSaldi.map((s) =>
      s.naam === saldo.naam ? { ...s, bedrag: raw, delta: delta } : s,
    );
    setFormSaldi(newSaldi);
    console.log(`New value for ${saldo.naam}:`, JSON.stringify(newSaldi));
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {editMode ? 'Wijzig p' : 'P'}
        eriodeopening op{' '}
        {dayjs(periodes[index].periodeStartDatum).format('D MMMM')}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => handleClose()}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {!editMode && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Dit zijn de openingssaldi van de betaalmiddelen
            {heeftAflossingen && ' en aflossingen'}.
          </Typography>
        )}
        {editMode && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Pas hier de beginstand van de <strong>eerste open periode</strong>{' '}
            aan. Zo kun je ervoor zorgen dat de actuele stand van de
            betaalmiddelen klopt, ook als er uitgaven of inkomsten zijn geweest
            die niet zijn geregistreerd. Het heeft gevolgen voor{' '}
            <strong>alle volgende open periodes</strong>.
          </Typography>
        )}
        <Stack spacing={2} onKeyDown={handleKeyPress}>
          <TableContainer sx={{ mr: 'auto', my: '10px' }}>
            <Table sx={{ width: '100%' }} aria-label="simple table">
              <TableBody>
                <TableRow sx={{ '& td, & th': { border: 0 } }}>
                  <TableCell
                    align="left"
                    size="small"
                    sx={{ fontWeight: '500' }}
                  >
                    Rekening
                  </TableCell>
                  <TableCell
                    align="right"
                    size="small"
                    sx={{ fontWeight: '500' }}
                  >
                    {dayjs(periodes[index].periodeStartDatum).format('D MMMM')}
                  </TableCell>
                  {editMode && (
                    <TableCell
                      align="right"
                      size="small"
                      sx={{ fontWeight: '500' }}
                    >
                      Verschil
                    </TableCell>
                  )}
                </TableRow>
                {formSaldi.map((saldo) => (
                  <TableRow
                    key={saldo.naam}
                    sx={{ '& td, & th': { border: 0 } }}
                  >
                    <TableCell
                      align="left"
                      size="small"
                      sx={{ fontWeight: '500' }}
                    >
                      {saldo.naam}
                    </TableCell>
                    {!editMode && (
                      <TableCell
                        align="right"
                        size="small"
                        sx={{ textAlign: 'right', fontSize: '0.85rem' }}
                      >
                        {currencyFormatter.format(Number(saldo.bedrag))}
                      </TableCell>
                    )}
                    {editMode && (
                      <TableCell
                        align="right"
                        size="small"
                        sx={{ textAlign: 'right', fontSize: '0.85rem' }}
                      >
                        <TextField
                          // sx={{ width: '33%' }}
                          variant="standard"
                          id="betaling-bedrag"
                          value={saldo.bedrag}
                          type="text"
                          onChange={(e) =>
                            handleInputChange(saldo, e.target.value)
                          }
                          onFocus={handleFocus}
                          inputProps={{ style: { textAlign: 'right' } }}
                          slotProps={{
                            input: {
                              style: {
                                textAlign: 'right',
                                fontSize: '0.9rem',
                              },
                              startAdornment: (
                                <InputAdornment position="start">
                                  €
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </TableCell>
                    )}
                    {editMode && (
                      <TableCell sx={{}} align="right" size="small">
                        <Typography
                          sx={{ textAlign: 'right', fontSize: '0.85rem' }}
                        >
                          {currencyFormatter.format(saldo.delta)}
                        </Typography>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                <TableRow sx={{ '& td, & th': { border: 0 } }}>
                  <TableCell
                    size="small"
                    sx={{ fontWeight: '500', fontSize: '0.85rem' }}
                  >
                    Totaal
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    {currencyFormatter.format(
                      formSaldi.reduce(
                        (acc, saldo) => acc + parseFloat(saldo.bedrag || '0'),
                        0,
                      ),
                    )}
                  </TableCell>
                  {editMode && (
                    <TableCell sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
                      {currencyFormatter.format(
                        formSaldi.reduce((acc, saldo) => acc + saldo.delta, 0),
                      )}
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DialogContent>
      {editMode && (
        <DialogActions>
          <Button
            autoFocus
            sx={{ color: 'success.main' }}
            startIcon={
              <SaveOutlinedIcon
                sx={{ fontSize: '35px', color: 'success.main' }}
              />
            }
            onClick={handleSubmit}
          >
            BEWAAR
          </Button>
          {/* {JSON.stringify(formSaldi)} */}
        </DialogActions>
      )}
    </BootstrapDialog>
  );
}
