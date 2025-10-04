import {
  balansRekeningGroepSoorten,
  RekeningGroepSoort,
} from '../../model/RekeningGroep';
import { SaldoDTO, Stand } from '../../model/Saldo';
import z from 'zod';

export const formSchema = z.object({
  formSaldi: z.array(
    z.object({
      huidig: z.number().readonly(),
      nieuw: z.string().refine((val) => {
        return /^-?\d*(\.\d{0,2})?$/.test(val);
      }, 'geen valide invoer'),
      delta: z.number(),
      naam: z.string().readonly(),
    }),
  ),
});
export type FormValues = z.infer<typeof formSchema>;

export const defaultFormSaldos = (stand: Stand) =>
  stand.resultaatOpDatum
    .filter((saldo: SaldoDTO) =>
      balansRekeningGroepSoorten.includes(
        saldo.rekeningGroepSoort as RekeningGroepSoort,
      ),
    )
    .map((saldo: SaldoDTO) => ({
      naam: saldo.rekeningNaam,
      nieuw: String(saldo.openingsBalansSaldo.toFixed(2)),
      huidig: saldo.openingsBalansSaldo,
      delta: 0,
    }));

export const defaultHeeftAflossingen = (stand: Stand): boolean =>
  stand.geaggregeerdResultaatOpDatum.some(
    (saldo: SaldoDTO) => saldo.rekeningGroepSoort === 'AFLOSSINGEN',
  );
