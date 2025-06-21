import dayjs from "dayjs";
import { SaldoDTO } from "./Saldo";

export type Periode = {
    id: number;
    periodeStartDatum: string;
    periodeEindDatum: string;
    periodeStatus: string;
    saldoLijst: SaldoDTO[];
}

export const dagInPeriode = (dag: number, gekozenPeriode: Periode) => {
    const startDatum = dayjs(gekozenPeriode.periodeStartDatum);
    const dagVanStart = startDatum.date();

    if (dag < dagVanStart) {
        return startDatum.add(1, 'month').set('date', dag)
    } else {
        return startDatum.set('date', dag);
    }   
}

export const isPeriodeOpen = (gekozenPeriode: Periode) => gekozenPeriode?.periodeStatus === 'OPEN' || gekozenPeriode?.periodeStatus === 'HUIDIG';

export const eersteOpenPeriode = (periodes: Periode[]): Periode | undefined => {
    const openPeriodes = periodes
        .filter(p => p.periodeStatus === 'OPEN')
        .sort((a, b) => dayjs(a.periodeStartDatum).diff(dayjs(b.periodeStartDatum)));

    return openPeriodes.length > 0 ? openPeriodes[0] : undefined;
}

export const laatsteGeslotenPeriode = (periodes: Periode[]): Periode | undefined => {
    const geslotenPeriodes = periodes
        .filter(p => p.periodeStatus === 'GESLOTEN'|| p.periodeStatus === 'OPGERUIMD')
        .sort((a, b) => dayjs(b.periodeStartDatum).diff(dayjs(a.periodeStartDatum)));

    return geslotenPeriodes.length > 0 ? geslotenPeriodes[0] : undefined;
}

export const formateerNlDatum = (datum: string): string => {
    return new Date(datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
}
export const formateerNlVolgendeDag = (datum: string): string => {
    const date = new Date(datum);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}
