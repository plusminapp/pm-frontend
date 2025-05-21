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

import { PlusMinLogo } from "../../assets/PlusMinLogo";
import { useCustomContext } from '../../context/CustomContext';
import { Periode } from '../../model/Periode';
import { Gebruiker } from '../../model/Gebruiker';
import { RekeningGroepDTO } from '../../model/RekeningGroep';
import { berekenMaandAflossingenBedrag } from '../../model/Aflossing';
import StyledSnackbar from './../StyledSnackbar';
import { saveToLocalStorage, transformRekeningGroepen2BetalingsSoorten, transformRekeningGroepenToBetalingsSoorten } from './HeaderExports';

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
    gekozenPeriode, setGekozenPeriode,
    setPeriodes, setRekeningen, setBetalingsSoorten, setBetalingsSoorten2Rekeningen } = useCustomContext();

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

  const handleActieveHulpvragerChange = async (id: number) => {
    let ahv = hulpvragers.find(hv => hv.id === id)
    ahv = ahv ? ahv : gebruiker
    setActieveHulpvrager(ahv);
    setPeriodes(ahv!.periodes);
    let nieuweGekozenPeriode = gekozenPeriode;
    if (!gekozenPeriode || !ahv!.periodes.includes(gekozenPeriode)) {
      nieuweGekozenPeriode = ahv!.periodes.find(periode => periode.periodeStatus === 'HUIDIG');
      setGekozenPeriode(nieuweGekozenPeriode);
      saveToLocalStorage('gekozenPeriode', nieuweGekozenPeriode?.id + '');
    }
    await fetchRekeningen(ahv!, nieuweGekozenPeriode!);
    setAnchorElGebruiker(null);
    navigate('/stand')
  };

  const fetchRekeningen = useCallback(async (hulpvrager: Gebruiker, periode: Periode) => {
    let token
    try {
      token = await getIDToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
    }

    const responseRekening = await fetch(`/api/v1/RekeningGroep/hulpvrager/${hulpvrager.id}/periode/${periode.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
    const dataRekening = await responseRekening.json();
    setRekeningen(dataRekening as RekeningGroepDTO[]);
    setBetalingsSoorten(transformRekeningGroepen2BetalingsSoorten(dataRekening as RekeningGroepDTO[]));
    setBetalingsSoorten2Rekeningen(transformRekeningGroepenToBetalingsSoorten(dataRekening as RekeningGroepDTO[]));

  }, [getIDToken, setRekeningen, setBetalingsSoorten, setBetalingsSoorten2Rekeningen]);

  const fetchGebruikerMetHulpvragers = useCallback(async () => {
    let token
    try {
      token = await getIDToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
    }

    const responseGebruiker = await fetch('/api/v1/gebruiker/zelf', {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
    const dataGebruiker = await responseGebruiker.json();
    setGebruiker(dataGebruiker.gebruiker as Gebruiker);
    setHulpvragers(dataGebruiker.hulpvragers as Gebruiker[]);

    const opgeslagenActieveHulpvragerId = localStorage.getItem('actieveHulpvrager');
    const opgeslagenActieveHulpvrager = Number(dataGebruiker.gebruiker?.id) === Number(opgeslagenActieveHulpvragerId) ?
      dataGebruiker.gebruiker : (dataGebruiker.hulpvragers as Gebruiker[]).find(hv => Number(hv.id) === Number(opgeslagenActieveHulpvragerId))

    const opgeslagenGekozenPeriodeId = localStorage.getItem('gekozenPeriode');
    const opgeslagenGekozenPeriode = opgeslagenGekozenPeriodeId ?
      (opgeslagenActieveHulpvrager.periodes as Periode[])
        .find(periode => periode.id === Number(opgeslagenGekozenPeriodeId)) : undefined;

    let nieuweActieveHulpvrager, nieuweGekozenPeriode;
    if (opgeslagenActieveHulpvrager) {
      nieuweActieveHulpvrager = opgeslagenActieveHulpvrager
      if (opgeslagenGekozenPeriode) {
        nieuweGekozenPeriode = (opgeslagenGekozenPeriode)
      } else {
        const huidigePeriode = (opgeslagenActieveHulpvrager.periodes as Periode[])
          .find(periode => periode.periodeStatus === 'HUIDIG');
        nieuweGekozenPeriode = (huidigePeriode);
      }
    } else if (dataGebruiker.gebruiker.roles.includes('ROLE_VRIJWILLIGER') && dataGebruiker.hulpvragers.length > 0) {
      nieuweActieveHulpvrager = (dataGebruiker.hulpvragers[0])
      nieuweGekozenPeriode = (dataGebruiker.hulpvragers[0].periodes[0])
    } else {
      nieuweActieveHulpvrager = (dataGebruiker.gebruiker)
      nieuweGekozenPeriode = (dataGebruiker.gebruiker.periodes[0])
    }

    setActieveHulpvrager(nieuweActieveHulpvrager);
    setGekozenPeriode(nieuweGekozenPeriode);
    saveToLocalStorage('gekozenPeriode', nieuweGekozenPeriode + '');

    await fetchRekeningen(nieuweActieveHulpvrager, nieuweGekozenPeriode);
  }, [getIDToken, setActieveHulpvrager, setGebruiker, setHulpvragers, setGekozenPeriode, fetchRekeningen]);

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchGebruikerMetHulpvragers();
    }
  }, [state.isAuthenticated, fetchGebruikerMetHulpvragers]);

  // useEffect(() => {
  //     if (!state.isLoading && !state.isAuthenticated) {
  //         navigate('/login');
  //     }
  // }, [state.isAuthenticated, state.isLoading, navigate]);

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
      navigate('/stand');
    } catch (error) {
      console.error("Error during sign-in:", error);
      navigate('/login');
    }
  };

  const maandAflossingsBedrag = berekenMaandAflossingenBedrag(actieveHulpvrager?.aflossingen ?? [])
  const heeftAflossing = maandAflossingsBedrag > 0;
  const pages = heeftAflossing ? ['Stand', 'Kasboek', 'Schuld/Aflossingen'] : ['Stand', 'Kasboek'];

  return (
    <>
      <AppBar sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: "white", color: '#333', boxShadow: 0 }}>
        <Toolbar disableGutters>
          <IconButton onClick={() => handleNavigation("/visualisatie")}>
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
                    <MenuItem key={'profile'} onClick={() => handleActieveHulpvragerChange(gebruiker!.id)}>
                      <Typography sx={{ textAlign: 'center' }}>
                        {actieveHulpvrager?.id === gebruiker?.id ? '> ' : ''}
                        {gebruiker?.bijnaam}</Typography>
                    </MenuItem>
                    {hulpvragers.sort((a, b) => a.bijnaam.localeCompare(b.bijnaam)).map(hulpvrager =>
                      <MenuItem key={hulpvrager.id} onClick={() => handleActieveHulpvragerChange(hulpvrager.id)}>
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