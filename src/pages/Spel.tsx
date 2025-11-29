import React from 'react';

import { useCustomContext } from '../context/CustomContext';
import { SpelVisualisatie } from '../components/Spel/SpelVisualisatie';

const Spel: React.FC = () => {
  const { rekeningGroepPerBetalingsSoort } = useCustomContext();

  return (
    <>
      {rekeningGroepPerBetalingsSoort &&
        rekeningGroepPerBetalingsSoort.length >= 0 && (
              <SpelVisualisatie />
        )}
    </>
  );
};

export default Spel;
