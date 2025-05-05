import dayjs from "dayjs";
import { Rekening } from "./Rekening";
import { Periode } from "./Periode";

export type Budget = {
  rekening: Rekening | undefined;
  budgetNaam: string;
  budgetPeriodiciteit: string;
  bedrag: number;
  betaalDag: number | undefined;
}
export type BudgetDTO = {
  rekeningNaam: string;
  rekeningSoort: string;
  budgetNaam: string;
  budgetPeriodiciteit: string;
  bedrag: number;
  betaalDag: number | undefined;
  budgetMaandBedrag: number | undefined;
  budgetPeilDatum: string | undefined;
  budgetBetaling: number | undefined;
  budgetOpPeilDatum?: number | undefined;
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

export const maandBudgetten = (rekeningen: Rekening[], maandAflossingsBedrag: number) => rekeningen.reduce((acc: { [x: string]: number; }, rekening: Rekening) => {
  acc[rekening.naam] = rekening.budgetten.reduce((acc, budget) => acc + budget.bedrag, 0)
  acc["aflossing"] = maandAflossingsBedrag;
  return acc;
}, {} as Record<string, number>);

export const budgetten = (rekeningen: Rekening[], aflossingsBedrag: number) =>
  rekeningen.reduce((acc: { [x: string]: number; }, rekening: Rekening) => {
    acc[rekening.naam] = rekening.budgetten.reduce((acc, budget) => acc + (budget.budgetOpPeilDatum ?? 0), 0)
    acc["aflossing"] = aflossingsBedrag;
    return acc;
  }, {} as Record<string, number>);
