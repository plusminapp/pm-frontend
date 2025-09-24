import { Periode } from './Periode';

export type Gebruiker = {
  id: number;
  email: string;
  bijnaam: string;
  periodeDag: number;
  roles: string[];
  vrijwilligerEmail: string | undefined;
  vrijwilligerBijnaam: string | undefined;
  periodes: Periode[];
};
