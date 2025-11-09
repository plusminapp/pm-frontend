import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
import { usePlusminApi } from '../../api/plusminApi';
import { PlusMinLogo } from '../../assets/PlusMinLogo';
import { useCustomContext } from '../../context/CustomContext';
import { Periode } from '../../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../../model/RekeningGroep';
import StyledSnackbar from '../StyledSnackbar';
import { useTranslation } from 'react-i18next';
import { TaalKeuzes } from './TaalKeuzes';
import { Administratie } from '../../model/Administratie';

const I18N_KEY = 'components.header';

function Header() {
  const { t } = useTranslation();

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
    getGebruikerZelf,
    getRekeningenVooradministratieEnPeriode: getRekeningenVoorAdministratieEnPeriode,
    getStandVooradministratieEnDatum,
  } = usePlusminApi();

  const {
    gebruiker,
    setGebruiker,
    administraties,
    setAdministraties,
    actieveAdministratie,
    setActieveAdministratie,
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

  const { pathname } = useLocation();
  const currentPage = (() => {
    const first = pathname.indexOf('/', 1);
    const page = first === -1 ? pathname.slice(1) : pathname.slice(1, first);
    return page.charAt(0).toUpperCase() + page.slice(1);
  })();

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

  const handleActieveAdministratieChange = async (id: number) => {
    let ahv = administraties.find((hv) => hv.id === id);
    ahv = ahv ? ahv : undefined;
    setActieveAdministratie(ahv);
    setPeriodes(
      ahv!.periodes.sort((a, b) =>
        dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)),
      ),
    );
    let nieuweGekozenPeriode = gekozenPeriode;
    if (
      !gekozenPeriode ||
      !ahv!.periodes.includes(gekozenPeriode) ||
      gekozenPeriode.periodeStartDatum === gekozenPeriode.periodeEindDatum
    ) {
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
    async (administratie: Administratie, periode: Periode) => {
      const dataRekening = await getRekeningenVoorAdministratieEnPeriode(
        administratie,
        periode,
      );
      setRekeningGroepPerBetalingsSoort(
        dataRekening as RekeningGroepPerBetalingsSoort[],
      );
    },
    [getRekeningenVoorAdministratieEnPeriode, setRekeningGroepPerBetalingsSoort],
  );

  const determineSessionExpiry = useCallback(async () => {
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
  }, [getIDToken]);

  const fetchGebruikerMetAdministraties = useCallback(async () => {
    const dataGebruiker = await getGebruikerZelf();
    setGebruiker(dataGebruiker);
    setAdministraties(dataGebruiker.administraties as Administratie[]);

    const opgeslagenActieveAdministratieId =
      localStorage.getItem('actieveAdministratie');
    const opgeslagenActieveAdministratie =
      (opgeslagenActieveAdministratieId === undefined)
        ? dataGebruiker?.administraties[0]
          : (dataGebruiker.administraties as Administratie[]).find(
              (hv) => Number(hv.id) === Number(opgeslagenActieveAdministratieId),
            );

    const opgeslagenGekozenPeriodeId = localStorage.getItem('gekozenPeriode');
    const opgeslagenGekozenPeriode = opgeslagenGekozenPeriodeId
      ? (opgeslagenActieveAdministratie?.periodes as Periode[])?.find(
          (periode) => periode.id === Number(opgeslagenGekozenPeriodeId),
        )
      : undefined;

    let nieuweActieveAdministratie, nieuweGekozenPeriode;
    if (opgeslagenActieveAdministratie) {
      nieuweActieveAdministratie = opgeslagenActieveAdministratie;
      if (opgeslagenGekozenPeriode && opgeslagenGekozenPeriode.periodeStartDatum !== opgeslagenGekozenPeriode.periodeEindDatum) {
        nieuweGekozenPeriode = opgeslagenGekozenPeriode;
      } else {
        const huidigePeriode = (
          opgeslagenActieveAdministratie.periodes as Periode[]
        ).find((periode) => periode.periodeStatus === 'HUIDIG');
        nieuweGekozenPeriode = huidigePeriode;
      }
    } else if (
      dataGebruiker.roles.includes('ROLE_VRIJWILLIGER') &&
      dataGebruiker.administraties.length > 0
    ) {
      nieuweActieveAdministratie = dataGebruiker.administraties[0];
      nieuweGekozenPeriode = nieuweActieveAdministratie.periodes[1];
    } else {
      nieuweActieveAdministratie = dataGebruiker.administraties[0];
      nieuweGekozenPeriode = nieuweActieveAdministratie?.periodes[1];
    }

    setActieveAdministratie(nieuweActieveAdministratie);
    setGekozenPeriode(nieuweGekozenPeriode);
    localStorage.setItem('gekozenPeriode', nieuweGekozenPeriode?.id + '');

    if (nieuweGekozenPeriode) {
      await fetchRekeningen(nieuweActieveAdministratie, nieuweGekozenPeriode);
    }
  }, [
    getGebruikerZelf,
    setGebruiker,
    setAdministraties,
    setActieveAdministratie,
    setGekozenPeriode,
    fetchRekeningen,
  ]);

  useEffect(() => {
    if (state.isAuthenticated) {
      determineSessionExpiry();
      fetchGebruikerMetAdministraties();
    }
  }, [
    state.isAuthenticated,
    fetchGebruikerMetAdministraties,
    determineSessionExpiry,
  ]);

  useEffect(() => {
    const fetchSaldi = async () => {
      if (actieveAdministratie && gekozenPeriode) {
        const vandaag = dayjs().format('YYYY-MM-DD');
        const datum =
          gekozenPeriode.periodeEindDatum > vandaag
            ? vandaag
            : gekozenPeriode.periodeEindDatum;
        try {
          const stand = await getStandVooradministratieEnDatum(
            actieveAdministratie,
            datum,
          );

          setStand(stand);
          setIsStandDirty(false);
        } catch (error) {
          console.error('Error fetching stand:', error);
        }
      }
    };
    fetchSaldi();
  }, [
    actieveAdministratie,
    getStandVooradministratieEnDatum,
    gekozenPeriode,
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
                    className={currentPage === page ? 'selected' : ''}
                  >
                    {t(`${I18N_KEY}.${page.toLowerCase()}`)}
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
                    sx={{ p: '6px', my: 'auto', mr: { xs: '3px', md: '10px' } }}
                    className={
                      currentPage.toLowerCase() === 'profiel' ? 'selected' : ''
                    }
                  >
                    {actieveAdministratie?.naam}
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
                    {administraties
                      .sort((a, b) => a.naam.localeCompare(b.naam))
                      .map((administratie) => (
                        <MenuItem
                          key={administratie.id}
                          onClick={() =>
                            handleActieveAdministratieChange(administratie.id)
                          }
                        >
                          <Typography sx={{ textAlign: 'center' }}>
                            {administratie.id === actieveAdministratie?.id
                              ? '> '
                              : ''}
                            {administratie.naam}
                          </Typography>
                        </MenuItem>
                      ))}
                    <MenuItem key={'logout'} onClick={handleLogout}>
                      <Typography sx={{ textAlign: 'center' }}>
                        Uitloggen
                      </Typography>
                    </MenuItem>
                    <MenuItem>
                      <TaalKeuzes />
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
                        selected={currentPage === page}
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
