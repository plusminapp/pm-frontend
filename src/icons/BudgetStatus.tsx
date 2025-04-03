import { MinIcon } from "./Min";
import { PlusIcon } from "./Plus";

interface BudgetStatusIconProps {
  verwachtLaag: number;
  verwachtHoog: number;
}

export const BudgetStatusIcon = (props: BudgetStatusIconProps) => {
  if (Number(props.verwachtHoog) === 0 && Number(props.verwachtLaag === 0)) {
    return <PlusIcon color={'#bdbdbd'} height={15} />;
  } else if (Number(props.verwachtHoog.toFixed(2)) < Number(props.verwachtLaag.toFixed(2))) {
    return <MinIcon color={'red'} height={15} />;
  } else {
    return <PlusIcon color={'green'} height={15} />;
  }
};
