import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useAuthContext } from '@asgardeo/auth-react';
import { Stand } from '../model/Stand';
import { useCustomContext } from '../context/CustomContext';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import Button from '@mui/material/Button';

import { eersteOpenPeriode, formateerNlDatum, formateerNlVolgendeDag, laatsteGeslotenPeriode, voegEenDagToe } from '../model/Periode';
import Resultaat from '../components/Resultaat';

const Periode = () => {
    const { actieveHulpvrager, setSnackbarMessage, periodes } = useCustomContext();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const parameterWaarde = queryParams.get('actie');
    const actie = parameterWaarde === 'wijzigen' ? 'wijzigen' : 'sluiten';
    const periode = actie === 'wijzigen' ?
        laatsteGeslotenPeriode(periodes) : eersteOpenPeriode(periodes);

    if (!periode) {
        return <Typography variant='h4' sx={{ mb: '25px' }}>Er is geen periode die kan worden afgesloten...</Typography>
    }
    const [stand, setStand] = useState<Stand | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false);
    const { getIDToken } = useAuthContext();

    const navigate = useNavigate();
    useEffect(() => {
        const fetchSaldi = async () => {
            setIsLoading(true);
            if (actieveHulpvrager && periode) {
                setIsLoading(true);
                const datum = periode.periodeEindDatum;
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
    }, [actieveHulpvrager, periode, getIDToken]);

    if (isLoading) {
        return <Typography sx={{ mb: '25px' }}>De saldi worden opgehaald.</Typography>
    };

    return (
        <Fragment>
            <Grid>
                <Typography variant='h4'>Periode {actie === 'wijzigen' ? 'wijzigen' : 'sluiten'}.</Typography>
                {periode.periodeStartDatum === periode.periodeEindDatum ?
                    <Typography fontSize={'0.875rem'}>Opening op {formateerNlVolgendeDag(periode.periodeEindDatum)}</Typography> :
                    <Typography fontSize={'0.875rem'}>
                    van {formateerNlDatum(periode.periodeStartDatum)} t/m {formateerNlDatum(periode.periodeEindDatum)}
                </Typography>}
            </Grid>

            <Grid>
                {stand &&
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2} columns={1}>
                            <Grid size={2}>
                                <Resultaat title={'Stand'} datum={voegEenDagToe(stand.peilDatum)} saldi={stand.balansOpDatum!} />
                            </Grid>
                        {periode.periodeStartDatum !== periode.periodeEindDatum &&
                            <Grid size={2}>
                                <Resultaat title={'Inkomsten en uitgaven'} datum={stand.peilDatum} saldi={stand.resultaatOpDatum} />
                            </Grid>}
                        </Grid>
                    </Box>
                }
            </Grid >
            <Grid display="flex" flexDirection="row" alignItems={'center'} justifyContent="flex-end" >
                {actie === 'wijzigen' &&
                    <Button startIcon={<SaveOutlinedIcon sx={{ fontSize: '35px' }} />} >Bewaar periode</Button>}
                {actie === 'sluiten' &&
                    <Button startIcon={<LockOutlinedIcon sx={{ fontSize: '35px' }} />} >Sluit periode</Button>}
            </Grid>
        </Fragment>
    );
}
export default Periode;