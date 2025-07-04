import { SaldoDTO } from "../../model/Saldo";
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';
import { UitroeptekenIcon } from '../../icons/Uitroepteken';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
};

export const berekenRekeningGroepIcoonKleur = (saldo: SaldoDTO): string => {
  if (saldo.budgetOpPeilDatum === 0 && saldo.budgetBetaling === 0) {
    return '#1977d3';
  }
  switch (saldo.budgetType.toLowerCase()) {
    case 'inkomsten':
      return saldo.minderDanBudget > 0 ? 'red' : 'green';
    case 'continu':
      return (saldo.meerDanMaandBudget > 0 ? '#c00' : saldo.meerDanBudget > 0) ? 'red' : 'green';
    case 'vast':
      return saldo.minderDanBudget > 0 ? 'red' : (saldo.meerDanMaandBudget > 0 || saldo.meerDanBudget > 0) ? 'orange' : 'green';
    default:
      return 'black';
  }
}

export const berekenRekeningGroepIcoonOpKleur = (heigth: number, color: string): JSX.Element => {
  switch (color) {
    case 'green':
    case '#1977d3':
      return <PlusIcon color={color} height={heigth} />;
    case 'red':
    case '#c00':
      return <MinIcon color={color} height={heigth} />;
    case 'orange':
      return <UitroeptekenIcon color={color} height={heigth} />;
    default:
      return <QuestionMarkOutlinedIcon color={'disabled'} height={heigth} />;
  }
}

export const berekenRekeningGroepIcoon = (heigth: number, saldo: SaldoDTO): JSX.Element => {
  return berekenRekeningGroepIcoonOpKleur(heigth, berekenRekeningGroepIcoonKleur(saldo));
}

export const berekenStandBodyTekst = (rekeningGroepSaldo: SaldoDTO, rekeningSaldi: SaldoDTO[]): string => {
  const fouteRekeningen = rekeningSaldi
    .filter(saldo => berekenRekeningGroepIcoonKleur(saldo) !== 'green' && berekenRekeningGroepIcoonKleur(saldo) !== '#1977d3')
    .map((saldo) => saldo.rekeningNaam)
  if (fouteRekeningen.length === 0) {
    return `${rekeningGroepSaldo.rekeningGroepNaam} precies ok!`;
  } else if (fouteRekeningen.length === 1) {
    return `${rekeningGroepSaldo.rekeningGroepNaam} niet ok, check ${fouteRekeningen[0]}.`;
  } else if (fouteRekeningen.length === 2) {
    return `${rekeningGroepSaldo.rekeningGroepNaam} niet ok, check ` + fouteRekeningen.join(' en ');
  } else {
    return `${rekeningGroepSaldo.rekeningGroepNaam} niet ok, check ` + fouteRekeningen.slice(0, -1).join(', ') + ' en ' + fouteRekeningen.slice(-1);
  }
}

export const berekenStandDetailsTekst = (rekeningSaldi: SaldoDTO[]): string[] => {
  const fouteRekeningen = rekeningSaldi
    .filter(saldo => berekenRekeningGroepIcoonKleur(saldo) !== 'green' && berekenRekeningGroepIcoonKleur(saldo) !== '#1977d3')

  return fouteRekeningen.map((saldo) => {
    switch (saldo.budgetType.toLowerCase()) {
      case 'inkomsten':
        return `${saldo.rekeningNaam}: ${formatAmount(saldo.minderDanBudget)} minder dan de verwachte ${formatAmount(saldo.budgetOpPeilDatum)}`; 
      case 'continu':
        return `${saldo.rekeningNaam}: ${formatAmount(saldo.meerDanBudget)} meer besteed dan de verwachte ${formatAmount(saldo.budgetOpPeilDatum)}`;
      case 'vast':
        if (saldo.budgetBetaling === 0) {
          return `${saldo.rekeningNaam}: niet betaald (betaaldag ${saldo.budgetBetaalDag}e)`;
        } else
        return `${saldo.rekeningNaam}: ${formatAmount(saldo.minderDanBudget)} te weinig betaald.`;
      default:
        return 'black';
    }
  })
}
