import { BetalingDTO } from './Betaling';
import { Gebruiker } from './Gebruiker';
import { Periode } from './Periode';
import { Persona } from './Persona';
import { RekeningDTO } from './Rekening';

export type Administratie = {
  id: number;
  naam: string;
  periodeDag: number;
  vandaag: string | null;
  eigenaarNaam: string;
  eigenaarSubject: string;
  persona: Persona | null;
  isInDemoModus: boolean;
  periodes: Periode[];
  gebruikers: Gebruiker[];
};

export type AdministratieWrapper = {
  administratie: Administratie;
  rekeningen: RekeningDTO[];
  betalingen: BetalingDTO[];
  overschrijfBestaande: boolean;
};