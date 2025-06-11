import { BetalingDTO, BetalingsSoort } from "./Betaling";
import { RekeningDTO } from "./Rekening";

export type RekeningGroepDTO = {
  id: number;
  naam: string;
  rekeningGroepSoort: RekeningGroepSoort;
  rekeningGroepIcoonNaam: string | undefined;
  sortOrder: number;
  budgetType: BudgetType | undefined;
  rekeningen: RekeningDTO[];
}

export enum RekeningGroepSoort {
  inkomsten = 'INKOMSTEN',
  uitgaven = 'UITGAVEN',
  betaalmethode = 'BETAALMETHODE',
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

export type RekeningGroepPerBetalingsSoort = {
  betalingsSoort: BetalingsSoort;
  rekeningGroepen: RekeningGroepDTO[];
}

export type RekeningGroepSoortPaar = {
  bron: RekeningGroepSoort;
  bestemming: RekeningGroepSoort;
}

export type RekeningGroepPaar = {
  bron: RekeningGroepDTO[];
  bestemming: RekeningGroepDTO[];
}

export const balansRekeningGroepSoorten: RekeningGroepSoort[] = [
  RekeningGroepSoort.betaalrekening,
  RekeningGroepSoort.spaarrekening,
  RekeningGroepSoort.contant,
  RekeningGroepSoort.creditcard,
  RekeningGroepSoort.aflossing,
  RekeningGroepSoort.reservering];

export const resultaatRekeningGroepSoorten = [
  RekeningGroepSoort.inkomsten,
  RekeningGroepSoort.uitgaven];

export const betaalTabelRekeningGroepSoorten = [
  RekeningGroepSoort.inkomsten,
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.aflossing];

export const aflossenRekeningGroepSoorten = [
  RekeningGroepSoort.creditcard,
  RekeningGroepSoort.aflossing];

export const reserverenRekeningGroepSoorten = [
  RekeningGroepSoort.reservering];

export const betaalmethodeRekeningGroepSoorten = [
  RekeningGroepSoort.betaalrekening,
  RekeningGroepSoort.spaarrekening,
  RekeningGroepSoort.contant,
  RekeningGroepSoort.creditcard,
]

export const bankRekeningGroepSoorten = [
  RekeningGroepSoort.betaalrekening,
  RekeningGroepSoort.spaarrekening,
  RekeningGroepSoort.creditcard,
]

export const inkomstenRekeningGroepSoorten = [
  RekeningGroepSoort.inkomsten,
]

export const uitgavenRekeningGroepSoorten = [
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.aflossing,
  RekeningGroepSoort.reservering,
]

export const interneRekeningGroepSoorten = [
  RekeningGroepSoort.spaarrekening,
  RekeningGroepSoort.contant,
  RekeningGroepSoort.creditcard,
  RekeningGroepSoort.reservering,
]

export const cashflowRekeningGroepSoorten = [
  RekeningGroepSoort.betaalrekening,
  RekeningGroepSoort.spaarrekening,
  RekeningGroepSoort.contant,
  RekeningGroepSoort.creditcard,
]

export const berekenBedragVoorRekenining = (betaling: BetalingDTO, rekeningGroep: RekeningGroepDTO | undefined) => {
    if (rekeningGroep === undefined) return betaling.bedrag // filter = 'all'
    const factor = resultaatRekeningGroepSoorten.includes(rekeningGroep.rekeningGroepSoort) ? -1 : 1
    if (rekeningGroep.rekeningen.some(r => r.naam === betaling.bron)) return Number(-betaling.bedrag) * factor
    if (rekeningGroep.rekeningen.some(r => r.naam === betaling.bestemming)) return Number(betaling.bedrag) * factor
    return 0
  }
