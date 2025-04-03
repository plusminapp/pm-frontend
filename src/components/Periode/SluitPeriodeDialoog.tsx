import { Fragment, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { formateerNlDatum, Periode } from '../../model/Periode';
import { Box, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Resultaat from '../Resultaat';

import { Stand } from '../../model/Stand';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../../context/CustomContext';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

type SluitPeriodeDialoogProps = {
  periode: Periode
}

export default function SluitPeriodeDialoog(props: SluitPeriodeDialoogProps) {
  const [open, setOpen] = useState(false);

  const [stand, setStand] = useState<Stand | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false);

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, setSnackbarMessage } = useCustomContext();

  const navigate = useNavigate();
  useEffect(() => {
    const fetchSaldi = async () => {
      if (actieveHulpvrager && props.periode) {
        setIsLoading(true);
        const vandaag = dayjs().format('YYYY-MM-DD');
        const datum = props.periode.periodeEindDatum > vandaag ? vandaag : props.periode.periodeEindDatum;
        const id = actieveHulpvrager.id
        let token = '';
        try { token = await getIDToken() }
        catch (error) {
          navigate('/login');
        }
        const response = await fetch(`/api/v1/saldo/hulpvrager/${id}/stand/${datum}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setStand(result)
        } else {
          console.error("Failed to fetch data", response.status);
          setSnackbarMessage({
            message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
            type: "warning",
          })
        }
      }
    };
    fetchSaldi();

  }, [actieveHulpvrager, props.periode, getIDToken]);


  if (isLoading) {
    return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
  };



  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Button onClick={() => handleClickOpen()} sx={{ minWidth: '24px', color: 'grey', p: "5px" }}>
        <LockOutlinedIcon fontSize="small" />
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
        Sluit periode 
        <Typography fontSize={'0.875rem'}>
          van {formateerNlDatum(props.periode.periodeStartDatum)} t/m {formateerNlDatum(props.periode.periodeEindDatum)}
          </Typography>
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

        <DialogContent>
          <DialogContentText>
            { stand &&
              <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2} columns={1}>
                  <Grid size={2}>
                    <Resultaat title={'Inkomsten en uitgaven'} datum={stand.peilDatum} saldi={stand.resultaatOpDatum} />
                  </Grid>
                  <Grid size={2}>
                    <Resultaat title={'Stand'} datum={stand.peilDatum} saldi={stand.balansOpDatum!} />
                  </Grid>
                </Grid>
              </Box>
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} startIcon={<LockOutlinedIcon sx={{ fontSize: '35px' }} />} >Sluit periode</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
