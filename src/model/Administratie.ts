import { Periode } from './Periode';

export type Administratie = {
  id: number;
  naam: string;
  periodeDag: number;
  eigenaarNaam: string;
  eigenaarSubject: string;
  periodes: Periode[];
};
