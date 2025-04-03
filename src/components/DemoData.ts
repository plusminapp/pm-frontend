import dayjs from "dayjs";
import { BudgetDTO } from "../model/Budget";
import { berekenPeriodeBijPeilDatum } from "../model/Periode";
import { AflossingDTO } from "../model/Aflossing";
import { Rekening, RekeningSoort } from "../model/Rekening";

const periode = berekenPeriodeBijPeilDatum(dayjs());

export const rekeningTemplate = {
    Id: 1,
    nummer: undefined,
    bankNaam: undefined,
    sortOrder: 1,
    budgetten: [],
} as unknown as Rekening;


export const inkomstenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Salaris',
    budgetPeriodiciteit: 'maand',
    bedrag: 1800,
    betaalDag: 24,
    rekeningNaam: "Inkomsten",
    rekeningSoort: "inkomsten",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}, {
    budgetNaam: 'Toeslagen',
    budgetPeriodiciteit: 'maand',
    bedrag: 450,
    betaalDag: 4,
    rekeningNaam: "Inkomsten",
    rekeningSoort: "inkomsten",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}];

export const boodschappenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Supermarkt',
    budgetPeriodiciteit: 'maand',
    bedrag: 200,
    betaalDag: undefined,
    rekeningNaam: "Boodschappen",
    rekeningSoort: "uitgaven",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}, {
    budgetNaam: 'Overig',
    budgetPeriodiciteit: 'maand',
    bedrag: 100,
    betaalDag: undefined,
    rekeningNaam: "Boodschappen",
    rekeningSoort: "uitgaven",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}];

export const vastelastenBudgetten: BudgetDTO[] = [{
    budgetNaam: 'Huur',
    budgetPeriodiciteit: 'maand',
    bedrag: 724,
    betaalDag: 1,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}, {
    budgetNaam: 'Greenchoice',
    budgetPeriodiciteit: 'maand',
    bedrag: 169,
    betaalDag: 2,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}, {
    budgetNaam: 'ONVZ',
    budgetPeriodiciteit: 'maand',
    bedrag: 135,
    betaalDag: 7,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}, {
    budgetNaam: 'Overig',
    budgetPeriodiciteit: 'maand',
    bedrag: 150,
    betaalDag: 19,
    rekeningNaam: "Vaste lasten",
    rekeningSoort: "uitgaven",
    budgetPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    budgetBetaling: 0,
}];

export const aflossingen: AflossingDTO[] = [{
    rekening: {
        ...rekeningTemplate,
        naam: "BD Toeslagen",
        rekeningSoort: RekeningSoort.aflossing,
    },
    startDatum: dayjs("2024-05-01"),
    eindDatum: dayjs("2026-10-01"),
    eindBedrag: 3354.00,
    aflossingsBedrag: 125.00,
    betaalDag: 26,
    dossierNummer: "BD Toeslagen dossiernummer",
    notities: "",
    aflossingPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    deltaStartPeriode: 0,
    saldoStartPeriode: 1979,
    aflossingBetaling: 0,
}, {
    rekening: {
        ...rekeningTemplate,
        naam: "Smaal",
        rekeningSoort: RekeningSoort.aflossing,
    },
    startDatum: dayjs("2024-05-01"),
    eindDatum: dayjs("2025-05-01"),
    eindBedrag: 851.40,
    aflossingsBedrag: 75.00,
    betaalDag: 26,
    dossierNummer: "Smaal dossiernummer",
    notities: "",
    aflossingPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    deltaStartPeriode: 0,
    saldoStartPeriode: 26.4,
    aflossingBetaling: 0,
}, {
    rekening: {
        ...rekeningTemplate,
        naam: "Infomedics",
        rekeningSoort: RekeningSoort.aflossing,
    },
    startDatum: dayjs("2024-05-01"),
    eindDatum: dayjs("2025-09-01"),
    eindBedrag: 386.40,
    aflossingsBedrag: 25.00,
    betaalDag: 6,
    dossierNummer: "Tribuut dossiernummer",
    notities: "",
    aflossingPeilDatum: dayjs(periode.periodeStartDatum).format('YYYY-MM-DD'),
    deltaStartPeriode: -25,
    saldoStartPeriode: 111.4,
    aflossingBetaling: 0,
}]

