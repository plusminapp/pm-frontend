import { AflossingDTO } from "./Aflossing"
import { BudgetDTO } from "./Budget"
import { Saldo } from "./Saldo"

export type Stand = {
    periodeStartDatum: string,
    peilDatum: string,
    openingsBalans: Saldo[],
    mutatiesOpDatum: Saldo[],
    balansOpDatum: Saldo[],
    resultaatOpDatum: Saldo[],
    budgettenOpDatum: BudgetDTO[],
    aflossingenOpDatum: AflossingDTO[],
}
