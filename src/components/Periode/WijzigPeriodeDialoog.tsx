import React, { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import { InputAdornment, Stack, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from '@mui/material';

import 'dayjs/locale/nl';
import { Periode } from '../../model/Periode';
import { useCustomContext } from '../../context/CustomContext';
import { SaldoDTO } from '../../model/Saldo';
import { useAuthContext } from '@asgardeo/auth-react';
import { currencyFormatter } from '../../model/Betaling';
import { balansRekeningGroepSoorten, RekeningGroepSoort } from '../../model/RekeningGroep';
import dayjs from 'dayjs';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type FormSaldo = {
  naam: string;
  bedrag: string;
  delta: number;
}

type WijzigPeriodeDialoogProps = {
  periodes: Periode[];
  index: number;
  editMode?: boolean;
  onWijzigPeriodeClose: () => void;
};
export default function WijzigPeriodeDialoog(props: WijzigPeriodeDialoogProps) {
  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, setSnackbarMessage } = useCustomContext();
  const [heeftAflossingen, setHeeftAflossingen] = useState<boolean>(false);

  const fetchStand = useCallback(async () => {
    if (!props.periodes || props.periodes.length < 2) {
      console.warn("No periode provided to fetchAflossingen");
      return;
    }
    let token
    try {
      token = await getIDToken();
    } catch (error) {
      console.error("Error fetching ID token", error);
    }
    if (actieveHulpvrager && props.periodes && token) {
      const response = await fetch(`/api/v1/stand/hulpvrager/${actieveHulpvrager.id}/periode/${props.periodes[props.index].id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const result = await response.json();
        setFormSaldi((result.resultaatOpDatum as SaldoDTO[])
          .filter((saldo: SaldoDTO) => balansRekeningGroepSoorten.includes(saldo.rekeningGroepSoort as RekeningGroepSoort))
          .map((saldo: SaldoDTO) => ({
            naam: saldo.rekeningNaam,
            bedrag: Number(saldo.openingsSaldo).toFixed(2),
            delta: Number(saldo.oorspronkelijkeBudgetBetaling),
          } as FormSaldo)));
          setHeeftAflossingen(result.geaggregeerdResultaatOpDatum.some((saldo: SaldoDTO) => saldo.rekeningGroepSoort === 'AFLOSSINGEN'));
      } else {
        console.error("Failed to fetch data", response.status);
        setSnackbarMessage({
          message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
          type: "warning"
        })
      }
    }
  }, [actieveHulpvrager, getIDToken, props.index, props.periodes, setSnackbarMessage]);

  useEffect(() => {
    setOpen(props.periodes !== undefined);
    fetchStand()
  }, [props.periodes, props.index, fetchStand]);


  const saveWijzigingen = async () => {
    let token
    try {
      token = await getIDToken();
    } catch (error) {
      console.error("Error fetching ID token", error);
    }
    if (actieveHulpvrager && props.periodes && token) {
      const body = formSaldi.map(saldo => ({
        rekeningNaam: saldo.naam,
        openingsSaldo: saldo.bedrag,
      } as unknown as SaldoDTO))
      console.log("Saving wijzigingen", formSaldi, body);
      const response = await fetch(`/api/v1/periode/hulpvrager/${actieveHulpvrager.id}/wijzig-periode-opening/${props.periodes[props.index].id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setSnackbarMessage({
          message: `De periodeopening is succesvol aangepast.`,
          type: "success"
        })
      } else { 
      console.error("Failed to fetch data", response.status);
      setSnackbarMessage({
        message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
        type: "warning"
      })
    }
  }
};

const [open, setOpen] = useState<boolean>(false);
const handleClose = () => {
  props.onWijzigPeriodeClose();
  setOpen(false);

};

const handleKeyPress = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === "NumpadEnter") {
    // handleSubmit(event as unknown as React.FormEvent);
    console.log("Enter pressed");
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  saveWijzigingen();
  handleClose();
  setSnackbarMessage({
    message: `De beginstand van de periode is aangepast.`,
    type: "success"
  });
}

const [formSaldi, setFormSaldi] = useState<FormSaldo[]>([]);
const handleInputChange = (saldo: FormSaldo, event: string) => {
  const raw = event.replace(/[^0-9,\-.]/g, '').replace(',', '.');
  const newValue = parseFloat(raw) || 0;
  const delta = saldo.delta + newValue - parseFloat(saldo.bedrag);
  const newSaldi = formSaldi.map(s =>
    s.naam === saldo.naam ? { ...s, bedrag: raw, delta: delta } : s
  );
  setFormSaldi(newSaldi);
  console.log(`New value for ${saldo.naam}:`, JSON.stringify(newSaldi));
}

const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
  event.target.select();
};

return (
  <React.Fragment>
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {props.editMode ? 'Wijzig p' : 'P'}
        eriodeopening op {dayjs(props.periodes[props.index].periodeStartDatum).format('D MMMM')}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => handleClose()}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}>
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {!props.editMode &&
        <Typography variant="body2" sx={{ mb: 2 }}>
          Dit zijn de openingssaldi van de betaalmiddelen{ heeftAflossingen && ' en aflossingen' }.
        </Typography>}
        {props.editMode &&
        <Typography variant="body2" sx={{ mb: 2 }}>
          Pas hier de beginstand van de <strong>eerste open periode</strong> aan. Zo kun je ervoor zorgen dat
          de actuele stand van de betaalmiddelen klopt, ook als er uitgaven of inkomsten zijn geweest die niet
          zijn geregistreerd. Het heeft gevolgen voor <strong>alle volgende open periodes</strong>.
        </Typography>}
        <Stack spacing={2} onKeyDown={handleKeyPress}>
          < TableContainer sx={{ mr: 'auto', my: '10px' }}>
            <Table sx={{ width: "100%" }} aria-label="simple table">
              <TableBody>
                <TableRow sx={{ '& td, & th': { border: 0 } }}>
                  <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                    Rekening
                  </TableCell>
                  <TableCell align="right" size='small' sx={{ fontWeight: '500' }} >
                    {dayjs(props.periodes[props.index].periodeStartDatum).format("D MMMM")}
                  </TableCell>
                  {props.editMode &&
                    <TableCell align="right" size='small' sx={{ fontWeight: '500' }} >
                      Verschil
                    </TableCell>}
                </TableRow>
                {formSaldi.map((saldo) => (
                  <TableRow key={saldo.naam} sx={{ '& td, & th': { border: 0 } }}>
                    <TableCell align="left" size='small' sx={{ fontWeight: '500' }}>
                      {saldo.naam}
                    </TableCell>
                    {!props.editMode &&
                      <TableCell align="right" size='small' sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
                        {currencyFormatter.format(Number(saldo.bedrag))}
                      </TableCell>}
                    {props.editMode &&
                      <TableCell align="right" size='small' sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
                        <TextField
                          // sx={{ width: '33%' }}
                          variant='standard'
                          id="betaling-bedrag"
                          value={(saldo.bedrag)}
                          type="text"
                          onChange={(e) => handleInputChange(saldo, e.target.value)}
                          onFocus={handleFocus}
                          inputProps={{ style: { textAlign: 'right' } }}
                          slotProps={{
                            input: {
                              style: { textAlign: 'right', fontSize: '0.9rem' },
                              startAdornment: <InputAdornment position="start">€</InputAdornment>,
                            },
                          }}
                        />
                      </TableCell>}
                    {props.editMode &&
                      <TableCell sx={{}} align="right" size='small'>
                        <Typography sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
                          {currencyFormatter.format(saldo.delta)}
                        </Typography>
                      </TableCell>}
                  </TableRow>
                ))}
                <TableRow sx={{ '& td, & th': { border: 0 } }}>
                  <TableCell size='small' sx={{ fontWeight: '500', fontSize: '0.85rem' }}>
                    Totaal
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    {currencyFormatter.format(formSaldi.reduce((acc, saldo) => acc + parseFloat(saldo.bedrag || '0'), 0))}
                  </TableCell>
                  {props.editMode && <
                    TableCell sx={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    {currencyFormatter.format(formSaldi.reduce((acc, saldo) => acc + saldo.delta, 0))}
                  </TableCell>}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer >
        </Stack>
      </DialogContent>
      {props.editMode &&
        <DialogActions >
          <Button
            autoFocus sx={{ color: 'success.main' }}
            startIcon={<SaveOutlinedIcon sx={{ fontSize: '35px', color: 'success.main' }} />}
            onClick={handleSubmit}>
            BEWAAR
          </Button>
          {/* {JSON.stringify(formSaldi)} */}
        </DialogActions>}
    </BootstrapDialog>
  </React.Fragment>
);
}