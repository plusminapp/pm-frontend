// import { Gebruiker } from "./Gebruiker";
import dayjs from "dayjs";
import { Rekening, RekeningSoort, RekeningSoortPaar } from "./Rekening";
import { Saldo } from "./Saldo";

export type Betaling = {
  id: number;
  boekingsdatum: dayjs.Dayjs;
  bedrag: number;
  omschrijving: string | undefined;
  betalingsSoort: BetalingsSoort;
  bron: Rekening | undefined;
  bestemming: Rekening | undefined;
  budget: string | undefined;
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
  budgetNaam: string | undefined;
}

export type BetalingvalidatieWrapper = {
  laatsteBetalingDatum?: string,
  saldoOpLaatsteBetalingDatum?: Saldo,
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
  rente = 'RENTE',
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

export const betalingsSoorten2RekeningenSoorten = new Map<BetalingsSoort, RekeningSoortPaar>([
  // Inkomsten
  [BetalingsSoort.inkomsten, { bron: [RekeningSoort.inkomsten], bestemming: [RekeningSoort.betaalrekening, RekeningSoort.contant] }],
  [BetalingsSoort.rente, { bron: [RekeningSoort.rente], bestemming: [RekeningSoort.spaarrekening] }],
  // Uitgaven
  [BetalingsSoort.uitgaven, { bron: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], bestemming: [RekeningSoort.uitgaven] }],
  [BetalingsSoort.aflossen, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.aflossing] }],
  [BetalingsSoort.besteden_reservering, { bron: [RekeningSoort.betaalrekening, RekeningSoort.contant, RekeningSoort.creditcard], bestemming: [RekeningSoort.reservering] }],
  // Intern
  [BetalingsSoort.incasso_creditcard, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.creditcard] }],
  [BetalingsSoort.opnemen_spaarrekening, { bron: [RekeningSoort.spaarrekening], bestemming: [RekeningSoort.betaalrekening] }],
  [BetalingsSoort.storten_spaarrekening, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.spaarrekening] }],
  [BetalingsSoort.opnemen_contant, { bron: [RekeningSoort.betaalrekening], bestemming: [RekeningSoort.contant] }],
  [BetalingsSoort.storten_contant, { bron: [RekeningSoort.contant], bestemming: [RekeningSoort.betaalrekening] }],
]);

export const inkomstenBetalingsSoorten = [BetalingsSoort.inkomsten, BetalingsSoort.rente]
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
