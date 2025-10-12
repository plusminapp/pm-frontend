import { balansRekeningGroepSoorten, RekeningGroepSoort } from '../../model/RekeningGroep';
import { SaldoDTO } from '../../model/Saldo';
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
      sortOrder: z.number().readonly(),
    }),
  ),
});
export type FormValues = z.infer<typeof formSchema>;

export const defaultFormSaldos = (openingsBalansSaldi: SaldoDTO[]) =>
  openingsBalansSaldi
    .filter((saldo: SaldoDTO) => balansRekeningGroepSoorten.includes(saldo.rekeningGroepSoort as RekeningGroepSoort))
    .sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1)
    .map((saldo: SaldoDTO) => ({
      naam: saldo.rekeningNaam,
      sortOrder: saldo.sortOrder,
      nieuw: String(saldo.openingsBalansSaldo.toFixed(2)),
      huidig: saldo.openingsBalansSaldo,
      delta: saldo.correctieBoeking,
    }))

export const defaultHeeftAflossingen = (openingsBalansSaldi: SaldoDTO[]): boolean =>
  openingsBalansSaldi.some(
    (saldo: SaldoDTO) => saldo.rekeningGroepSoort === 'AFLOSSING',
  );
