import { AflossingDTO } from "./Aflossing";
import { Periode } from "./Periode";

export type RekeningDTO = {
  id: number;
  naam: string;
  rekeningGroepNaam: string | undefined;
  nummer: string | undefined;
  sortOrder: number;
  saldo: number;
  bankNaam: string | undefined;
  budgetPeriodiciteit: string;
  vanPeriode: Periode | undefined;
  totEnMetPeriode: Periode | undefined;
  budgetBedrag: number;
  budgetVariabiliteit: number | undefined;
  maanden: number[] | undefined;
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
  aflossing: AflossingDTO | undefined;
}  