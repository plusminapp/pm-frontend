import dayjs from "dayjs";
import { RekeningGroepDTO } from "./RekeningGroep";
import { Periode } from "./Periode";

export type Budget = {
  RekeningGroep: RekeningGroepDTO | undefined;
  budgetNaam: string;
  budgetPeriodiciteit: string;
  bedrag: number;
  betaalDag: number | undefined;
  vanPeriode: Periode | undefined;
  totEnMetPeriode: Periode | undefined;
}
export type BudgetDTO = {
  rekeningNaam: string;
  rekeningGroepSoort: string;
  budgetNaam: string;
  budgetType: string;
  budgetPeriodiciteit: string;
  bedrag: number;
  betaalDag: number | undefined;
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
export type BudgetSamenvatting = {
  percentagePeriodeVoorbij: number
  budgetMaandInkomstenBedrag: number
  besteedTotPeilDatum: number
  nogNodigNaPeilDatum: number
  actueleBuffer: number
}
export const berekenPeriodeBudgetBedrag = (gekozenPeriode: Periode | undefined, budget: BudgetDTO): number | undefined => {
  if (gekozenPeriode === undefined) {
    return undefined;
  }
  if (budget.budgetPeriodiciteit.toLowerCase() === 'maand') {
    return budget.bedrag;
  } else { //budget.budgetPeriodiciteit.toLowerCase() === 'week'
    const dagenInPeriode = dayjs(gekozenPeriode.periodeEindDatum).diff(dayjs(gekozenPeriode.periodeStartDatum), 'day') + 1;
    return budget.bedrag * dagenInPeriode / 7;
  }
};

export const maandBudgetten = (rekeningen: RekeningGroepDTO[], maandAflossingsBedrag: number) => rekeningen.reduce((acc: { [x: string]: number; }, RekeningGroep: RekeningGroepDTO) => {
  acc[RekeningGroep.naam] = RekeningGroep.budgetten.reduce((acc, budget) => acc + budget.bedrag, 0)
  acc["aflossing"] = maandAflossingsBedrag;
  return acc;
}, {} as Record<string, number>);

export const budgetten = (rekeningen: RekeningGroepDTO[], aflossingsBedrag: number) =>
  rekeningen.reduce((acc: { [x: string]: number; }, RekeningGroep: RekeningGroepDTO) => {
    acc[RekeningGroep.naam] = RekeningGroep.budgetten.reduce((acc, budget) => acc + (budget.budgetOpPeilDatum ?? 0), 0)
    acc["aflossing"] = aflossingsBedrag;
    return acc;
  }, {} as Record<string, number>);

export const berekenBudgetStand = (budget: BudgetDTO): string => {
  let result;
  switch (budget.rekeningGroepSoort.toLowerCase()) {
    case 'inkomsten':
    case 'rente':
      (budget.meerDanMaandBudget ?? 0) > 0 || (budget.meerDanBudget ?? 0) > 0 ? result = 'green' :
        (budget.minderDanBudget ?? 0) > 0 ? result = 'red' : result = 'green';
      break;
    case 'uitgaven':
      switch (budget.budgetType.toLowerCase()) {
        case 'vast':
          (budget.meerDanMaandBudget ?? 0) > 0 || (budget.meerDanBudget ?? 0) > 0 ? result = 'orange' :
          (budget.minderDanBudget ?? 0) > 0 ? result = 'red' : result = 'green';
          break;
        case 'continu':
          (budget.meerDanMaandBudget ?? 0) > 0 ? result = '#cc0000' :
            (budget.meerDanBudget ?? 0) > 0 ? result = 'red' : result = 'green';
          break;
        default:
          result = 'grey';
      }
      break;
    default:
      result = 'grey';
  }
  return result;
}