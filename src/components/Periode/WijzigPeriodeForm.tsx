import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

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

import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { useForm } from 'react-hook-form';
import { usePlusminApi } from '../../api/plusminApi';
import { useCustomContext } from '../../context/CustomContext';
import { currencyFormatter } from '../../model/Betaling';
import { Periode } from '../../model/Periode';
import { SaldoDTO } from '../../model/Saldo';
import {
  defaultFormSaldos,
  defaultHeeftAflossingen,
  formSchema,
  FormValues,
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
  periode: Periode;
  editMode?: boolean;
  onWijzigPeriodeClose: () => void;
  openingsBalansSaldi: SaldoDTO[];
}

export function WijzigPeriodeForm({
  periode,
  editMode,
  onWijzigPeriodeClose,
  openingsBalansSaldi,
}: WijzigPeriodeFormProps) {
  const { actieveAdministratie, setSnackbarMessage, setIsStandDirty } = useCustomContext();
  const { putPeriodeOpeningWijziging } = usePlusminApi();
  const [open, setOpen] = useState<boolean>(true);
  const heeftAflossingen = defaultHeeftAflossingen(openingsBalansSaldi);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formSaldi: defaultFormSaldos(openingsBalansSaldi),
    },
  });

  const formSaldi = getValues('formSaldi');
  watch('formSaldi').forEach((saldo, index) => {
    const nieuw = saldo.nieuw.replace(/,/g, '.');
    if (getValues(`formSaldi.${index}.nieuw`) !== nieuw) {
      setValue(`formSaldi.${index}.nieuw`, nieuw);
    }
    const oldDelta = defaultFormSaldos(openingsBalansSaldi)[index].delta;
    const newDelta = oldDelta + parseFloat(nieuw) - saldo.huidig;
    if (getValues(`formSaldi.${index}.delta`) !== newDelta && !isNaN(newDelta)) {
      setValue(`formSaldi.${index}.delta`, newDelta);
    }
  });

  const onSubmit = (data: FormValues) => {
    saveWijzigingen(data.formSaldi);
    handleClose();
    setSnackbarMessage({
      message: `De beginstand van de periode is aangepast.`,
      type: 'success',
    });
  };

  const saveWijzigingen = async (formSaldi: FormValues['formSaldi']) => {
    if (actieveAdministratie) {
      const saldos = formSaldi.map((formSaldo) => ({
        rekeningNaam: formSaldo.naam,
        openingsBalansSaldo: Number(formSaldo.nieuw),
      }));
      console.log('Saving wijzigingen', formSaldi, saldos);
      try {
        await putPeriodeOpeningWijziging(
          actieveAdministratie,
          periode,
          saldos as unknown as SaldoDTO[],
        );
        setSnackbarMessage({
          message: `De periodeopening is succesvol aangepast.`,
          type: 'success',
        })
        setIsStandDirty(true);
      } catch (error) {
        console.error('Error saving wijzigingen', error);
        setSnackbarMessage({
          message: `De configuratie voor ${actieveAdministratie!.bijnaam} is niet correct.`,
          type: 'warning',
        });
      }
    }
  };

  const handleClose = () => {
    onWijzigPeriodeClose();
    setOpen(false);
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {editMode ? 'Wijzig p' : 'P'}
          eriodeopening op {dayjs(periode.periodeStartDatum).format('D MMMM')}
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
              Dit zijn de openingsbalanssaldi van de betaalmiddelen
              {heeftAflossingen && ' en aflossingen'}.
            </Typography>
          )}
          {editMode && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Pas hier de beginstand van de <strong>eerste open periode</strong>{' '}
              aan. Zo kun je ervoor zorgen dat de actuele stand van de
              betaalmiddelen klopt, ook als er uitgaven of inkomsten zijn
              geweest die niet zijn geregistreerd. Het heeft gevolgen voor{' '}
              <strong>alle volgende open periodes</strong>.
            </Typography>
          )}
          <Stack spacing={2}>
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
                      {dayjs(periode.periodeStartDatum).format('D MMMM')}
                    </TableCell>
                    {/* {editMode && ( */}
                      <TableCell
                        align="right"
                        size="small"
                        sx={{ fontWeight: '500' }}
                      >
                        Correctie
                      </TableCell>
                    {/* )} */}
                  </TableRow>
                  {formSaldi.map((saldo, index) => (
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

                      <TableCell
                        align="right"
                        size="small"
                        sx={{ textAlign: 'right', fontSize: '0.85rem' }}
                      >
                        {editMode ? (
                          <TextField
                            sx={{ width: '33%' }}
                            variant="standard"
                            id={`formSaldi.${index}.nieuw`}
                            type="text"
                            inputRef={register(`formSaldi.${index}.nieuw`).ref}
                            {...register(`formSaldi.${index}.nieuw`)}
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
                            error={
                              errors.formSaldi?.[index]?.nieuw ? true : false
                            }
                            helperText={
                              errors.formSaldi?.[index]?.nieuw?.message
                            }
                          />
                        ) : (
                          currencyFormatter.format(Number(saldo.nieuw))
                        )}
                      </TableCell>

                      {/* {editMode && ( */}
                        <TableCell sx={{}} align="right" size="small">
                          <Typography
                            sx={{ textAlign: 'right', fontSize: '0.85rem' }}
                          >
                            {currencyFormatter.format(saldo.delta)}
                          </Typography>
                        </TableCell>
                      {/* )} */}
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
                          (acc, saldo) => acc + Number(saldo.nieuw) || 0,
                          0,
                        ),
                      )}
                    </TableCell>
                    {editMode && (
                      <TableCell
                        sx={{ textAlign: 'right', fontSize: '0.85rem' }}
                      >
                        {currencyFormatter.format(
                          formSaldi.reduce(
                            (acc, saldo) => acc + saldo.delta,
                            0,
                          ),
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
              type="submit"
            >
              BEWAAR
            </Button>
          </DialogActions>
        )}
      </form>
    </BootstrapDialog>
  );
}
