import { RekeningGroepDTO } from "./RekeningGroep";

export type RekeningDTO = {
    id: number;
    naam: string;
    rekeningGroep: RekeningGroepDTO
    nummer: string | undefined;
    bankNaam: string | undefined;
    rekeningIcoonNaam: string | undefined;
    sortOrder: number;
}  