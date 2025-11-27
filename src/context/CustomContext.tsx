import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { Periode } from '../model/Periode';
import { SnackbarMessage } from '../components/StyledSnackbar';
import { Stand } from '../model/Saldo';
import { Administratie } from '../model/Administratie';
import dayjs from 'dayjs';

interface CustomContextType {
  gebruiker: Gebruiker | undefined;
  setGebruiker: (gebruiker: Gebruiker | undefined) => void;
  actieveAdministratie: Administratie | undefined;
  setActieveAdministratie: (
    actieveAdministratie: Administratie | undefined,
  ) => void;
  administraties: Array<Administratie>;
  setAdministraties: (administraties: Array<Administratie>) => void;
  periodes: Array<Periode>;
  setPeriodes: (periodes: Array<Periode>) => void;
  gekozenPeriode: Periode | undefined;
  setGekozenPeriode: (gekozenPeriode: Periode | undefined) => void;
  stand: Stand | undefined;
  setStand: (stand: Stand | undefined) => void;
  isStandDirty: boolean;
  setIsStandDirty: (isStandDiry: boolean) => void;
  rekeningGroepPerBetalingsSoort: Array<RekeningGroepPerBetalingsSoort>;
  setRekeningGroepPerBetalingsSoort: (
    rekeningGroepPerBetalingsSoort: Array<RekeningGroepPerBetalingsSoort>,
  ) => void;
  snackbarMessage: SnackbarMessage;
  setSnackbarMessage: (snackbarMessage: SnackbarMessage) => void;
  vandaag: string | null;
  setVandaag: (vandaag: string | null) => void;
}

const CustomContext = createContext<CustomContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomContext = (): CustomContextType => {
  const context = useContext(CustomContext);
  if (!context) {
    throw new Error('useCustomContext must be used within a CustomProvider');
  }
  return context;
};

interface CustomProviderProps {
  children: ReactNode;
}

export const CustomProvider: React.FC<CustomProviderProps> = ({ children }) => {
  const [gebruiker, setGebruiker] = useState<Gebruiker | undefined>(undefined);
  const [actieveAdministratie, setActieveAdministratie] = useState<
    Administratie | undefined
  >(undefined);
  const [administraties, setAdministraties] = useState<Array<Administratie>>(
    [],
  );
  const [periodes, setPeriodes] = useState<Array<Periode>>([]);
  const [gekozenPeriode, setGekozenPeriode] = useState<Periode | undefined>(
    undefined,
  );
  const [stand, setStand] = useState<Stand | undefined>(undefined);
  const [isStandDirty, setIsStandDirty] = useState<boolean>(false);
  const [rekeningGroepPerBetalingsSoort, setRekeningGroepPerBetalingsSoort] =
    useState<Array<RekeningGroepPerBetalingsSoort>>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>({
    message: undefined,
    type: undefined,
  });
  const [vandaag, setVandaag] = useState<string | null>(null);

  useEffect(() => {
    if (!actieveAdministratie) return;
    setActieveAdministratie(actieveAdministratie);
    const currentDate = actieveAdministratie.vandaag || dayjs().format('YYYY-MM-DD');
    setVandaag(currentDate);
    setPeriodes(actieveAdministratie.periodes);
    localStorage.setItem('actieveAdministratie', actieveAdministratie.id + '');
  }, [actieveAdministratie]);

  return (
    <CustomContext.Provider
      value={{
        gebruiker,
        setGebruiker,
        actieveAdministratie,
        setActieveAdministratie,
        administraties,
        setAdministraties,
        periodes,
        setPeriodes,
        gekozenPeriode,
        setGekozenPeriode,
        stand,
        setStand,
        isStandDirty,
        setIsStandDirty,
        rekeningGroepPerBetalingsSoort,
        setRekeningGroepPerBetalingsSoort,
        snackbarMessage,
        setSnackbarMessage,
        vandaag,
        setVandaag,
      }}
    >
      {children}
      {/* {JSON.stringify(actieveAdministratie)} */}
    </CustomContext.Provider>
  );
};
