import { AflossingDTO } from './Aflossing';
import { Periode } from './Periode';
import { SpaarpotDTO } from './Spaarpot';

export type Stand = {
  periodeStartDatum: string;
  peilDatum: string;
  datumLaatsteBetaling: string | undefined;
  budgetHorizon: string;
  reserveringsHorizon: string;
  resultaatOpDatum: SaldoDTO[];
  geaggregeerdResultaatOpDatum: SaldoDTO[];
  resultaatSamenvattingOpDatum: ResultaatSamenvattingOpDatumDTO;
};

export type SaldoDTO = {
  id: number;
  rekeningGroepNaam: string;
  rekeningGroepSoort: string;
  budgetType: string | undefined;
  rekeningNaam: string;
  budgetBetaalDag: number;
  aflossing: AflossingDTO | undefined;
  spaarpot: SpaarpotDTO | undefined;
  sortOrder: number;
  openingsBalansSaldo: number;
  openingsReserveSaldo: number;
  openingsAchterstand: number;
  budgetMaandBedrag: number;
  periodeBetaling: number;
  periodeReservering: number;
  periodeAchterstand: number;
  correctieBoeking: number;
  periode: Periode;
  budgetPeilDatum: string;
  budgetOpPeilDatum: number;
  betaaldBinnenBudget: number;
  minderDanBudget: number;
  meerDanBudget: number;
  meerDanMaandBudget: number;
  komtNogNodig: number;
  bedrag: number;
};

export type ResultaatSamenvattingOpDatumDTO = {
  percentagePeriodeVoorbij: number;
  openingsReservePotjesVoorNuSaldo: number;
  budgetMaandInkomstenBedrag: number;
  besteedTotPeilDatum: number;
  gespaardTotPeilDatum: number;
  nogNodigNaPeilDatum: number;
  actueleBuffer: number;
  extraGespaardTotPeilDatum: number;
};
