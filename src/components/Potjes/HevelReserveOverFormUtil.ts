import { SaldoDTO } from '../../model/Saldo';
import z from 'zod';

export const formSchema = z.object({
  formReservering: z.object({
    bestemming: z.string().readonly(),
    bron: z.string(),
    bedrag: z.string().refine((val) => {
      return /^\d*(\.\d{0,2})?$/.test(val);
    }, 'Geen geldig bedrag'),
    omschrijving: z.string().max(100).optional().or(z.literal('')) ,
  }),
});
export type FormValues = z.infer<typeof formSchema>;

export const defaultFormSaldos = (saldo: SaldoDTO) => {
  const computed = saldo.periodeBetaling + saldo.komtNogNodig - saldo.openingsReserveSaldo - saldo.periodeReservering;
  return {
    bestemming: saldo.rekeningNaam,
    bron: 'Kies een bron',
    bedrag: Math.max(0, computed).toFixed(2).toString(),
  };
};

export const formatAmount = (amount: number): string => {
  if (!amount) amount = 0;
  return amount.toLocaleString('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  });
};
