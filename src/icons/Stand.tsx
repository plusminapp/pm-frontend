import React from "react";
import { PlusIcon } from "./Plus";
import { MinIcon } from "./Min";
import { UitroeptekenIcon } from "./Uitroepteken";
import { VraagtekenIcon } from "./Vraagteken";

interface StandIconProps {
  color: string; 
  height: number;
}

const StandIcon: React.FC<StandIconProps> = ({
  color,
  height,
}) => {
  let statusIcon;
  switch (color) {
    case 'green':
      statusIcon = <PlusIcon color={color} height={height} />;
      break;
    case 'red':
      statusIcon = <MinIcon color={color} height={height} />;
      break;
    case 'orange':
      statusIcon = <UitroeptekenIcon color={color} height={height} />;
      break;
    default:
      statusIcon = <VraagtekenIcon color={'grey'} height={height} />;
  }

  return (
    statusIcon
  );
};

export default StandIcon;