import { MinIcon } from "./Min";
import { PlusIcon } from "./Plus";

interface AflossingStatusIconProps {
  verwachtLaag: number;
  verwachtHoog: number;
}

export const AflossingStatusIcon = ({ verwachtHoog, verwachtLaag }: AflossingStatusIconProps) => {
    if (Number(verwachtHoog) === 0 && Number(verwachtLaag === 0)) {
      return <PlusIcon color={'#bdbdbd'} height={15} />;
    } else if (Number(verwachtHoog) === Number(verwachtLaag)) {
      return <PlusIcon color={'green'} height={15} />;
    } else {
      return <MinIcon color={'orange'} height={15} />;
    }
};
