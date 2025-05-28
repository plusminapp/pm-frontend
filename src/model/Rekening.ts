import { Periode } from "./Periode";

export type RekeningDTO = {
  id: number;
  naam: string;
  nummer: string | undefined;
  sortOrder: number;
  bankNaam: string | undefined;
  budgetPeriodiciteit: string;
  vanPeriode: Periode | undefined;
  totEnMetPeriode: Periode | undefined;
  budgetBedrag: number;
  budgetBetaalDag: number | undefined;
  betaalMethoden: RekeningDTO[] | undefined
  budgetMaandBedrag: number | undefined;
  budgetPeilDatum: string | undefined;
  budgetBetaling: number | undefined;
  budgetOpPeilDatum?: number | undefined;
  betaaldBinnenBudget: number | undefined;
  meerDanBudget: number | undefined;
  minderDanBudget: number | undefined;
  meerDanMaandBudget: number | undefined;
  restMaandBudget: number | undefined;
}  