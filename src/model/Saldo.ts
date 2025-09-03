import { AflossingDTO } from "./Aflossing";
import { Periode } from "./Periode";
import { SpaartegoedDTO } from "./Spaartegoed";

export type Stand = {
    periodeStartDatum: string,
    peilDatum: string,
    datumLaatsteBetaling: string | undefined,
    budgetHorizon: string,
    resultaatOpDatum: SaldoDTO[],
    geaggregeerdResultaatOpDatum: SaldoDTO[],
    resultaatSamenvattingOpDatum: ResultaatSamenvattingOpDatumDTO
}

export type SaldoDTO = {
    id: number;
    rekeningGroepNaam: string;
    rekeningGroepSoort: string;
    budgetType: string | undefined;
    rekeningNaam: string;
    aflossing: AflossingDTO | undefined;
    spaartegoed: SpaartegoedDTO | undefined;
    sortOrder: number;
    openingsBalansSaldo: number;
    openingsReserveSaldo: number;
    achterstand: number;
    achterstandOpPeilDatum: number;
    budgetMaandBedrag: number;
    budgetBetaalDag: number;
    betaling: number;
    reservering: number;
    oorspronkelijkeBetaling: number;
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
  openingsReservePotjesVoorNuSaldo: number
  budgetMaandInkomstenBedrag: number
  besteedTotPeilDatum: number
  gespaardTotPeilDatum: number
  nogNodigNaPeilDatum: number
  actueleBuffer: number
  extraGespaardTotPeilDatum: number
}