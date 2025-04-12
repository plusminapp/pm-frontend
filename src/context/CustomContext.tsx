import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Gebruiker } from '../model/Gebruiker';
import { betaalmethodeRekeningSoorten, Rekening, RekeningPaar } from '../model/Rekening';
import { BetalingsSoort } from '../model/Betaling';
import { Periode } from '../model/Periode';
import { SnackbarMessage } from '../components/StyledSnackbar';
import { saveToLocalStorage, transformRekeningenToBetalingsSoorten } from '../components/Header/HeaderExports.ts';

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
    rekeningen: Array<Rekening>;
    setRekeningen: (rekeningen: Array<Rekening>) => void;
    betalingsSoorten: Array<BetalingsSoort>;
    setBetalingsSoorten: (betalingsSoorten: Array<BetalingsSoort>) => void;
    betaalMethoden: Array<Rekening>;
    setBetaalMethoden: (betaalMethoden: Array<Rekening>) => void;
    betalingsSoorten2Rekeningen: Map<BetalingsSoort, RekeningPaar>;
    setBetalingsSoorten2Rekeningen: (betalingsSoorten2Rekeningen: Map<BetalingsSoort, RekeningPaar>) => void;
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
    const [rekeningen, setRekeningen] = useState<Array<Rekening>>([]);
    const [betalingsSoorten, setBetalingsSoorten] = useState<Array<BetalingsSoort>>([]);
    const [betaalMethoden, setBetaalMethoden] = useState<Array<Rekening>>([]);
    const [betalingsSoorten2Rekeningen, setBetalingsSoorten2Rekeningen] = useState<Map<BetalingsSoort, RekeningPaar>>(new Map())
    const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage>({ message: undefined, type: undefined });

    useEffect(() => {
        if (!actieveHulpvrager) return;
        setActieveHulpvrager(actieveHulpvrager);
        saveToLocalStorage('actieveHulpvrager', actieveHulpvrager.id + '');
        setRekeningen(actieveHulpvrager.rekeningen.sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1));
        setBetalingsSoorten(transformRekeningen2BetalingsSoorten(actieveHulpvrager.rekeningen));
        setBetaalMethoden(transformRekeningen2Betaalmethoden(actieveHulpvrager.rekeningen));
        setBetalingsSoorten2Rekeningen(transformRekeningenToBetalingsSoorten(actieveHulpvrager.rekeningen));
        setPeriodes(actieveHulpvrager.periodes);
        if (gekozenPeriode && !actieveHulpvrager.periodes.includes(gekozenPeriode)) {
            const huidigePeriode = actieveHulpvrager.periodes.find(periode => periode.periodeStatus === 'HUIDIG');
            setGekozenPeriode(huidigePeriode);
            saveToLocalStorage('gekozenPeriode', huidigePeriode?.id + '');
        }
    }, [actieveHulpvrager, gekozenPeriode]);

    const transformRekeningen2BetalingsSoorten = (rekeningen: Rekening[]) => {
        const betalingsSoortValues = Object.values(BetalingsSoort);
        const rekeningSoortValues = rekeningen.map((rekening: Rekening) => rekening.rekeningSoort.toLowerCase())
        const filteredBetalingsSoorten = rekeningSoortValues.flatMap((rekeningSoort) =>
            betalingsSoortValues.filter((betalingsSoort) =>
                betalingsSoort.toLowerCase().includes(rekeningSoort.toLowerCase())
            )
        );
        return filteredBetalingsSoorten.filter((value, index, self) => self.indexOf(value) === index); //deduplication ...
    }

    const transformRekeningen2Betaalmethoden = (rekeningen: Rekening[]) => {
        return rekeningen.filter((rekening) =>
            betaalmethodeRekeningSoorten.includes(rekening.rekeningSoort)
        )
    }

    return (
        <CustomContext.Provider value={{
            gebruiker, setGebruiker,
            actieveHulpvrager, setActieveHulpvrager,
            hulpvragers, setHulpvragers,
            periodes, setPeriodes,
            gekozenPeriode, setGekozenPeriode,
            rekeningen, setRekeningen,
            betalingsSoorten, setBetalingsSoorten,
            betaalMethoden, setBetaalMethoden,
            betalingsSoorten2Rekeningen, setBetalingsSoorten2Rekeningen,
            snackbarMessage, setSnackbarMessage
        }}>
            {children}
        </CustomContext.Provider>
    );
};
