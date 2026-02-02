import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useCustomContext } from '../../context/CustomContext';

import { useEffect, useState } from 'react';
import { RekeningDTO } from '../../model/Rekening.ts';

interface RekeningSelectProps {
  wijzigOcrBankNaam: (bankRekening: RekeningDTO | undefined) => void;
}
export function RekeningSelect(props: RekeningSelectProps) {
  const { rekeningGroepPerBetalingsSoort } = useCustomContext();

  const bankRekeningen = rekeningGroepPerBetalingsSoort
  .filter((bs) => bs.betalingsSoort === 'INTERN')
  .flatMap((bs) => bs.rekeningGroepen)
  .flatMap((rg) => rg.rekeningen);
  
  const [gekozenRekening, setGekozenRekening] = useState<
    RekeningDTO | undefined
  >(undefined);

  useEffect(() => {
    if (bankRekeningen.length > 0) {
      if (gekozenRekening === undefined) {
        setGekozenRekening(bankRekeningen[0]);
        props.wijzigOcrBankNaam(bankRekeningen[0]);
      }
      const uniekeBankNamen = new Set(bankRekeningen);
      if (uniekeBankNamen.size === 1) {
        props.wijzigOcrBankNaam(Array.from(uniekeBankNamen)[0]);
      }
    }
  }, [bankRekeningen, gekozenRekening, props]);

  const handlegekozenRekeningChange = (event: SelectChangeEvent<string>) => {
    const bankRekening = bankRekeningen.find(
      (br) => br?.naam === event.target.value,
    );
    if (bankRekening) {
      setGekozenRekening(bankRekening);
      props.wijzigOcrBankNaam(bankRekening);
      localStorage.setItem('gekozenRekening', bankRekening?.id + '');
    }
  };

  return (
    <Box sx={{ my: 2, width: '340px' }}>
      <FormControl variant="standard" fullWidth>
        <InputLabel id="demo-simple-select-label">Kies de rekening</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={gekozenRekening?.naam || ''}
          label="RekeningGroep"
          onChange={handlegekozenRekeningChange}
        >
          {bankRekeningen.map((br) => (
            <MenuItem key={br.naam} value={br.naam}>
              {br.naam} {br.bankNaam ? `(${br.bankNaam})` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
