import { BetalingDTO } from "./Betaling";
import { Budget } from "./Budget";

export type Rekening = {
    id: number;
    naam: string;
    rekeningSoort: RekeningSoort;
    nummer: string | undefined;
    bankNaam: string | undefined;
    sortOrder: number;
    budgetType: BudgetType | undefined;
    budgetten: Budget[];
}

export enum RekeningSoort {
    inkomsten = 'INKOMSTEN',
    rente = 'RENTE',
    uitgaven = 'UITGAVEN',
    betaalrekening = 'BETAALREKENING',
    spaarrekening = 'SPAARREKENING',
    contant = 'CONTANT',
    creditcard = 'CREDITCARD',
    aflossing = 'AFLOSSING',
    reservering = 'RESERVERING'
}
export enum BudgetType {
    continu = 'CONTINU',
    vast = 'VAST',
}

export type RekeningSoortPaar = {
    bron: RekeningSoort[];
    bestemming: RekeningSoort[];
}

export type RekeningPaar = {
    bron: Rekening[];
    bestemming: Rekening[];
}

export const balansRekeningSoorten: RekeningSoort[] = [
    RekeningSoort.betaalrekening,
    RekeningSoort.spaarrekening,
    RekeningSoort.contant,
    RekeningSoort.creditcard,
    RekeningSoort.aflossing,
    RekeningSoort.reservering];

export const resultaatRekeningSoorten = [
    RekeningSoort.inkomsten,
    RekeningSoort.rente,
    RekeningSoort.uitgaven];

export const aflossenRekeningSoorten = [
    RekeningSoort.creditcard,
    RekeningSoort.aflossing];

export const reserverenRekeningSoorten = [
    RekeningSoort.reservering];

export const betaalmethodeRekeningSoorten = [
    RekeningSoort.betaalrekening,
    RekeningSoort.spaarrekening,
    RekeningSoort.contant,
    RekeningSoort.creditcard,
]

export const bankRekeningSoorten = [
    RekeningSoort.betaalrekening,
    RekeningSoort.spaarrekening,
    RekeningSoort.creditcard,
]

export const inkomstenRekeningSoorten = [
    RekeningSoort.inkomsten,
    RekeningSoort.rente,
]

export const uitgavenRekeningSoorten = [
    RekeningSoort.uitgaven,
    RekeningSoort.aflossing,
    RekeningSoort.reservering,
]

export const interneRekeningSoorten = [ 
    RekeningSoort.spaarrekening,
    RekeningSoort.contant,
    RekeningSoort.creditcard,
    RekeningSoort.reservering,
]

export const cashflowRekeningSoorten = [
    RekeningSoort.betaalrekening,
    RekeningSoort.spaarrekening,
    RekeningSoort.contant,
    RekeningSoort.creditcard,
]

export const berekenBedragVoorRekenining = (betaling: BetalingDTO, rekening: Rekening | undefined) => {
    if (rekening === undefined) return betaling.bedrag // filter = 'all'
    const factor = resultaatRekeningSoorten.includes(rekening.rekeningSoort) ? -1 : 1
    if (betaling.bron === rekening.naam) return Number(-betaling.bedrag) * factor
    if (betaling.bestemming === rekening.naam) return Number(betaling.bedrag) * factor
    return 0
  }
  