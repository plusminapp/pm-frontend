import { AflossingDTO } from "./Aflossing"
import { BudgetDTO, BudgetSamenvatting } from "./Budget"
import { Saldo } from "./Saldo"

export type Stand = {
    periodeStartDatum: string,
    peilDatum: string,
    datumLaatsteBetaling: string | undefined,
    openingsBalans: Saldo[],
    mutatiesOpDatum: Saldo[],
    balansOpDatum: Saldo[],
    resultaatOpDatum: Saldo[],
    budgetSamenvatting: BudgetSamenvatting
    budgettenOpDatum: BudgetDTO[],
    geaggregeerdeBudgettenOpDatum: BudgetDTO[],
    aflossingenOpDatum: AflossingDTO[],
    geaggregeerdeAflossingenOpDatum: AflossingDTO,
}
