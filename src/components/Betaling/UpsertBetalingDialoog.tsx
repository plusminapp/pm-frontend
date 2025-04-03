import React, { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Fab, FormControl, FormControlLabel, Input, InputAdornment, InputLabel, Stack, Switch, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BetalingDTO, BetalingsSoort, uitgavenBetalingsSoorten } from '../../model/Betaling';

import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useCustomContext } from '../../context/CustomContext';
import { useAuthContext } from '@asgardeo/auth-react';
import BetalingsSoortSelect from '../Betaling/BetalingsSoortSelect';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type UpsertBetalingDialoogProps = {
  onBetalingBewaardChange: (betaling: BetalingDTO) => void;
  onBetalingVerwijderdChange: (betaling: BetalingDTO) => void;
  onUpsertBetalingClose: () => void;
  isOcr?: boolean;
  editMode: boolean;
  betaling?: BetalingDTO;
};

export default function UpsertBetalingDialoog(props: UpsertBetalingDialoogProps) {
  const { actieveHulpvrager, gebruiker, betalingsSoorten2Rekeningen, periodes, gekozenPeriode, setSnackbarMessage } = useCustomContext();

  const boekingsDatum = gekozenPeriode?.periodeEindDatum && dayjs().toISOString().slice(0, 10) > gekozenPeriode?.periodeEindDatum ? dayjs(gekozenPeriode?.periodeEindDatum) : dayjs()

  const initialBetalingDTO = useMemo(() => ({
    id: 0,
    boekingsdatum: boekingsDatum,
    bedrag: 0,
    omschrijving: '',
    ocrOmschrijving: '',
    betalingsSoort: undefined,
    sortOrder: '',
    bestaatAl: false,
    bron: undefined,
    bestemming: undefined,
    budgetNaam: undefined
  }), []);

  type BetalingDtoErrors = { betalingsSoort?: String, omschrijving?: string; bedrag?: string; boekingsdatum?: string }
  type BetalingDtoWarnings = { boekingsdatum?: string }

  const initialBetalingDtoErrors = { betalingsSoort: undefined, omschrijving: undefined, bedrag: undefined, boekingsdatum: undefined }
  const initialBetalingDtoWarnings = { boekingsdatum: undefined }

  const [open, setOpen] = useState(props.editMode);
  const [betalingDTO, setBetalingDTO] = useState<BetalingDTO>(props.betaling ? { ...props.betaling, boekingsdatum: dayjs(props.betaling.boekingsdatum) } : initialBetalingDTO);
  const [errors, setErrors] = useState<BetalingDtoErrors>(initialBetalingDtoErrors);
  const [warnings, setWarnings] = useState<BetalingDtoWarnings>(initialBetalingDtoWarnings);
  const [isOntvangst, setIsOntvangst] = useState(false);
  const { getIDToken } = useAuthContext();

  const rekeningPaar = betalingsSoorten2Rekeningen.get(BetalingsSoort.uitgaven)
  useEffect(() => {
    if (!props.editMode) {
      setBetalingDTO({
        ...initialBetalingDTO,
        boekingsdatum: gekozenPeriode?.periodeEindDatum && dayjs().toISOString().slice(0, 10) > gekozenPeriode?.periodeEindDatum ? dayjs(gekozenPeriode?.periodeEindDatum) : dayjs(),
      });
    }
  }, [rekeningPaar, initialBetalingDTO, props.editMode, props.betaling, gekozenPeriode]);

  useEffect(() => {
    if (props.editMode && !!props.betaling?.bedrag && props.betaling.bedrag < 0) {
      setIsOntvangst(true)
      setBetalingDTO({ ...betalingDTO, bedrag: -props.betaling.bedrag })
    }
  });

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setBetalingDTO(initialBetalingDTO);
    setErrors(initialBetalingDtoErrors);
    setWarnings(initialBetalingDtoWarnings);
    if (props.editMode) {
      props.onUpsertBetalingClose();
    } else {
      setOpen(false);
    }
  };

  const eersteOpenPeriode = periodes
    .filter(p => p.periodeStatus.toLowerCase() === 'open' || p.periodeStatus.toLowerCase() === 'huidig')
    .sort((a, b) => a.periodeStartDatum.localeCompare(b.periodeStartDatum))[0];
  const laatstePeriode = periodes
    .sort((a, b) => a.periodeStartDatum.localeCompare(b.periodeStartDatum))[periodes.length - 1];

  const validateKeyValue = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]): string | undefined => {
    if (key === 'betalingsSoort' && !value) {
      return 'Kies een betalingscategorie.';
    }
    if (props.isOcr && key === 'ocrOmschrijving' && (value as string).trim() === '') {
      return 'Omschrijving mag niet leeg zijn.';
    }
    if (key === 'bedrag' && (isNaN(value as number) || value as number == 0)) {
      return 'Bedrag moet een positief getal zijn.';
    }
    if (key === 'boekingsdatum') {
      const startDatum = eersteOpenPeriode?.periodeStartDatum;
      const eindDatum = laatstePeriode.periodeEindDatum;
      if (dayjs(value as dayjs.Dayjs).isBefore(startDatum) || dayjs(value as dayjs.Dayjs).isAfter(eindDatum)) {
        return `De boekingsdatum moet in een open periode, tussen ${startDatum} en ${eindDatum}, liggen.`;
      }
    }
    return undefined;
  };

  const validateKeyValueWarning = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]): string | undefined => {
    if (key === 'boekingsdatum' && (dayjs(value as dayjs.Dayjs).isBefore(gekozenPeriode?.periodeStartDatum) || dayjs(value as dayjs.Dayjs).isAfter(gekozenPeriode?.periodeEindDatum))) {
      return `De boekingsdatum valt buiten de gekozen periode (van ${gekozenPeriode?.periodeStartDatum} t/m ${gekozenPeriode?.periodeEindDatum}) en wordt dus niet meteen getoond.`;
    }
    return undefined;
  };

  const normalizeDecimal = (value: string): string => {
    return value.replace(/[^0-9,\-\.]/g, '').replace(',', '.');
  };

  const handleInputChange = <K extends keyof BetalingDTO>(key: K, value: BetalingDTO[K]) => {
    let newBetalingsDTO = betalingDTO;
    if (key === 'omschrijving') {
      if (props.isOcr) {
        newBetalingsDTO = {
          ...newBetalingsDTO,
          'ocrOmschrijving': value as string,
          // 'omschrijving': value as string
        }
      } else {
        newBetalingsDTO = {
          ...newBetalingsDTO,
          'omschrijving': value as string
        }
      }
      setBetalingDTO({ ...newBetalingsDTO, [key]: value });
    } else if (key === 'bedrag') {
      newBetalingsDTO = {
        ...newBetalingsDTO,
        'bedrag': normalizeDecimal(value as unknown as string) as unknown as number
      }
    } else {
      newBetalingsDTO = { ...newBetalingsDTO, [key]: value };
    }
    setBetalingDTO(newBetalingsDTO);

    const error = validateKeyValue(key, value);
    const warning = validateKeyValueWarning(key, value);
    setErrors({ ...errors, [key]: error });
    setWarnings({ ...warnings, [key]: warning });
  };
  const validateBetalingDTO = () => {
    const newErrors: BetalingDtoErrors = initialBetalingDtoErrors;
    (Object.keys(initialBetalingDtoErrors) as (keyof BetalingDtoErrors)[]).forEach((key) => {
      const error = validateKeyValue(key, betalingDTO[key]);
      if (error) {
        newErrors[key as keyof BetalingDtoErrors] = error;
      }
    });
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMessages = Object.values(validateBetalingDTO()).filter(error => error !== undefined).join(' ');
    if (errorMessages.length == 0) {
      try {
        const token = await getIDToken();
        const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
        const url = betalingDTO.id ? `/api/v1/betalingen/${betalingDTO.id}` : `/api/v1/betalingen/hulpvrager/${id}`
        const body = {
          ...betalingDTO,
          omschrijving: (props.isOcr ? betalingDTO.ocrOmschrijving : betalingDTO.omschrijving)?.trim(),
          boekingsdatum: betalingDTO.boekingsdatum.format('YYYY-MM-DD'),
          bedrag: isOntvangst && betalingDTO.betalingsSoort && uitgavenBetalingsSoorten.includes(betalingDTO.betalingsSoort) ? -betalingDTO.bedrag : betalingDTO.bedrag,
        }
        const response = await fetch(url, {
          method: betalingDTO.id ? "PUT" : "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
        if (!response.ok) {
          setSnackbarMessage({
            message: `Betaling is niet opgeslagen: HTTP fout met status: ${response.status}`,
            type: "error"
          })
          throw new Error(`HTTP fout met status: ${response.status}`);
        }
        setSnackbarMessage({
          message: "Betaling is opgeslagen.",
          type: "success"
        })
        const responseJson = await response.json()
        props.isOcr ? props.onBetalingBewaardChange(betalingDTO) : props.onBetalingBewaardChange(responseJson) // sortOrder kan gewijzigd zijn ...
        if (props.editMode) {
          handleClose()
        } else {
          setBetalingDTO(initialBetalingDTO)
          setErrors(initialBetalingDtoErrors)
          setWarnings(initialBetalingDtoWarnings)
        }
      } catch (error) {
        console.error('Fout bij opslaan betaling:', error);
      }
    } else {
      setSnackbarMessage({
        message: `Betaling is niet geldig, herstel de fouten en probeer het opnieuw. ${errorMessages}`,
        type: "error"
      })
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getIDToken();
      const url = `/api/v1/betalingen/${betalingDTO.id}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP fout met status: ${response.status}`);
      }
      props.onBetalingVerwijderdChange(betalingDTO)
      setSnackbarMessage({
        message: 'Betaling is verwijderd.',
        type: "success"
      })
      setBetalingDTO(initialBetalingDTO)
      handleClose()

    } catch (error) {
      setSnackbarMessage({
        message: `Betaling is NIET verwijderd. Fout: ${(error as Error).message}`,
        type: "error"
      })
      console.error('Fout bij verwijderen betaling:', error);
    }
  }
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === "NumpadEnter") {
      handleSubmit(event as unknown as React.FormEvent);
    }
  };

  const handleIsOntvangstChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOntvangst(event.target.checked);
  };

  return (
    <React.Fragment>
      {!props.editMode &&
        <Fab
          color="success"
          aria-label="Nieuwe betaling"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleClickOpen}
        >
          <AddIcon />
        </Fab>
        // <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ mt: '10px', ml: '10px' }}>
        //   Nieuwe betaling
        // </Button>
      }
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {props.editMode ? "Bewerk betaling" : "Nieuwe betaling"}
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
          <Stack spacing={2} onKeyDown={handleKeyPress}>
            <BetalingsSoortSelect
              betalingsSoort={betalingDTO.betalingsSoort}
              bron={betalingDTO.bron}
              bestemming={betalingDTO.bestemming}
              budget={betalingDTO.budgetNaam}
              onBetalingsSoortChange={(betalingsSoort, bron, bestemming, budgetNaam) => {
                handleInputChange('betalingsSoort', betalingsSoort)
                setBetalingDTO({ ...betalingDTO, betalingsSoort, bron, bestemming, budgetNaam })
              }}
            />
            {errors.betalingsSoort && (
              <Typography style={{ marginTop: '0px', color: 'red', fontSize: '0.75rem', textAlign: 'center' }}>{errors.betalingsSoort}</Typography>
            )}
            <Grid container columns={12} spacing={2} direction={{ xs: 'column', sm: 'row' }} display="flex" alignItems="baseline">
              <Grid size={{ xs: 12, sm: 5 }} marginTop={{ xs: 0, sm: 1 }}>
                <FormControl>
                  <InputLabel htmlFor="betaling-bedrag">Bedrag</InputLabel>
                  <Input
                    id="betaling-bedrag"
                    error={!!errors.bedrag}
                    startAdornment={<InputAdornment position="start">€</InputAdornment>}
                    value={betalingDTO.bedrag}
                    type="text"
                    onChange={(e) => handleInputChange('bedrag', e.target.value as unknown as BetalingDTO['bedrag'])}
                    onFocus={handleFocus}
                  />
                  {errors.bedrag && (
                    <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.bedrag}</Typography>
                  )}
                </FormControl>
              </Grid>
              {betalingDTO.betalingsSoort === BetalingsSoort.uitgaven &&
                <Grid size={{ xs: 12, sm: 7 }} marginBottom={{ xs: 0, sm: 1 }} display="flex" alignItems="center">
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          color='success'
                          sx={{ transform: 'scale(0.6)' }}
                          checked={isOntvangst}
                          onChange={handleIsOntvangstChange}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />}
                      label={<Typography variant='caption' fontWeight={isOntvangst ? '800' : '500'} color={isOntvangst ? 'success' : 'lightgrey'}>
                        Ik heb dit teruggekregen ipv betaald.
                      </Typography>}
                    />
                  </FormControl>
                </Grid>}
            </Grid>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="betaling-omschrijving">Geef een korte omschrijving *</InputLabel>
              <Input
                id="betaling-omschrijving"
                error={!!errors.omschrijving}
                value={props.isOcr ? betalingDTO.ocrOmschrijving : betalingDTO.omschrijving}
                type="text"
                onChange={(e) => handleInputChange('omschrijving', e.target.value)}
              />
              {errors.omschrijving && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.omschrijving}</Typography>
              )}
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                sx={{ color: 'success.main' }}
                minDate={dayjs(eersteOpenPeriode.periodeStartDatum)}
                maxDate={dayjs(laatstePeriode.periodeEindDatum)}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wanneer was de betaling?"
                value={betalingDTO.boekingsdatum}
                onChange={(newvalue) => handleInputChange('boekingsdatum', newvalue ? newvalue : dayjs())}
              />
              {errors.boekingsdatum && (
                <Typography style={{ marginTop: '0px', color: 'red', fontSize: '0.75rem' }}>{errors.boekingsdatum}</Typography>
              )}
              {!errors.boekingsdatum && warnings.boekingsdatum && (
                <Typography style={{ marginTop: '0px', color: '#FF8C00', fontSize: '0.75rem' }}>{warnings.boekingsdatum}</Typography>
              )}
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          {props.editMode ?
            <Button autoFocus onClick={handleDelete} startIcon={<DeleteIcon sx={{ fontSize: '35px', color: 'grey' }} />} ></Button> : <Box />}
          <Button autoFocus onClick={handleSubmit} sx={{ color: 'success.main' }} startIcon={<SaveOutlinedIcon sx={{ fontSize: '35px', color: 'success.main' }} />} >BEWAAR</Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}