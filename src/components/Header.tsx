import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { useAuthContext } from "@asgardeo/auth-react";

import { PlusMinLogo } from "../assets/PlusMinLogo";
import { useCustomContext } from '../context/CustomContext';
import { Rekening, RekeningPaar } from '../model/Rekening';
import { BetalingsSoort, betalingsSoorten2RekeningenSoorten } from '../model/Betaling';
import { Periode } from '../model/Periode';
import { Gebruiker } from '../model/Gebruiker';
import { berekenMaandAflossingenBedrag } from '../model/Aflossing';
import StyledSnackbar from './StyledSnackbar';

export const saveToLocalStorage = (key: string, value: string) => {
    localStorage.setItem(key, value);
};

export const transformRekeningenToBetalingsSoorten = (rekeningen: Rekening[]): Map<BetalingsSoort, RekeningPaar> => {
    const result = new Map<BetalingsSoort, RekeningPaar>();
    betalingsSoorten2RekeningenSoorten.forEach((rekeningSoortPaar, betalingsSoort) => {
        const bronRekeningen = rekeningen
            .filter(rekening => rekeningSoortPaar.bron.includes(rekening.rekeningSoort))
            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1);
        const BestemmingRekeningen = rekeningen
            .filter(rekening => rekeningSoortPaar.bestemming.includes(rekening.rekeningSoort))
            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1);
        if (bronRekeningen.length > 0 && BestemmingRekeningen.length > 0) {
            result.set(betalingsSoort, {
                bron: bronRekeningen,
                bestemming: BestemmingRekeningen
            });
        }
    });
    return result;
}

function Header() {
    const navigate = useNavigate();
    const handleNavigation = (page: string) => {
        setAnchorElNav(null);
        navigate(page);
    };
    const { state, signIn, getIDToken, signOut, revokeAccessToken } = useAuthContext();

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElGebruiker, setAnchorElGebruiker] = React.useState<null | HTMLElement>(null);

    const { gebruiker, setGebruiker,
        hulpvragers, setHulpvragers,
        actieveHulpvrager, setActieveHulpvrager,
        snackbarMessage, setSnackbarMessage,
        setRekeningen, setBetalingsSoorten, setBetaalMethoden, setBetalingsSoorten2Rekeningen, setPeriodes, setActieveHulpvragerData } = useCustomContext();

    const formatRoute = (page: string): string => { return page.toLowerCase().replace('/', '-') }

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenGebruikerMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElGebruiker(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    const handleCloseGebruikerMenu = () => {
        setAnchorElGebruiker(null);
    };

    const handleActieveHulpvrager = (id: number) => {
        let ahv = hulpvragers.find(hv => hv.id === id)
        ahv = ahv ? ahv : gebruiker
        setActieveHulpvragerData(ahv, undefined);
        setAnchorElGebruiker(null);
        navigate('/profiel')
    };

    const fetchGebruikerMetHulpvragers = useCallback(async () => {
        let token
        try {
            token = await getIDToken();
        } catch (error) {
            navigate('/home');
        }

        const response = await fetch('/api/v1/gebruiker/zelf', {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
        const data = await response.json();
        setGebruiker(data.gebruiker as Gebruiker);
        setHulpvragers(data.hulpvragers as Gebruiker[]);

        const opgeslagenActieveHulpvragerId = localStorage.getItem('actieveHulpvrager');
        const opgeslagenActieveHulpvrager = Number(data.gebruiker?.id) === Number(opgeslagenActieveHulpvragerId) ?
            data.gebruiker : (data.hulpvragers as Gebruiker[]).find(hv => Number(hv.id) === Number(opgeslagenActieveHulpvragerId))

        const opgeslagenGekozenPeriodeId = await localStorage.getItem('gekozenPeriode');
        const opgeslagenGekozenPeriode = opgeslagenGekozenPeriodeId ?
            (opgeslagenActieveHulpvrager.periodes as Periode[])
                .find(periode => periode.id === Number(opgeslagenGekozenPeriodeId)) : undefined;

        if (opgeslagenActieveHulpvrager) {
            setActieveHulpvragerData(opgeslagenActieveHulpvrager, opgeslagenGekozenPeriode)
        } else if (data.gebruiker.roles.includes('ROLE_VRIJWILLIGER') && data.hulpvragers.length > 0) {
            setActieveHulpvragerData(data.hulpvragers[0], undefined)
        } else {
            setActieveHulpvragerData(data.gebruiker, undefined)
        }
    }, [getIDToken, setGebruiker, setHulpvragers, setActieveHulpvrager, setRekeningen, setBetalingsSoorten, setBetaalMethoden, setBetalingsSoorten2Rekeningen, setPeriodes])

    useEffect(() => {
        if (state.isAuthenticated) {
            fetchGebruikerMetHulpvragers();
        }
    }, [state.isAuthenticated, fetchGebruikerMetHulpvragers]);

    useEffect(() => {
        if (!state.isLoading && !state.isAuthenticated) {
            navigate('/login');
        }
    }, [state.isAuthenticated, navigate]);

    const handleLogout = async () => {
      try {
        await signOut();
        console.log("User signed out");
      } catch (error) {
        console.error("Error during sign-out:", error);
      }
    };
    
    const handleLogin = async () => {
      try {
        if (state.isAuthenticated)
            await revokeAccessToken();
        await signIn();
        console.log("User signed in");
      } catch (error) {
        console.error("Error during sign-in:", error);
      }
    };

    const maandAflossingsBedrag = berekenMaandAflossingenBedrag(actieveHulpvrager?.aflossingen ?? [])
    const heeftAflossing = maandAflossingsBedrag > 0;
    const pages = heeftAflossing ? ['Stand', 'Kasboek', 'Schuld/Aflossingen'] : ['Stand', 'Kasboek'];

    return (
        <>
            <AppBar sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: "white", color: '#333', boxShadow: 0 }}>
                <Toolbar disableGutters>
                    <IconButton onClick={() => handleNavigation("/")}>
                        <PlusMinLogo />
                    </IconButton>


                    {state.isAuthenticated &&
                        <>
                            {/* menuitems bij md+ */}
                            <Box sx={{ my: 2, display: { xs: 'none', md: 'flex' } }}>
                                {pages.map((page) => (
                                    <Button
                                        key={page}
                                        onClick={() => handleNavigation(formatRoute(page))}
                                        sx={{ mx: 2, color: '#222', display: 'block' }}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </Box>

                            {/* profiel & settings */}
                            <Box sx={{ ml: 'auto', display: 'flex' }}>
                                <Box onClick={() => navigate('/profiel')} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <Typography sx={{ my: 'auto', mr: { xs: '3px', md: '10px' } }}>{actieveHulpvrager?.bijnaam}</Typography>
                                </Box>
                                <Box sx={{ flexDirection: 'row' }}>
                                    <Tooltip title="Open settings">
                                        <IconButton onClick={handleOpenGebruikerMenu} sx={{ p: 0 }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                backgroundColor: 'lightgrey',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                            }}>
                                                {gebruiker?.bijnaam.charAt(0).toUpperCase()}
                                            </Box>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        sx={{ mt: '45px' }}
                                        id="menu-appbar"
                                        anchorEl={anchorElGebruiker}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorElGebruiker)}
                                        onClose={handleCloseGebruikerMenu}
                                    >
                                        <MenuItem key={'profile'} onClick={() => handleActieveHulpvrager(gebruiker!.id)}>
                                            <Typography sx={{ textAlign: 'center' }}>
                                                {actieveHulpvrager?.id === gebruiker?.id ? '> ' : ''}
                                                {gebruiker?.bijnaam}</Typography>
                                        </MenuItem>
                                        {hulpvragers.sort((a, b) => a.bijnaam.localeCompare(b.bijnaam)).map(hulpvrager =>
                                            <MenuItem key={hulpvrager.id} onClick={() => handleActieveHulpvrager(hulpvrager.id)}>
                                                <Typography sx={{ textAlign: 'center' }}>
                                                    {hulpvrager.id === actieveHulpvrager?.id ? '> ' : ''}
                                                    {hulpvrager.bijnaam}</Typography>
                                            </MenuItem>)}
                                        <MenuItem key={'logout'} onClick={handleLogout}>
                                            <Typography sx={{ textAlign: 'center' }}>Uitloggen</Typography>
                                        </MenuItem>
                                    </Menu>
                                </Box>

                                {/* Hambuger menu */}
                                <Box sx={{ flexGrow: 1, ml: 0, display: { xs: 'flex', md: 'none' } }}>
                                    <IconButton
                                        size="large"
                                        aria-label="account of current gebruiker"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleOpenNavMenu}
                                        color="inherit"
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorElNav}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'left',
                                        }}
                                        open={Boolean(anchorElNav)}
                                        onClose={handleCloseNavMenu}
                                        sx={{ display: { xs: 'block', md: 'none' } }}
                                    >
                                        {pages.map((page) => (
                                            <MenuItem key={page}
                                                onClick={() => handleNavigation(formatRoute(page))}>
                                                <Typography sx={{ textAlign: 'center', color: '#222' }}>{page}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>

                                </Box>
                            </Box>
                        </>
                    }

                    {!state.isAuthenticated &&
                        <Button variant="contained" sx={{ ml: 'auto' }} color={'success'} onClick={handleLogin}>Inloggen</Button>
                    }
                </Toolbar>
            </AppBar>
            <StyledSnackbar message={snackbarMessage.message} type={snackbarMessage.type} onClose={() => setSnackbarMessage({ message: undefined, type: undefined })} />
        </>
    );
}
export default Header;
