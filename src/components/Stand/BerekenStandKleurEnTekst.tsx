import { SaldoDTO } from "../../model/Saldo";
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';
import {UitroeptekenIcon} from '../../icons/Uitroepteken';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';

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
      return <PlusIcon color={ color } height = { heigth} />;
    case 'red':
    case '#c00':
      return <MinIcon color={ color } height = { heigth} />;
    case 'orange':
      return <UitroeptekenIcon color={ color } height = { heigth} />;
    default:
      return <QuestionMarkOutlinedIcon color={ 'disabled' } height = { heigth} />;
  }
}

export const berekenRekeningGroepIcoon = (heigth: number, saldo: SaldoDTO): JSX.Element => {
  return berekenRekeningGroepIcoonOpKleur(heigth, berekenRekeningGroepIcoonKleur(saldo));
}
