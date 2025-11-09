import { Administratie } from './Administratie';

export type Gebruiker = {
  id: number;
  subject: string;
  email: string;
  bijnaam: string;
  roles: string[];
  administraties: Administratie[];
};
