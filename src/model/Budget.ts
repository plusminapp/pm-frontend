import dayjs from "dayjs";
import { BudgetType, Rekening } from "./Rekening";
import { dagenInPeriode, dagenSindsStartPeriode, isDagNaVandaagInPeriode, Periode } from "./Periode";

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
    budgetPeilDatum: string | undefined;
    budgetBetaling: number | undefined;
    budgetOpPeilDatum?: number | undefined;
}
export const berekenPeriodeBudgetBedrag = (gekozenPeriode: Periode | undefined, budget: Budget): number | undefined => {
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

export const berekenBudgetTotaal = (budgetten: Budget[]): number => {
    return budgetten.reduce((acc, budget) => acc + budget.bedrag, 0)
}

export const berekenBudgetBedrag = (budgetType: BudgetType | undefined, budget: Budget, gekozenPeriode: Periode | undefined): number => {
    if (gekozenPeriode === undefined) {
        return 0;
    }
    const factor = budget.budgetPeriodiciteit.toLowerCase() === 'maand' ? dagenInPeriode(gekozenPeriode) ?? 30 : 7;
    if (budgetType === BudgetType.continu) {
        const dagen = dagenSindsStartPeriode(gekozenPeriode);
        return dagen !== undefined ? budget.bedrag * dagen / factor : 0;
    } else if (budget.betaalDag === undefined) {
        return budget.bedrag;
    } else if (isDagNaVandaagInPeriode(budget.betaalDag, gekozenPeriode)) {
        return 0;
    } else {
        return budget.bedrag;
    }
};

export const maandBudgetten = (rekeningen: Rekening[], maandAflossingsBedrag: number) => rekeningen.reduce((acc: { [x: string]: number; }, rekening: Rekening) => {
    acc[rekening.naam] = rekening.budgetten.reduce((acc, budget) => acc + budget.bedrag, 0)
    acc["aflossing"] = maandAflossingsBedrag;
    return acc;
}, {} as Record<string, number>);

export const budgetten = (rekeningen: Rekening[], gekozenPeriode: Periode | undefined, aflossingsBedrag: number) =>
    
    rekeningen.reduce((acc: { [x: string]: number; }, rekening: Rekening) => {
        acc[rekening.naam] = rekening.budgetten.reduce((acc, budget) => acc + berekenBudgetBedrag(rekening.budgetType, budget, gekozenPeriode), 0)
        acc["aflossing"] = aflossingsBedrag;
        return acc;
    }, {} as Record<string, number>);
