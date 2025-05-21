import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { RekeningGroepDTO } from '../model/RekeningGroep';
import { BetalingsSoort } from '../model/Betaling';
import { Periode } from '../model/Periode';
import { SnackbarMessage } from '../components/StyledSnackbar';
import { saveToLocalStorage } from '../components/Header/HeaderExports';
import { RekeningGroepPaar } from '../model/RekeningGroep';

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
    rekeningen: Array<RekeningGroepDTO>;
    setRekeningen: (rekeningen: Array<RekeningGroepDTO>) => void;
    betalingsSoorten: Array<BetalingsSoort>;
    setBetalingsSoorten: (betalingsSoorten: Array<BetalingsSoort>) => void;
    betalingsSoorten2RekeningGroepen: Map<BetalingsSoort, RekeningGroepPaar>;
    setBetalingsSoorten2Rekeningen: (betalingsSoorten2RekeningGroepen: Map<BetalingsSoort, RekeningGroepPaar>) => void;
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
    const [rekeningen, setRekeningen] = useState<Array<RekeningGroepDTO>>([]);
    const [betalingsSoorten, setBetalingsSoorten] = useState<Array<BetalingsSoort>>([]);
    const [betalingsSoorten2Rekeningen, setBetalingsSoorten2Rekeningen] = useState<Map<BetalingsSoort, RekeningGroepPaar>>(new Map())
    const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });

    useEffect(() => {
        if (!actieveHulpvrager) return;
        setActieveHulpvrager(actieveHulpvrager);
        setPeriodes(actieveHulpvrager.periodes)
        saveToLocalStorage('actieveHulpvrager', actieveHulpvrager.id + '');
    }, [actieveHulpvrager]);

    return (
        <CustomContext.Provider value={{
            gebruiker, setGebruiker,
            actieveHulpvrager, setActieveHulpvrager,
            hulpvragers, setHulpvragers,
            periodes, setPeriodes,
            gekozenPeriode, setGekozenPeriode,
            rekeningen, setRekeningen,
            betalingsSoorten, setBetalingsSoorten,
            betalingsSoorten2RekeningGroepen: betalingsSoorten2Rekeningen, setBetalingsSoorten2Rekeningen,
            snackbarMessage, setSnackbarMessage
        }}>
            {children}
        </CustomContext.Provider>
    );
};
