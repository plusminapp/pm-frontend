import React, { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import PotjesDemo from '@/components/Potjes/PotjesDemo';

const PotjesDemoWrapper: React.FC = () => {
  const [openingsReserveSaldo, setOpeningsReserveSaldo] = useState<number>(50);
  const [periodeReservering, setPeriodeReservering] = useState<number>(50);
  const [naam, setNaam] = useState<string>('Potje');
  const [besteed, setBesteed] = useState<number>(20);
  const [nogNodig, setNogNodig] = useState<number>(50);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Potjes Demo
      </Typography>

      <Box component="form" sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="naam"
          type="text"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
        />
        <TextField
          label="openingsReserveSaldo"
          type="number"
          value={openingsReserveSaldo}
          onChange={(e) => setOpeningsReserveSaldo(Number(e.target.value))}
        />
        <TextField
          label="periodeReservering"
          type="number"
          value={periodeReservering}
          onChange={(e) => setPeriodeReservering(Number(e.target.value))}
        />
        <TextField
          label="besteed"
          type="number"
          value={besteed}
          onChange={(e) => setBesteed(Number(e.target.value))}
        />
        <TextField
          label="nog nodig"
          type="number"
          value={nogNodig}
          onChange={(e) => setNogNodig(Number(e.target.value))}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <PotjesDemo
          naam={naam}
          openingsReserveSaldo={openingsReserveSaldo}
          periodeReservering={periodeReservering}
          besteed={besteed}
          nogNodig={nogNodig}
        />
      </Box>
    </Box>
  );
};

export default PotjesDemoWrapper;
