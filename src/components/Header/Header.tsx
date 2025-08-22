import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useAuthContext } from '@asgardeo/auth-react';

import dayjs from 'dayjs';
import { PlusMinLogo } from '../../assets/PlusMinLogo';
import { useCustomContext } from '../../context/CustomContext';
import { Gebruiker } from '../../model/Gebruiker';
import { Periode } from '../../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../../model/RekeningGroep';
import StyledSnackbar from './../StyledSnackbar';

function Header() {
  const navigate = useNavigate();
  const handleNavigation = (page: string) => {
    setAnchorElNav(null);
    navigate(page);
  };
  const { state, signIn, getIDToken, signOut, revokeAccessToken } =
    useAuthContext();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const [anchorElGebruiker, setAnchorElGebruiker] =
    React.useState<null | HTMLElement>(null);
  const [expiry, setExpiry] = React.useState<Date | null>(null);

  const {
    gebruiker,
    setGebruiker,
    hulpvragers,
    setHulpvragers,
    actieveHulpvrager,
    setActieveHulpvrager,
    snackbarMessage,
    setSnackbarMessage,
    gekozenPeriode,
    setGekozenPeriode,
    setStand,
    isStandDirty,
    setIsStandDirty,
    rekeningGroepPerBetalingsSoort,
    setRekeningGroepPerBetalingsSoort,
    setPeriodes,
  } = useCustomContext();

  const rekeningGroepen = Array.from(
    new Map(
      rekeningGroepPerBetalingsSoort
        .flatMap((bs) => bs.rekeningGroepen)
        .map((r) => [r.id, r]),
    ).values(),
  );

  const formatRoute = (page: string): string => {
    return page.toLowerCase().replace('/', '-');
  };

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
    let ahv = hulpvragers.find((hv) => hv.id === id);
    ahv = ahv ? ahv : gebruiker;
    setActieveHulpvrager(ahv);
    setPeriodes(
      ahv!.periodes.sort((a, b) =>
        dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)),
      ),
    );
    let nieuweGekozenPeriode = gekozenPeriode;
    if (!gekozenPeriode || !ahv!.periodes.includes(gekozenPeriode)) {
      nieuweGekozenPeriode = ahv!.periodes.find(
        (periode) => periode.periodeStatus === 'HUIDIG',
      );
      setGekozenPeriode(nieuweGekozenPeriode);
      localStorage.setItem('gekozenPeriode', nieuweGekozenPeriode?.id + '');
    }
    await fetchRekeningen(ahv!, nieuweGekozenPeriode!);
    setAnchorElGebruiker(null);
    navigate('/profiel');
  };

  const fetchRekeningen = useCallback(
    async (hulpvrager: Gebruiker, periode: Periode) => {
      let token;
      try {
        token = await getIDToken();
      } catch (error) {
        console.error('Error getting ID token:', error);
      }

      const responseRekening = await fetch(
        `/api/v1/rekening/hulpvrager/${hulpvrager.id}/periode/${periode.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const dataRekening = await responseRekening.json();
      setRekeningGroepPerBetalingsSoort(
        dataRekening as RekeningGroepPerBetalingsSoort[],
      );
    },
    [getIDToken, setRekeningGroepPerBetalingsSoort],
  );

  const fetchGebruikerMetHulpvragers = useCallback(async () => {
    let token;
    try {
      token = await getIDToken();
      if (!token) {
        setExpiry(null);
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) {
        setExpiry(null);
        return;
      }
      setExpiry(new Date(exp * 1000));
    } catch (error) {
      console.error('Error getting ID token:', error);
    }

    const responseGebruiker = await fetch('/api/v1/gebruiker/zelf', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const dataGebruiker = await responseGebruiker.json();
    setGebruiker(dataGebruiker.gebruiker as Gebruiker);
    setHulpvragers(dataGebruiker.hulpvragers as Gebruiker[]);

    const opgeslagenActieveHulpvragerId =
      localStorage.getItem('actieveHulpvrager');
    const opgeslagenActieveHulpvrager =
      opgeslagenActieveHulpvragerId === undefined
        ? dataGebruiker.gebruiker
        : Number(dataGebruiker.gebruiker?.id) ===
            Number(opgeslagenActieveHulpvragerId)
          ? dataGebruiker.gebruiker
          : (dataGebruiker.hulpvragers as Gebruiker[]).find(
              (hv) => Number(hv.id) === Number(opgeslagenActieveHulpvragerId),
            );

    const opgeslagenGekozenPeriodeId = localStorage.getItem('gekozenPeriode');
    const opgeslagenGekozenPeriode = opgeslagenGekozenPeriodeId
      ? (opgeslagenActieveHulpvrager.periodes as Periode[]).find(
          (periode) => periode.id === Number(opgeslagenGekozenPeriodeId),
        )
      : undefined;

    let nieuweActieveHulpvrager, nieuweGekozenPeriode;
    if (opgeslagenActieveHulpvrager) {
      nieuweActieveHulpvrager = opgeslagenActieveHulpvrager;
      if (opgeslagenGekozenPeriode) {
        nieuweGekozenPeriode = opgeslagenGekozenPeriode;
      } else {
        const huidigePeriode = (
          opgeslagenActieveHulpvrager.periodes as Periode[]
        ).find((periode) => periode.periodeStatus === 'HUIDIG');
        nieuweGekozenPeriode = huidigePeriode;
      }
    } else if (
      dataGebruiker.gebruiker.roles.includes('ROLE_VRIJWILLIGER') &&
      dataGebruiker.hulpvragers.length > 0
    ) {
      nieuweActieveHulpvrager = dataGebruiker.hulpvragers[0];
      nieuweGekozenPeriode = dataGebruiker.hulpvragers[0].periodes[0];
    } else {
      nieuweActieveHulpvrager = dataGebruiker.gebruiker;
      nieuweGekozenPeriode = dataGebruiker.gebruiker.periodes[0];
    }

    setActieveHulpvrager(nieuweActieveHulpvrager);
    setGekozenPeriode(nieuweGekozenPeriode);
    localStorage.setItem('gekozenPeriode', nieuweGekozenPeriode.id + '');

    await fetchRekeningen(nieuweActieveHulpvrager, nieuweGekozenPeriode);
  }, [
    getIDToken,
    setActieveHulpvrager,
    setGebruiker,
    setHulpvragers,
    setGekozenPeriode,
    fetchRekeningen,
  ]);

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchGebruikerMetHulpvragers();
    }
  }, [state.isAuthenticated, fetchGebruikerMetHulpvragers]);

  useEffect(() => {
    const fetchSaldi = async () => {
      let token = '';
      try {
        token = await getIDToken();
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
      if (actieveHulpvrager && gekozenPeriode && token) {
        const vandaag = dayjs().format('YYYY-MM-DD');
        const datum =
          gekozenPeriode.periodeEindDatum > vandaag
            ? vandaag
            : gekozenPeriode.periodeEindDatum;
        const id = actieveHulpvrager.id;
        const response = await fetch(
          `/api/v1/stand/hulpvrager/${id}/datum/${datum}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );
        if (response.ok) {
          const result = await response.json();
          setStand(result);
          setIsStandDirty(false);
        } else {
          console.error('Failed to fetch data', response.status);
        }
      }
    };
    fetchSaldi();
  }, [
    actieveHulpvrager,
    gekozenPeriode,
    getIDToken,
    isStandDirty,
    setIsStandDirty,
    setStand,
  ]);

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('User signed out');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  const handleLogin = async () => {
    try {
      if (state.isAuthenticated) await revokeAccessToken();
      await signIn();
      navigate('/profiel');
    } catch (error) {
      console.error('Error during sign-in:', error);
      navigate('/login');
    }
  };

  const pages = ['Stand', 'Kasboek'];
  const heeftAflossing = rekeningGroepen.some(
    (rekeningGroep) => rekeningGroep.rekeningGroepSoort === 'AFLOSSING',
  );
  if (heeftAflossing) pages.push('Aflossen');
  const heeftSparen = rekeningGroepen.some(
    (rekeningGroep) => rekeningGroep.rekeningGroepSoort === 'SPAARREKENING',
  );
  if (heeftSparen) pages.push('Sparen');

  return (
    <>
      <AppBar
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 25,
          bgcolor: 'white',
          color: '#333',
          boxShadow: 0,
        }}
      >
        <Toolbar disableGutters>
          <IconButton onClick={() => handleNavigation('/visualisatie')}>
            <PlusMinLogo />
          </IconButton>

          {state.isAuthenticated && (
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

              {expiry && (
                <Typography sx={{ ml: 2, color: 'gray', fontSize: 12 }}>
                  Sessie tot {expiry.getHours().toString().padStart(2, '0')}:
                  {expiry.getMinutes().toString().padStart(2, '0')}
                </Typography>
              )}

              {/* profiel & settings */}
              <Box sx={{ ml: 'auto', display: 'flex' }}>
                <Box
                  onClick={() => navigate('/profiel')}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    sx={{ my: 'auto', mr: { xs: '3px', md: '10px' } }}
                  >
                    {actieveHulpvrager?.bijnaam}
                  </Typography>
                </Box>
                <Box sx={{ flexDirection: 'row' }}>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenGebruikerMenu} sx={{ p: 0 }}>
                      <Box
                        sx={{
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
                        }}
                      >
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
                    <MenuItem
                      key={'profile'}
                      onClick={() =>
                        handleActieveHulpvragerChange(gebruiker!.id)
                      }
                    >
                      <Typography sx={{ textAlign: 'center' }}>
                        {actieveHulpvrager?.id === gebruiker?.id ? '> ' : ''}
                        {gebruiker?.bijnaam}
                      </Typography>
                    </MenuItem>
                    {hulpvragers
                      .sort((a, b) => a.bijnaam.localeCompare(b.bijnaam))
                      .map((hulpvrager) => (
                        <MenuItem
                          key={hulpvrager.id}
                          onClick={() =>
                            handleActieveHulpvragerChange(hulpvrager.id)
                          }
                        >
                          <Typography sx={{ textAlign: 'center' }}>
                            {hulpvrager.id === actieveHulpvrager?.id
                              ? '> '
                              : ''}
                            {hulpvrager.bijnaam}
                          </Typography>
                        </MenuItem>
                      ))}
                    <MenuItem key={'logout'} onClick={handleLogout}>
                      <Typography sx={{ textAlign: 'center' }}>
                        Uitloggen
                      </Typography>
                    </MenuItem>
                  </Menu>
                </Box>

                {/* Hambuger menu */}
                <Box
                  sx={{
                    flexGrow: 1,
                    ml: 0,
                    display: { xs: 'flex', md: 'none' },
                  }}
                >
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
                      <MenuItem
                        key={page}
                        onClick={() => handleNavigation(formatRoute(page))}
                      >
                        <Typography sx={{ textAlign: 'center', color: '#222' }}>
                          {page}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Box>
            </>
          )}

          {!state.isAuthenticated && (
            <Button
              variant="contained"
              sx={{ ml: 'auto' }}
              color={'success'}
              onClick={handleLogin}
            >
              Inloggen
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <StyledSnackbar
        message={snackbarMessage.message}
        type={snackbarMessage.type}
        onClose={() =>
          setSnackbarMessage({ message: undefined, type: undefined })
        }
      />
    </>
  );
}
export default Header;
