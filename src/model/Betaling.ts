import { SaldoDTO } from './Saldo';
import { RekeningDTO } from './Rekening';

export type Betaling = {
  id: number;
  boekingsdatum: string;
  bedrag: number;
  omschrijving: string | undefined;
  betalingsSoort: BetalingsSoort;
  bron: RekeningDTO | undefined;
  bestemming: RekeningDTO | undefined;
};

export type BetalingDTO = {
  id: number;
  boekingsdatum: string;
  bedrag: number;
  omschrijving: string;
  ocrOmschrijving: string;
  betalingsSoort: BetalingsSoort | undefined;
  sortOrder: string;
  bestaatAl: boolean;
  bron: string | undefined;
  bestemming: string | undefined;
};

export type BetalingvalidatieWrapper = {
  laatsteBetalingDatum?: string;
  saldoOpLaatsteBetalingDatum?: SaldoDTO;
  betalingen: BetalingDTO[];
};

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
  aflossen = 'AFLOSSEN',
  besteden = 'BESTEDEN',
  // Intern
  intern = 'INTERN',
  //Reserveren
  reserveren = 'RESERVEREN',
}

export const bestemmingBetalingsSoorten = [
  BetalingsSoort.inkomsten,
  BetalingsSoort.intern,
];

export const ontdubbelBetalingsSoorten = [
  BetalingsSoort.inkomsten,
  BetalingsSoort.uitgaven,
  BetalingsSoort.aflossen,
];

export const aflossenBetalingsSoorten = [
  // BetalingsSoort.lenen,
  BetalingsSoort.aflossen,
];

export const betalingsSoortFormatter = (betalingsSoort: string): string => {
  betalingsSoort = betalingsSoort.split('_').join(' ').toLowerCase();
  return (
    String(betalingsSoort).charAt(0).toUpperCase() +
    String(betalingsSoort).slice(1)
  );
};

export const currencyFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
});

export const inkomstenBetalingsSoorten = [
  BetalingsSoort.inkomsten,
];
export const uitgavenBetalingsSoorten = [
  BetalingsSoort.uitgaven,
  BetalingsSoort.aflossen,
  BetalingsSoort.besteden,
];
export const internBetalingsSoorten = [
  BetalingsSoort.intern,
];

export const betalingsSoort2Categorie = (
  betalingsSoort: BetalingsSoort | undefined,
): BetalingsCategorie | undefined => {
  if (!betalingsSoort) return undefined;
  if (inkomstenBetalingsSoorten.includes(betalingsSoort))
    return BetalingsCategorie.inkomsten;
  if (uitgavenBetalingsSoorten.includes(betalingsSoort))
    return BetalingsCategorie.uitgaven;
  if (internBetalingsSoorten.includes(betalingsSoort))
    return BetalingsCategorie.intern;
  return undefined;
};

export const betalingsCategorie2Soort = (
  betalingsCategorie: BetalingsCategorie | undefined,
): BetalingsSoort[] | undefined => {
  if (betalingsCategorie === BetalingsCategorie.inkomsten)
    return inkomstenBetalingsSoorten;
  if (betalingsCategorie === BetalingsCategorie.uitgaven)
    return uitgavenBetalingsSoorten;
  if (betalingsCategorie === BetalingsCategorie.intern)
    return internBetalingsSoorten;
  return undefined;
};
