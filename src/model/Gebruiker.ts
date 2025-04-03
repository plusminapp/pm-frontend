import { AflossingSamenvattingDTO } from "./Aflossing";
import { Periode } from "./Periode";
import { Rekening } from "./Rekening";

export type Gebruiker = {
    id: number;
    email: string;
    bijnaam: string;
    periodeDag: number;
    roles: string[];
    vrijwilligerEmail: string | undefined;
    vrijwilligerBijnaam: string | undefined;
    rekeningen: Rekening[];
    periodes: Periode[];
    aflossingen: AflossingSamenvattingDTO[];
}