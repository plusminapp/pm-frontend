import { Administratie } from './Administratie';

export type Gebruiker = {
  id: number;
  subject: string;
  bijnaam: string;
  roles: string[];
  administraties: Administratie[];
};
