import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

import { usePlusminApi } from '../api/plusminApi';
import { useCustomContext } from '../context/CustomContext';
import { Periode } from '../model/Periode';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { Administratie } from '../model/Administratie';
import StyledSnackbar from './StyledSnackbar';
import { TaalKeuzes } from './Header/TaalKeuzes';
import NaarMorgen from './Header/NaarMorgen';

import {
  Home,
  Wallet,
  PiggyBank,
  TrendingDown,
  PieChart,
  X,
} from 'lucide-react';
import { CupIcon } from '@/icons/Cup';

const I18N_KEY = 'components.header';

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function AppSidebar({
  isCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { state, signIn, getAccessToken, revokeAccessToken } = useAuthContext();
  const [expiry, setExpiry] = React.useState<Date | null>(null);
  // const {  } = usePlusminApi();

  const {
    getGebruikerZelf,
    getRekeningenVoorAdministratieEnPeriode,
    getBetalingenVooradministratieVoorPeriode,
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
    setBetalingen,
    setStand,
    isStandDirty,
    setIsStandDirty,
    rekeningGroepPerBetalingsSoort,
    setRekeningGroepPerBetalingsSoort,
    setPeriodes,
    vandaag,
  } = useCustomContext();

  const rekeningGroepen = Array.from(
    new Map(
      rekeningGroepPerBetalingsSoort
        .flatMap((bs) => bs.rekeningGroepen)
        .map((r) => [r.id, r]),
    ).values(),
  );

  const handleNavigation = (page: string) => {
    navigate(page);
    setIsMobileOpen(false);
  };

  const handleActieveAdministratieChange = async (id: number) => {
    let actieveAdmin = administraties.find((admin) => admin.id === id);
    actieveAdmin = actieveAdmin ? actieveAdmin : undefined;
    setActieveAdministratie(actieveAdmin);
    setPeriodes(
      actieveAdmin!.periodes.sort((a, b) =>
        dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)),
      ),
    );
    let nieuweGekozenPeriode = gekozenPeriode;
    if (
      !gekozenPeriode ||
      !actieveAdmin!.periodes.includes(gekozenPeriode) ||
      gekozenPeriode.periodeStartDatum === gekozenPeriode.periodeEindDatum
    ) {
      nieuweGekozenPeriode = actieveAdmin!.periodes.find(
        (periode) => periode.periodeStatus === 'HUIDIG',
      );
      setGekozenPeriode(nieuweGekozenPeriode);
      localStorage.setItem('gekozenPeriode', nieuweGekozenPeriode?.id + '');
    }
    await fetchRekeningen(actieveAdmin!, nieuweGekozenPeriode!);
    navigate('/profiel');
    setIsMobileOpen(false);
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
    [
      getRekeningenVoorAdministratieEnPeriode,
      setRekeningGroepPerBetalingsSoort,
    ],
  );

  const determineSessionInfo = useCallback(async () => {
    let token;
    try {
      token = await getAccessToken();
      if (!token) {
        setExpiry(null);
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      setExpiry(new Date(payload.exp * 1000));
    } catch (error) {
      console.error('Error getting ID token:', error);
    }
  }, [getAccessToken]);

  const fetchGebruikerMetAdministraties = useCallback(async () => {
    const dataGebruiker = await getGebruikerZelf();
    setGebruiker(dataGebruiker);
    setAdministraties(dataGebruiker.administraties as Administratie[]);

    const opgeslagenActieveAdministratieId = localStorage.getItem(
      'actieveAdministratie',
    );
    const opgeslagenActieveAdministratie =
      opgeslagenActieveAdministratieId === undefined
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
      if (
        opgeslagenGekozenPeriode &&
        opgeslagenGekozenPeriode.periodeStartDatum !==
        opgeslagenGekozenPeriode.periodeEindDatum
      ) {
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
      determineSessionInfo();
      fetchGebruikerMetAdministraties();
    }
  }, [
    state.isAuthenticated,
    fetchGebruikerMetAdministraties,
    determineSessionInfo,
    isStandDirty,
  ]);

  useEffect(() => {
    const fetchSaldi = async () => {
      if (actieveAdministratie && gekozenPeriode) {
        const datum =
          gekozenPeriode.periodeEindDatum >
            (actieveAdministratie.vandaag ?? dayjs().format('YYYY-MM-DD'))
            ? (actieveAdministratie.vandaag ?? dayjs().format('YYYY-MM-DD'))
            : gekozenPeriode.periodeEindDatum;
        try {
          const stand = await getStandVooradministratieEnDatum(
            actieveAdministratie,
            datum,
          );
          setStand(stand);
          const betalingen = await getBetalingenVooradministratieVoorPeriode(
            actieveAdministratie,
            gekozenPeriode,
          );
          setBetalingen(betalingen.data.content);
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
    setBetalingen,
    vandaag,
  ]);

  const handleLogin = async () => {
    try {
      if (state.isAuthenticated) await revokeAccessToken();
      await signIn();
      navigate('/profiel');
      setIsMobileOpen(false);
    } catch (error) {
      console.error('Error during sign-in:', error);
      navigate('/login');
    }
  };

  const pages =
    gebruiker && gebruiker.administraties.length > 0
      ? [
        { name: 'Stand', icon: PieChart, path: '/stand' },
        { name: 'Kasboek', icon: Wallet, path: '/kasboek' },
        { name: 'Potjes', icon: CupIcon, path: '/potjes' },
      ]
      : [];

  const heeftAflossing = rekeningGroepen.some(
    (rekeningGroep) => rekeningGroep.rekeningGroepSoort === 'AFLOSSING',
  );
  if (heeftAflossing)
    pages.push({ name: 'Aflossen', icon: TrendingDown, path: '/aflossen' });

  const heeftSparen = rekeningGroepen.some(
    (rekeningGroep) => rekeningGroep.rekeningGroepSoort === 'SPAARPOT',
  );
  if (heeftSparen)
    pages.push({ name: 'Sparen', icon: PiggyBank, path: '/sparen' });

  const sidebarContent = (
    <TooltipProvider>
      <div
        className={cn(
          'relative flex h-full flex-col bg-background border-r transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo/Header */}
        <div className="flex h-14 items-center justify-between px-4">
          {!isCollapsed && (
            <span className="text-xl text-foreground font-medium px-2 pt-4">
              PlusMin
            </span>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <span className="text-lg text-center font-bold">P</span>
            </div>
          )}
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden -mr-2"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 mt-4">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant={pathname === '/' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 text-foreground hover:text-foreground',
                  isCollapsed && 'justify-center',
                )}
                onClick={() => handleNavigation('/')}
              >
                <Home className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm text-foreground">Home</span>
                )}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Home</TooltipContent>}
          </Tooltip>

          {state.isAuthenticated &&
            pages.map((page) => {
              const Icon = page.icon;
              const isActive =
                pathname === page.path || pathname.startsWith(page.path + '/');

              return (
                <Tooltip key={page.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3 text-foreground hover:text-foreground',
                        isCollapsed && 'justify-center',
                      )}
                      onClick={() => handleNavigation(page.path)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm text-foreground">
                          {t(`${I18N_KEY}.${page.name.toLowerCase()}`)}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {t(`${I18N_KEY}.${page.name.toLowerCase()}`)}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Session Info & NaarMorgen */}
          {state.isAuthenticated && !isCollapsed && (
            <div className="mt-4 space-y-2 mb-8 ">
              {(actieveAdministratie?.vandaag || expiry) && (
                <div className="rounded-lg bg-accent/50 p-3 space-y-2">
                  {actieveAdministratie?.vandaag && (
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                      <div className="text-xs text-muted-foreground leading-tight">
                        <strong className="text-foreground">Spelmodus:</strong>{' '}
                        het is {actieveAdministratie?.vandaag}
                      </div>
                    </div>
                  )}
                  {expiry && (
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                      <p className="text-xs text-muted-foreground leading-tight">
                        De huidige sessie eindigt om{' '}
                        {expiry.getHours().toString().padStart(2, '0')}:
                        {expiry.getMinutes().toString().padStart(2, '0')}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <NaarMorgen />
            </div>
          )}

          {/* Administraties */}
          {state.isAuthenticated && administraties.length > 0 && (
            <div className="mt-2 space-y-1 mb-8">
              <Separator className="my-2" />
              {!isCollapsed && (
                <p className="px-3 py-2 text-xs d text-muted-foreground uppercase tracking-wider">
                  Administraties
                </p>
              )}
              {administraties
                .sort((a, b) => a.naam.localeCompare(b.naam))
                .map((administratie) => {
                  const isActive =
                    administratie.id === actieveAdministratie?.id;

                  return (
                    <Tooltip key={administratie.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className={cn(
                            'w-full justify-start gap-2 text-foreground hover:text-foreground',
                            isCollapsed && 'justify-center',
                          )}
                          onClick={() =>
                            handleActieveAdministratieChange(administratie.id)
                          }
                        >
                          {isActive && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                          {!isActive && !isCollapsed && (
                            <div className="h-2 w-2 shrink-0" />
                          )}
                          {!isCollapsed && (
                            <span
                              className={cn(
                                'truncate',
                                isActive && 'font-medium',
                              )}
                            >
                              {administratie.naam}
                            </span>
                          )}
                          {isCollapsed && (
                            <span className="text-xs font-medium">
                              {administratie.naam.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          {administratie.naam}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer - Language & Login */}
        <div className="border-t p-2 space-y-4">
          {state.isAuthenticated ? (
            <div
              className={cn(
                'flex items-center justify-center mb-4 gap-2',
                isCollapsed && 'items-center',
              )}
            >
              <TaalKeuzes />
            </div>
          ) : (
            <Button onClick={handleLogin} className="w-full" size="sm">
              {!isCollapsed ? 'Inloggen' : 'In'}
            </Button>
          )}
        </div>
      </div>

      <StyledSnackbar
        message={snackbarMessage.message}
        type={snackbarMessage.type}
        onClose={() =>
          setSnackbarMessage({ message: undefined, type: undefined })
        }
      />
    </TooltipProvider>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
