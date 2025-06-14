import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { RekeningGroepPerBetalingsSoort } from '../model/RekeningGroep';
import { Periode } from '../model/Periode';
import { SnackbarMessage } from '../components/StyledSnackbar';

interface CustomContextType {
  gebruiker: Gebruiker | undefined;
  setGebruiker: (gebruiker: Gebruiker | undefined) => void;
  actieveHulpvrager: Gebruiker | undefined;
  setActieveHulpvrager: (actieveHulpvrager: Gebruiker | undefined) => void;
  hulpvragers: Array<Gebruiker>;
  setHulpvragers: (hulpvragers: Array<Gebruiker>) => void;
  periodes: Array<Periode>;
  setPeriodes: (periodes: Array<Periode>) => void;
  gekozenPeriode: Periode | undefined;
  setGekozenPeriode: (gekozenPeriode: Periode | undefined) => void;
  rekeningGroepPerBetalingsSoort: Array<RekeningGroepPerBetalingsSoort>;
  setRekeningGroepPerBetalingsSoort: (rekeningGroepPerBetalingsSoort: Array<RekeningGroepPerBetalingsSoort>) => void;
  snackbarMessage: SnackbarMessage;
  setSnackbarMessage: (snackbarMessage: SnackbarMessage) => void;
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
  const [actieveHulpvrager, setActieveHulpvrager] = useState<Gebruiker | undefined>(undefined);
  const [hulpvragers, setHulpvragers] = useState<Array<Gebruiker>>([]);
  const [periodes, setPeriodes] = useState<Array<Periode>>([]);
  const [gekozenPeriode, setGekozenPeriode] = useState<Periode | undefined>(undefined);
  const [rekeningGroepPerBetalingsSoort, setRekeningGroepPerBetalingsSoort] = useState<Array<RekeningGroepPerBetalingsSoort>>([]);
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });

  useEffect(() => {
    if (!actieveHulpvrager) return;
    setActieveHulpvrager(actieveHulpvrager);
    setPeriodes(actieveHulpvrager.periodes)
    localStorage.setItem('actieveHulpvrager', actieveHulpvrager.id + '');
  }, [actieveHulpvrager]);

  return (
    <CustomContext.Provider value={{
      gebruiker, setGebruiker,
      actieveHulpvrager, setActieveHulpvrager,
      hulpvragers, setHulpvragers,
      periodes, setPeriodes,
      gekozenPeriode, setGekozenPeriode,
      rekeningGroepPerBetalingsSoort, setRekeningGroepPerBetalingsSoort,
      snackbarMessage, setSnackbarMessage
    }}>
      {children}
      {/* {JSON.stringify(actieveHulpvrager)} */}
    </CustomContext.Provider>
  );
};
