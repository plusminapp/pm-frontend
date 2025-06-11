// import { Gebruiker } from "./Gebruiker";
import dayjs from "dayjs";
import { RekeningGroepSoort, RekeningGroepSoortPaar } from "./RekeningGroep";
import { SaldoDTO } from "./Saldo";
import { RekeningDTO } from "./Rekening";

export type Betaling = {
  id: number;
  boekingsdatum: dayjs.Dayjs;
  bedrag: number;
  omschrijving: string | undefined;
  betalingsSoort: BetalingsSoort;
  bron: RekeningDTO | undefined;
  bestemming: RekeningDTO | undefined;
}

export type BetalingDTO = {
  id: number;
  boekingsdatum: dayjs.Dayjs;
  bedrag: number;
  omschrijving: string;
  ocrOmschrijving: string;
  betalingsSoort: BetalingsSoort | undefined;
  sortOrder: string;
  bestaatAl: boolean;
  bron: string | undefined;
  bestemming: string | undefined;
}

export type BetalingvalidatieWrapper = {
  laatsteBetalingDatum?: string,
  saldoOpLaatsteBetalingDatum?: SaldoDTO,
  betalingen: BetalingDTO[],
}

export enum BetalingsCategorie {
  inkomsten = 'INKOMSTEN',
  uitgaven = 'UITGAVEN',
  intern = 'INTERN',
}

export enum BetalingsSoort {
  // Inkomsten
  inkomsten = 'INKOMSTEN',
  // Uitgaven
  uitgaven = 'UITGAVEN',
  besteden_reservering = 'BESTEDEN_RESERVERING',
  aflossen = 'AFLOSSEN',
  // Intern
  // lenen = 'LENEN',
  opnemen_spaarrekening = 'OPNEMEN_SPAARREKENING',
  storten_spaarrekening = 'STORTEN_SPAARREKENING',
  opnemen_contant = 'OPNEMEN_CONTANT',
  storten_contant = 'STORTEN_CONTANT',
  incasso_creditcard = 'INCASSO_CREDITCARD',
  // Kost/last
  toevoegen_reservering = 'TOEVOEGEN_RESERVERING',
}

export const bestemmingBetalingsSoorten = [
  BetalingsSoort.inkomsten,
  BetalingsSoort.storten_contant,
  BetalingsSoort.opnemen_spaarrekening,
]

export const aflossenBetalingsSoorten = [
  // BetalingsSoort.lenen,
  BetalingsSoort.aflossen,
]

export const reserverenBetalingsSoorten = [
  BetalingsSoort.toevoegen_reservering,
  BetalingsSoort.besteden_reservering,
]

export const betalingsSoortFormatter = (betalingsSoort: string): string => {
  betalingsSoort = betalingsSoort.split('_').join(' ').toLowerCase();
  return String(betalingsSoort).charAt(0).toUpperCase() + String(betalingsSoort).slice(1);
}

export const currencyFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

export const betalingsSoorten2RekeningGroepSoorten = new Map<BetalingsSoort, RekeningGroepSoortPaar>([
  // Inkomsten
  [BetalingsSoort.inkomsten, { bron: RekeningGroepSoort.inkomsten, bestemming: RekeningGroepSoort.betaalmethode}],
  // Uitgaven
  [BetalingsSoort.uitgaven, { bron: RekeningGroepSoort.betaalmethode, bestemming: RekeningGroepSoort.uitgaven }],
  [BetalingsSoort.aflossen, { bron: RekeningGroepSoort.betaalmethode, bestemming: RekeningGroepSoort.aflossing }],
  [BetalingsSoort.besteden_reservering, { bron: RekeningGroepSoort.betaalmethode, bestemming: RekeningGroepSoort.reservering }],
  // Intern
  [BetalingsSoort.incasso_creditcard, { bron: RekeningGroepSoort.betaalrekening, bestemming: RekeningGroepSoort.creditcard }],
  [BetalingsSoort.opnemen_spaarrekening, { bron: RekeningGroepSoort.spaarrekening, bestemming: RekeningGroepSoort.betaalrekening }],
  [BetalingsSoort.storten_spaarrekening, { bron: RekeningGroepSoort.betaalrekening, bestemming: RekeningGroepSoort.spaarrekening }],
  [BetalingsSoort.opnemen_contant, { bron: RekeningGroepSoort.betaalrekening, bestemming: RekeningGroepSoort.contant }],
  [BetalingsSoort.storten_contant, { bron: RekeningGroepSoort.contant, bestemming: RekeningGroepSoort.betaalrekening }],
]
);

export const inkomstenBetalingsSoorten = [BetalingsSoort.inkomsten]
export const uitgavenBetalingsSoorten = [BetalingsSoort.uitgaven, BetalingsSoort.aflossen, BetalingsSoort.besteden_reservering]
export const internBetalingsSoorten = [BetalingsSoort.incasso_creditcard, BetalingsSoort.opnemen_spaarrekening, BetalingsSoort.storten_spaarrekening, BetalingsSoort.opnemen_contant, BetalingsSoort.storten_contant]

export const betalingsSoort2Categorie = (betalingsSoort: BetalingsSoort | undefined): BetalingsCategorie | undefined => {
  if (!betalingsSoort) return undefined;
  if (inkomstenBetalingsSoorten.includes(betalingsSoort)) return BetalingsCategorie.inkomsten;
  if (uitgavenBetalingsSoorten.includes(betalingsSoort)) return BetalingsCategorie.uitgaven;
  if (internBetalingsSoorten.includes(betalingsSoort)) return BetalingsCategorie.intern;
  return undefined;
};

export const betalingsCategorie2Soort = (betalingsCategorie: BetalingsCategorie | undefined): BetalingsSoort[] | undefined => {
  if (betalingsCategorie === BetalingsCategorie.inkomsten) return inkomstenBetalingsSoorten
  if (betalingsCategorie === BetalingsCategorie.uitgaven) return uitgavenBetalingsSoorten
  if (betalingsCategorie === BetalingsCategorie.intern) return internBetalingsSoorten
  return undefined
}
