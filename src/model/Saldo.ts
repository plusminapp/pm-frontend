import { AflossingDTO } from "./Aflossing";
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
    aflossing: AflossingDTO | undefined;
    sortOrder: number;
    openingsSaldo: number;
    achterstand: number;
    achterstandOpPeilDatum: number;
    budgetMaandBedrag: number;
    budgetBetaalDag: number;
    budgetBetaling: number;
    oorspronkelijkeBudgetBetaling: number;
    periode: Periode;
    budgetPeilDatum: string;
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