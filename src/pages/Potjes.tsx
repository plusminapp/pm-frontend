import React from 'react';

import { useCustomContext } from '../context/CustomContext';
import { PotjesVisualisatie } from '../components/Potjes/PotjesVisualisatie';

const Potjes: React.FC = () => {
  const { rekeningGroepPerBetalingsSoort } = useCustomContext();

  return (
    <>
      {rekeningGroepPerBetalingsSoort &&
        rekeningGroepPerBetalingsSoort.length >= 0 && (
              <PotjesVisualisatie />
        )}
    </>
  );
};

export default Potjes;
