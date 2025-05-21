
export type RekeningGroepDTO = {
    id: number;
    naam: string;
    rekeningGroepSoort: RekeningGroepSoort;
    rekeningGroepIcoonNaam: string | undefined;
    sortOrder: number;
    budgetType: BudgetType | undefined;
}

export enum RekeningGroepSoort {
    inkomsten = 'INKOMSTEN',
    uitgaven = 'UITGAVEN',
    betaalrekening = 'BETAALREKENING',
    spaarrekening = 'SPAARREKENING',
    contant = 'CONTANT',
    creditcard = 'CREDITCARD',
    aflossing = 'AFLOSSING',
    reservering = 'RESERVERING'
}
export enum BudgetType {
    continu = 'CONTINU',
    vast = 'VAST',
}

export type RekeningGroepSoortPaar = {
    bron: RekeningGroepSoort[];
    bestemming: RekeningGroepSoort[];
}

export type RekeningGroepPaar = {
    bron: RekeningGroepDTO[];
    bestemming: RekeningGroepDTO[];
}

export const balansrekeningGroepSoorten: RekeningGroepSoort[] = [
    RekeningGroepSoort.betaalrekening,
    RekeningGroepSoort.spaarrekening,
    RekeningGroepSoort.contant,
    RekeningGroepSoort.creditcard,
    RekeningGroepSoort.aflossing,
    RekeningGroepSoort.reservering];

export const resultaatrekeningGroepSoorten = [
    RekeningGroepSoort.inkomsten,
    RekeningGroepSoort.uitgaven];

export const aflossenrekeningGroepSoorten = [
    RekeningGroepSoort.creditcard,
    RekeningGroepSoort.aflossing];

export const reserverenrekeningGroepSoorten = [
    RekeningGroepSoort.reservering];

export const betaalmethoderekeningGroepSoorten = [
    RekeningGroepSoort.betaalrekening,
    RekeningGroepSoort.spaarrekening,
    RekeningGroepSoort.contant,
    RekeningGroepSoort.creditcard,
]

export const bankrekeningGroepSoorten = [
    RekeningGroepSoort.betaalrekening,
    RekeningGroepSoort.spaarrekening,
    RekeningGroepSoort.creditcard,
]

export const inkomstenrekeningGroepSoorten = [
    RekeningGroepSoort.inkomsten,
]

export const uitgavenrekeningGroepSoorten = [
    RekeningGroepSoort.uitgaven,
    RekeningGroepSoort.aflossing,
    RekeningGroepSoort.reservering,
]

export const internerekeningGroepSoorten = [ 
    RekeningGroepSoort.spaarrekening,
    RekeningGroepSoort.contant,
    RekeningGroepSoort.creditcard,
    RekeningGroepSoort.reservering,
]

export const cashflowrekeningGroepSoorten = [
    RekeningGroepSoort.betaalrekening,
    RekeningGroepSoort.spaarrekening,
    RekeningGroepSoort.contant,
    RekeningGroepSoort.creditcard,
]

// export const berekenBedragVoorRekenining = (betaling: BetalingDTO, RekeningGroep: RekeningGroep | undefined) => {
//     if (RekeningGroep === undefined) return betaling.bedrag // filter = 'all'
//     const factor = resultaatrekeningGroepSoorten.includes(RekeningGroep.rekeningGroepSoort) ? -1 : 1
//     if (betaling.bron === RekeningGroep.naam) return Number(-betaling.bedrag) * factor
//     if (betaling.bestemming === RekeningGroep.naam) return Number(betaling.bedrag) * factor
//     return 0
//   }
  