import { AflossingSamenvattingDTO } from "./Aflossing";
import { Periode } from "./Periode";

export type Gebruiker = {
    id: number;
    email: string;
    bijnaam: string;
    periodeDag: number;
    roles: string[];
    vrijwilligerEmail: string | undefined;
    vrijwilligerBijnaam: string | undefined;
    // rekeningen: RekeningGroep[];
    periodes: Periode[];
    aflossingen: AflossingSamenvattingDTO[];
}