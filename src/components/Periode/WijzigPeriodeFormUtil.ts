import {
  balansRekeningGroepSoorten,
  RekeningGroepSoort,
} from '../../model/RekeningGroep';
import { SaldoDTO, Stand } from '../../model/Saldo';

export type FormSaldo = {
  naam: string;
  bedrag: string;
  delta: number;
};

export const defaultFormSaldos = (stand: Stand): FormSaldo[] =>
  stand.resultaatOpDatum
    .filter((saldo: SaldoDTO) =>
      balansRekeningGroepSoorten.includes(
        saldo.rekeningGroepSoort as RekeningGroepSoort,
      ),
    )
    .map((saldo: SaldoDTO) => ({
      naam: saldo.rekeningNaam,
      bedrag: Number(saldo.openingsBalansSaldo).toFixed(2),
      delta: Number(saldo.oorspronkelijkeBetaling),
    }));

export const defaultHeeftAflossingen = (stand: Stand): boolean =>
  stand.geaggregeerdResultaatOpDatum.some(
    (saldo: SaldoDTO) => saldo.rekeningGroepSoort === 'AFLOSSINGEN',
  );
