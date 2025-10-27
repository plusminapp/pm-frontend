import { SaldoDTO } from '../../model/Saldo';
import z from 'zod';

export const formSchema = z.object({
  formReservering: z.object({
    bestemming: z.string().readonly(),
    bron: z.string(),
    bedrag: z.number(),
  }),
});
export type FormValues = z.infer<typeof formSchema>;

export const defaultFormSaldos = (saldo: SaldoDTO) => ({
  bestemming: saldo.rekeningNaam,
  bron: 'Kies een bron',
  bedrag: 0,
});

export const defaultHeeftAflossingen = (
  openingsBalansSaldi: SaldoDTO[],
): boolean =>
  openingsBalansSaldi.some(
    (saldo: SaldoDTO) => saldo.rekeningGroepSoort === 'AFLOSSING',
  );

export const formatAmount = (amount: number): string => {
  if (!!!amount) amount = 0;
  return amount.toLocaleString('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });
};
