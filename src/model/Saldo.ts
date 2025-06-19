import { Periode } from "./Periode";

export type Stand = {
    periodeStartDatum: string,
    peilDatum: string,
    datumLaatsteBetaling: string | undefined,
    resultaatOpDatum: SaldoDTO[],
    geaggregeerdResultaatOpDatum: SaldoDTO[],
    resultaatSamenvattingOpDatum: ResultaatSamenvattingOpDatumDTO
}

export type SaldoDTO = {
    id: number;
    rekeningGroepNaam: string;
    rekeningGroepSoort: string;
    budgetType: string;
    rekeningNaam: string;
    sortOrder: number;
    openingsSaldo: number;
    achterstand: number;
    achterstandNu: number;
    budgetMaandBedrag: number;
    budgetBetaling: number;
    periode: Periode;
    budgetPeildDatum: string;
    budgetOpPeilDatum: number;
    betaaldBinnenBudget: number;
    minderDanBudget: number;
    meerDanBudget: number;
    meerDanMaandBudget: number;
    restMaandBudget: number;
    bedrag: number;
}

export type ResultaatSamenvattingOpDatumDTO = {
  percentagePeriodeVoorbij: number
  budgetMaandInkomstenBedrag: number
  besteedTotPeilDatum: number
  nogNodigNaPeilDatum: number
  actueleBuffer: number
}