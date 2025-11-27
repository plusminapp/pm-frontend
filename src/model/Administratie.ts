import { BetalingDTO } from './Betaling';
import { Gebruiker } from './Gebruiker';
import { Periode } from './Periode';
import { RekeningDTO } from './Rekening';

export type Administratie = {
  id: number;
  naam: string;
  periodeDag: number;
  vandaag: string | null;
  eigenaarNaam: string;
  eigenaarSubject: string;
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