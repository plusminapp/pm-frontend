import { AflossingDTO } from './Aflossing';
import { Periode } from './Periode';
import { RekeningGroepPerBetalingsSoort } from './RekeningGroep';

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
  betaalMethoden: string[] | undefined;
  budgetMaandBedrag: number | undefined;
  peilDatum: string | undefined;
  betaling: number | undefined;
  budgetOpPeilDatum?: number | undefined;
  betaaldBinnenBudget: number | undefined;
  meerDanBudget: number | undefined;
  minderDanBudget: number | undefined;
  meerDanMaandBudget: number | undefined;
  restMaandBudget: number | undefined;
  aflossing: AflossingDTO | undefined;
};

export const getEersteBetaalMethode = (
  rekeningGroepPerBetalingsSoort: RekeningGroepPerBetalingsSoort[],
  rekeningNaam: string
): string | undefined => {
  const rekening = rekeningGroepPerBetalingsSoort
    .flatMap((rgpbs) => rgpbs.rekeningGroepen)
    .flatMap((rg) => rg.rekeningen)
    .find((r) => r.naam === rekeningNaam);
  
  return rekening?.betaalMethoden?.[0];
};
