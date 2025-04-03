import React, { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FormControl, Input, InputAdornment, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { AflossingDTO } from '../../model/Aflossing';

import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { useCustomContext } from '../../context/CustomContext';
import { useAuthContext } from '@asgardeo/auth-react';
import { Rekening, RekeningSoort } from '../../model/Rekening';
import { transformRekeningenToBetalingsSoorten } from '../Header';
import { useNavigate } from 'react-router-dom';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type NieuweAflossingDialoogProps = {
  onAflossingBewaardChange: () => void;
};

export default function NieuweAflossingDialoog(props: NieuweAflossingDialoogProps) {

  const initialRekening = useMemo(() => ({
    id: 0,
    naam: "",
    rekeningSoort: RekeningSoort.aflossing,
    nummer: "",
    bankNaam: undefined,
    sortOrder: 0,
    budgetType: undefined,
    budgetten: [],
  }), []);

  const initialAflossing = useMemo(() => ({
    id: 0,
    rekening: initialRekening,
    startDatum: dayjs(),
    eindDatum: undefined,
    eindBedrag: 0,
    aflossingsBedrag: 0,
    betaalDag: 1,
    dossierNummer: "",
    notities: "",
    aflossingSaldoDTO: undefined,
  }), [initialRekening]);

  const [open, setOpen] = useState(false);
  const [rekening, setRekening] = useState<Rekening>(initialRekening);
  const [aflossing, setAflossing] = useState<AflossingDTO>(initialAflossing);
  // const [errors, setErrors] = useState<{ omschrijving?: string; bedrag?: string }>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, setActieveHulpvrager, gebruiker, rekeningen, setRekeningen, setBetalingsSoorten2Rekeningen, setSnackbarMessage } = useCustomContext();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    props.onAflossingBewaardChange()
    setOpen(false);
  };

  useEffect(() => {
    const eindDatum = berekenEindDatum(aflossing.startDatum, aflossing.eindBedrag, aflossing.aflossingsBedrag, aflossing.betaalDag)
    setAflossing({ ...aflossing, eindDatum: eindDatum } as AflossingDTO)
  }, [aflossing.startDatum, aflossing.eindBedrag, aflossing.aflossingsBedrag, aflossing.betaalDag])

  const berekenEindDatum = (startDatum: dayjs.Dayjs | undefined, eindBedrag: number | undefined, aflossingsBedrag: number | undefined, betaalDag: number) => {
    if (!startDatum || !eindBedrag || !aflossingsBedrag) return undefined
    const eindDatum = startDatum.add(Math.ceil(eindBedrag / aflossingsBedrag), 'month').date(betaalDag);
    return dayjs().date() <= betaalDag ? eindDatum.subtract(1, 'month') : eindDatum
  }

  const handleInputAflossingWijziging = <K extends keyof AflossingDTO>(key: K, value: AflossingDTO[K]) => {
    setAflossing({ ...aflossing, [key]: value })
    // const newErrors: { omschrijving?: string; bedrag?: string } = { omschrijving: undefined, bedrag: undefined };
    setIsValid(true)
    // if (key === 'naam' && (value as string).trim() === '') {
    //   newErrors.omschrijving = 'naam mag niet leeg zijn.';
    //   setIsValid(false)
    // }
    // if (key === 'bedrag' && (isNaN(value as number) || value as number <= 0)) {
    //   newErrors.bedrag = 'Bedrag moet een positief getal zijn.';
    //   setIsValid(false)
    // }
    // setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
  };
  const handleInputRekeningWijziging = <K extends keyof Rekening>(key: K, value: Rekening[K]) => {
    setRekening({ ...rekening, [key]: value })
  };
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      try {
        let token
        try {
          token = await getIDToken();
        } catch (error) {
          navigate('/login');
        }
        const id = actieveHulpvrager ? actieveHulpvrager.id : gebruiker?.id
        const response = await fetch(`/api/v1/aflossing/hulpvrager/${id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              ...aflossing,
              rekening: rekening,
              startDatum: aflossing.startDatum.format('YYYY-MM-DD'),
              eindDatum: aflossing.eindDatum!.format('YYYY-MM-DD'),
            }]),
        })
        if (response.ok) {
          setRekening({ ...rekening })
          setRekeningen([...rekeningen, rekening])
          setBetalingsSoorten2Rekeningen(transformRekeningenToBetalingsSoorten([...rekeningen, rekening]))
          setAflossing({...aflossing, rekening: rekening,})
          if (actieveHulpvrager && actieveHulpvrager.id !== undefined) {
            setActieveHulpvrager({...actieveHulpvrager, aflossingen: [...actieveHulpvrager.aflossingen, {...aflossing, aflossingNaam: rekening.naam}]})
          }

          setIsValid(false)
          setRekening(initialRekening)
          setAflossing(initialAflossing)
          setSnackbarMessage({
            message: "Aflossing is opgeslagen.",
            type: "success"
          })
        } else {
          console.error("Failed to fetch data", response.status);
        }
      } catch (error) {
        console.error('Fout bij opslaan aflossing:', error);
      }
    } else {
      setSnackbarMessage({
        message: "Aflossing is niet geldig, herstel de fouten en probeer het opnieuw.",
        type: "warning"
      })
    }
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };


  return (
    <React.Fragment>
      <Button variant="contained" color="success" onClick={handleClickOpen} sx={{ ml: { md: 'auto', xs: 0 }, mr: { md: 0, xs: 'auto' } }}>
        Nieuwe aflossing
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="aflossing-titel"
        open={open}
        fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }} id="aflossing-titel">
          Nieuwe aflossing
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">De naam van de schuld/aflossing</InputLabel>
              <Input
                id="omschrijfing"
                // error={!!errors.naam}
                value={rekening.naam}
                type="text"
                onChange={(e) => handleInputRekeningWijziging('naam', e.target.value)}
              />
              {/* {errors.omschrijving && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.omschrijving}</Typography>
              )} */}
            </FormControl>

            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Hoe groot is de schuld/aflossing op dit moment?</InputLabel>
              <Input
                id="standard-adornment-amount"
                // error={!!errors.bedrag}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                value={aflossing.eindBedrag}
                type="number"
                onChange={(e) => handleInputAflossingWijziging('eindBedrag', parseFloat(e.target.value))}
                onFocus={handleFocus}
              />
              {/* {errors.eindBedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.eindBedrag}</Typography>
              )} */}
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Wat wordt er maandelijks afgelost?</InputLabel>
              <Input
                id="standard-adornment-amount"
                // error={!!errors.aflossingsBedrag}
                startAdornment={<InputAdornment position="start">€</InputAdornment>}
                value={aflossing.aflossingsBedrag}
                type="number"
                onChange={(e) => handleInputAflossingWijziging('aflossingsBedrag', parseFloat(e.target.value))}
                onFocus={handleFocus}
              />
              {/* {errors.bedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.aflossingsBedrag}</Typography>
              )} */}
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Op welke dag in de maand wordt het overgemaakt?</InputLabel>
              <Input
                id="standard-adornment-amount"
                // error={!!errors.betaalDag}
                value={aflossing.betaalDag}
                type="number"
                onChange={(e) => handleInputAflossingWijziging('betaalDag', parseFloat(e.target.value))}
                onFocus={handleFocus}
              />
              {/* {errors.bedrag && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.betaalDag}</Typography>
                )} */}
            </FormControl>
            <Typography variant="body1" style={{ marginTop: '25px' }}>
              De verwachte einddatum van de schuld/aflossing {aflossing.eindDatum ? `is ${aflossing.eindDatum?.format('DD-MM-YYYY')}.` : 'kan nog niet worden berekend.'}
            </Typography>
            <FormControl fullWidth sx={{ m: 1 }} variant="standard">
              <InputLabel htmlFor="standard-adornment-amount">Wat is het dossiernummer?</InputLabel>
              <Input
                id="omschrijfing"
                // error={!!errors.naam}
                value={aflossing.dossierNummer}
                type="text"
                onChange={(e) => handleInputAflossingWijziging('dossierNummer', e.target.value)}
              />
              {/* {errors.omschrijving && (
                <Typography style={{ color: 'red', fontSize: '0.75rem' }}>{errors.omschrijving}</Typography>
                )} */}
            </FormControl>
            <TextField
              id="outlined-basic"
              label="Notities"
              variant="standard"
              value={aflossing.notities}
              fullWidth={true}
              minRows={4}
              onChange={(e) => handleInputAflossingWijziging('notities', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleSubmit}>
            Bewaar aflossing
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
