import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { PeriodeSelect } from '../Periode/PeriodeSelect';
import { useCustomContext } from '@/context/CustomContext';

interface PotjesActiesProps {
  view: 'potjes' | 'tabel';
  handleViewChange: (event: React.MouseEvent<HTMLElement>, newView: 'potjes' | 'tabel' | null) => void;
  isReservering: boolean;
  handleReserveerClick: () => void;
  handleReserveerAlleClick: () => void;
  labels: string[];
  selectedLabels: string[];
  onLabelChange: (labels: string[]) => void;
  layout?: 'horizontal' | 'vertical';
}

export const PotjesActies: React.FC<PotjesActiesProps> = ({
  view,
  handleViewChange,
  isReservering,
  handleReserveerClick,
  labels,
  selectedLabels,
  onLabelChange,
  layout = 'horizontal',
}) => {

  const {
    gekozenPeriode,
    stand,
  } = useCustomContext();


  const isHuidigePeriode = gekozenPeriode?.periodeStatus === 'HUIDIG';
  const bufferSaldo = stand?.resultaatOpDatum.find((saldo) => saldo.rekeningGroepSoort === 'RESERVERING_BUFFER');
  const toewijsbaarValue =
    isHuidigePeriode && bufferSaldo
      ? bufferSaldo.openingsReserveSaldo + bufferSaldo.periodeReservering
      : undefined;

  const toewijsbaarFormatted = toewijsbaarValue !== undefined
    ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(toewijsbaarValue)
    : undefined;

  const periodeSelectElement = <PeriodeSelect />;

  const toggleElement = (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleViewChange}
      aria-label="weergave selectie"
    >
      <ToggleButton value="potjes" aria-label="potjes visualisatie">
        Potjes
      </ToggleButton>
      <ToggleButton value="tabel" aria-label="reservering tabel">
        Tabel
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const labelFilterElement = (
    <FormControl variant="standard" size="small" sx={{ minWidth: 220 }}>
      <InputLabel id="potjes-label-filter" sx={{ fontSize: '0.875rem' }}>
        Filter op label
      </InputLabel>
      <Select
        sx={{ fontSize: '0.875rem' }}
        labelId="potjes-label-filter"
        multiple
        value={selectedLabels}
        label="Filter op label"
        renderValue={(selected) =>
          selected.length > 0 ? selected.join(', ') : 'Alle labels'
        }
        onChange={(event) => {
          const value = event.target.value as string[];
          if (value.includes('__all__')) {
            onLabelChange([]);
            return;
          }
          onLabelChange(value);
        }}
      >
        <MenuItem value="__all__">
          <ListItemText
            primary="Alle labels"
            slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }}
          />
        </MenuItem>
        {labels.map((label) => (
          <MenuItem key={label}
            value={label}
            sx={{ fontSize: '0.875rem' }}
          >
            <Checkbox
              size="small"
              sx={{ padding: '2px 8px 2px 0' }}
              checked={selectedLabels.includes(label)} />
            <ListItemText
              primary={label}
              slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const buttonGroupElement =
    isHuidigePeriode
      ? <ButtonGroup variant="contained" color="success" disabled={isReservering}>
        <Button onClick={handleReserveerClick} sx={{ fontSize: '0.875rem' }}>
          {isReservering ? 'Bezig...' : `Toewijsbaar: ${toewijsbaarFormatted ?? '—'}`}
        </Button>
      </ButtonGroup>
      : <ButtonGroup variant="contained" color="success" disabled>
        <Button sx={{ fontSize: '0.875rem' }}>
          Toewijzen
        </Button>
      </ButtonGroup>;

  if (layout === 'vertical') {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="center">
          {buttonGroupElement}
        </Box>
        <Box display="flex" justifyContent="center">
          {toggleElement}
        </Box>
        <Box display="flex" justifyContent="center">
          {labelFilterElement}
        </Box>
        <Box display="flex" justifyContent="center" mt={-2}>
          {periodeSelectElement}
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
      {buttonGroupElement}
      {toggleElement}
      {labelFilterElement}
      {periodeSelectElement}
    </Box>
  );
};
