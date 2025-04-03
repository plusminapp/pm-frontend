import dayjs from "dayjs"
import { Rekening } from "./Rekening"
import { isDagNaVandaagInPeriode, Periode } from "./Periode"

export type AflossingDTO = {
    rekening: Rekening,
    startDatum: dayjs.Dayjs,
    eindDatum: dayjs.Dayjs | undefined,
    eindBedrag: number,
    aflossingsBedrag: number,
    betaalDag: number,
    dossierNummer: string,
    notities: string,
    aflossingPeilDatum?: string | undefined,
    aflossingBetaling?: number | undefined,
    deltaStartPeriode?: number | undefined,
    saldoStartPeriode?: number | undefined,
}

export type ExtendedAflossingDTO = AflossingDTO & {
    aflossingMoetBetaaldZijn: boolean;
    actueleStand: number;
    actueleAchterstand: number;
    betaaldBinnenAflossing: number
    meerDanVerwacht: number;
    minderDanVerwacht: number;
    meerDanMaandAflossing: number;
}

export type AflossingSamenvattingDTO = {
    aflossingNaam: string,
    aflossingsBedrag: number,
    betaalDag: number,
}

export const berekenAflossingTotaal = (aflossingen: AflossingDTO[]): number => {
    return aflossingen.reduce((acc, aflossing) => acc + aflossing.aflossingsBedrag, 0)
}

export const berekenAflossingsBedrag = (aflossing: AflossingSamenvattingDTO, gekozenPeriode: Periode): number => {
    if (isDagNaVandaagInPeriode(aflossing.betaalDag, gekozenPeriode)) {
        return 0;
    } else {
        return aflossing.aflossingsBedrag;
    }
};

export const berekenMaandAflossingenBedrag = (aflossingen: AflossingSamenvattingDTO[]) => aflossingen.
    reduce((acc: number, aflossing: AflossingSamenvattingDTO) => acc + aflossing.aflossingsBedrag, 0) ?? 0;

export const berekenAflossingenBedrag = (aflossingen: AflossingSamenvattingDTO[], gekozenPeriode: Periode | undefined) => {
    if (gekozenPeriode === undefined) {
        return 0;
    } else {
        return aflossingen.reduce((acc: number, aflossing: AflossingSamenvattingDTO) => acc + berekenAflossingsBedrag(aflossing, gekozenPeriode), 0) ?? 0;
    }
}