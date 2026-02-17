import { BetalingDTO, BetalingsSoort } from './Betaling';
import { RekeningDTO } from './Rekening';

export type RekeningGroepDTO = {
  id: number;
  naam: string;
  rekeningGroepSoort: RekeningGroepSoort;
  rekeningGroepIcoonNaam: string | undefined;
  sortOrder: number;
  budgetType: BudgetType | undefined;
  rekeningen: RekeningDTO[];
};

export enum RekeningGroepSoort {
  inkomsten = 'INKOMSTEN',
  rente = 'RENTE',
  uitgaven = 'UITGAVEN',
  betaalmiddel = 'BETAALMIDDEL',
  aflossing = 'AFLOSSING',
  spaarpot = 'SPAARPOT',
  reserveringBuffer = 'RESERVERING_BUFFER',
}
export enum BudgetType {
  continu = 'CONTINU',
  vast = 'VAST',
  sparen = 'SPAREN',
}

export type RekeningGroepPerBetalingsSoort = {
  betalingsSoort: BetalingsSoort;
  rekeningGroepen: RekeningGroepDTO[];
};

export const balansRekeningGroepSoorten: RekeningGroepSoort[] = [
  RekeningGroepSoort.betaalmiddel,
  RekeningGroepSoort.aflossing,
];

export const resultaatRekeningGroepSoorten = [
  RekeningGroepSoort.inkomsten,
  RekeningGroepSoort.uitgaven,
];

export const betaalTabelRekeningGroepSoorten = [
  RekeningGroepSoort.inkomsten,
  // RekeningGroepSoort.rente,
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.spaarpot,
  RekeningGroepSoort.aflossing,
];

export const profielRekeningGroepSoorten = [
  RekeningGroepSoort.inkomsten,
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.spaarpot,
  RekeningGroepSoort.aflossing,
];

export const aflossenRekeningGroepSoorten = [
  RekeningGroepSoort.aflossing,
];

export const reserverenRekeningGroepSoorten = [
  RekeningGroepSoort.reserveringBuffer,
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.spaarpot,
  RekeningGroepSoort.aflossing,
];
export const potjesRekeningGroepSoorten = [
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.spaarpot,
  RekeningGroepSoort.aflossing,
];

export const reserveRekeningGroepSoorten = [
  RekeningGroepSoort.reserveringBuffer,
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.spaarpot,
  RekeningGroepSoort.aflossing,
];

export const betaalmethodeRekeningGroepSoorten = [
  RekeningGroepSoort.betaalmiddel,
];

export const bankRekeningGroepSoorten = [
  RekeningGroepSoort.betaalmiddel,
];

export const inkomstenRekeningGroepSoorten = [RekeningGroepSoort.inkomsten];

export const uitgavenRekeningGroepSoorten = [
  RekeningGroepSoort.uitgaven,
  RekeningGroepSoort.aflossing,
];

export const interneRekeningGroepSoorten = [
  RekeningGroepSoort.betaalmiddel,
  ];

export const cashflowRekeningGroepSoorten = [
  RekeningGroepSoort.betaalmiddel,
];

export const berekenBedragVoorRekenining = (
  betaling: BetalingDTO,
  rekeningGroep: RekeningGroepDTO | undefined,
) => {
  if (rekeningGroep === undefined) return betaling.bedrag; // filter = 'all'
  const factor = resultaatRekeningGroepSoorten.includes(
    rekeningGroep.rekeningGroepSoort,
  )
    ? -1
    : 1;
  if (rekeningGroep.rekeningen.some((r) => r.naam === betaling.bron))
    return Number(-betaling.bedrag) * factor;
  if (rekeningGroep.rekeningen.some((r) => r.naam === betaling.bestemming))
    return Number(betaling.bedrag) * factor;
  return 0;
};
