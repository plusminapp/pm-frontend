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
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from '@mui/material';

import { zodResolver } from '@hookform/resolvers/zod';
import 'dayjs/locale/nl';
import { useForm } from 'react-hook-form';
import { usePlusminApi } from '../../api/plusminApi';
import { useCustomContext } from '../../context/CustomContext';
import { BetalingDTO } from '../../model/Betaling';
import { SaldoDTO } from '../../model/Saldo';
import {
  defaultFormSaldos,
  formSchema,
  FormValues,
  formatAmount,
} from './HevelReserveOverFormUtil';
import {
  RekeningGroepSoort,
  reserverenRekeningGroepSoorten,
} from '../../model/RekeningGroep';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface HevelReserveOverFormProps {
  geselecteerdeBestemming: string;
  onHevelReserveOverClose: () => void;
  resultaatOpDatum: SaldoDTO[];
}

export function HevelReserveOverForm({
  geselecteerdeBestemming,
  onHevelReserveOverClose,
  resultaatOpDatum: resultaatOpDatum,
}: HevelReserveOverFormProps) {
  const { actieveHulpvrager, setSnackbarMessage } = useCustomContext();
  const { postBetalingVoorHulpvrager } = usePlusminApi();
  const [open, setOpen] = useState<boolean>(true);

  const selecteerbareBonnen = resultaatOpDatum
  .filter((item) =>
    reserverenRekeningGroepSoorten.includes(
      item.rekeningGroepSoort as RekeningGroepSoort,
    )
  )
  .sort((a, b) => a.sortOrder - b.sortOrder);

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
      formReservering: {
        ...defaultFormSaldos(
          resultaatOpDatum.find(
            (item) => item.rekeningNaam === geselecteerdeBestemming,
          ) ?? resultaatOpDatum[0],
        ),
        bron: selecteerbareBonnen[0]?.rekeningNaam || '', // Selecteer standaard de eerste bron
      },
    },
  });

  const formReservering = getValues('formReservering');
  const bron = formReservering.bron.replace(/,/g, '.');
  if (getValues(`formReservering.bron`) !== bron) {
    setValue(`formReservering.bron`, bron);
  }

  const onSubmit = (data: FormValues) => {
    saveWijzigingen(data.formReservering);
    handleClose();
  };

  const saveWijzigingen = async (
    formReservering: FormValues['formReservering'],
  ) => {
    if (actieveHulpvrager) {
      console.log('Saving wijzigingen', formReservering);
      // try {
      //   await postBetalingVoorHulpvrager(
      //     actieveHulpvrager,
      //     formReservering as unknown as BetalingDTO,
      //   );
      //   setSnackbarMessage({
      //     message: `De reserve is succesvol overgeheveld.`,
      //     type: 'success',
      //   });
      // } catch (error) {
      //   console.error('Error saving wijzigingen', error);
      //   setSnackbarMessage({
      //     message: `De configuratie voor ${actieveHulpvrager!.bijnaam} is niet correct.`,
      //     type: 'warning',
      //   });
      // }
    }
  };

  const handleClose = () => {
    onHevelReserveOverClose();
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
          Hevel reserve over
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
                      Bedrag
                    </TableCell>
                    <TableCell
                      align="left"
                      size="small"
                      sx={{ fontWeight: '500' }}
                    >
                      <TextField
                        sx={{ width: '33%' }}
                        variant="standard"
                        id={`formReservering.bedrag`}
                        type="text"
                        inputRef={register(`formReservering.bedrag`).ref}
                        {...register(`formReservering.bedrag`)}
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
                        error={errors.formReservering?.bedrag ? true : false}
                        helperText={errors.formReservering?.bedrag?.message}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow sx={{ '& td, & th': { border: 0 } }}>
                    <TableCell
                      size="small"
                      sx={{ fontWeight: '500', fontSize: '0.85rem' }}
                    >
                      Bron
                    </TableCell>
                    <TableCell
                      size="small"
                      sx={{ fontWeight: '500', fontSize: '0.85rem' }}
                    >
                      <FormControl
                        variant="standard"
                        sx={{ minWidth: 200 }}
                        error={errors.formReservering?.bron ? true : false}
                      >
                        <InputLabel id="bron-select-label">
                          Selecteer bron
                        </InputLabel>
                        <Select
                          labelId="bron-select-label"
                          id="formReservering.bron"
                          sx={{ fontSize: '0.85rem' }}
                          {...register('formReservering.bron')}
                          value={watch('formReservering.bron') || ''}
                          onChange={(event) => {
                            setValue(
                              'formReservering.bron',
                              event.target.value,
                            );
                          }}
                        >
                          {selecteerbareBonnen.map((saldo) => (
                            <MenuItem
                              key={saldo.rekeningNaam}
                              value={saldo.rekeningNaam}
                              sx={{ fontSize: '0.85rem' }}
                            >
                              {saldo.rekeningNaam} (
                              {formatAmount(
                                saldo.openingsReserveSaldo +
                                  saldo.reservering -
                                  saldo.betaling,
                              )}
                              )
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.formReservering?.bron && (
                          <FormHelperText>
                            {errors.formReservering.bron.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </TableCell>
                  </TableRow>

                  <TableRow sx={{ '& td, & th': { border: 0 } }}>
                    <TableCell
                      size="small"
                      sx={{ fontWeight: '500', fontSize: '0.85rem' }}
                    >
                      Bestemming
                    </TableCell>
                    <TableCell
                      size="small"
                      sx={{ fontWeight: '500', fontSize: '0.85rem' }}
                    >
                      {formReservering.bestemming}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
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
      </form>
    </BootstrapDialog>
  );
}
