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
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { PeriodeSelect } from '../Periode/PeriodeSelect';
import { useCustomContext } from '@/context/CustomContext';
import { SaldoDTO } from '@/model/Saldo';

type SaldoStatusFilter = NonNullable<SaldoDTO['saldoStatus']>;

interface PotjesActiesProps {
  view: 'potjes' | 'tabel';
  handleViewChange: (event: React.MouseEvent<HTMLElement>, newView: 'potjes' | 'tabel' | null) => void;
  isReservering: boolean;
  handleReserveerClick: () => void;
  handleReserveerAlleClick: () => void;
  labels: string[];
  selectedLabels: string[];
  onLabelChange: (labels: string[]) => void;
  selectedSaldoStatussen: SaldoStatusFilter[];
  onSaldoStatusChange: (statussen: SaldoStatusFilter[]) => void;
  layout?: 'horizontal' | 'vertical';
  showFilters?: boolean;
  showLabelFilter?: boolean;
  variant?: 'default' | 'filters-inline';
  compactFilters?: boolean;
}

export const PotjesActies: React.FC<PotjesActiesProps> = ({
  view,
  handleViewChange,
  isReservering,
  handleReserveerClick,
  labels,
  selectedLabels,
  onLabelChange,
  selectedSaldoStatussen,
  onSaldoStatusChange,
  layout = 'horizontal',
  showFilters = true,
  showLabelFilter = true,
  variant = 'default',
  compactFilters = false,
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

  const saldoStatusOpties: {
    value: SaldoStatusFilter;
    label: string;
    color: 'success.main' | 'warning.main' | 'error.main';
  }[] = [
    { value: 'GROEN', label: 'Groen', color: 'success.main' },
    { value: 'ORANJE', label: 'Oranje', color: 'warning.main' },
    { value: 'ROOD', label: 'Rood', color: 'error.main' },
  ];

  const filterMinWidth = compactFilters ? 170 : 220;

  const saldoStatusFilterElement = (
    <Box sx={{ minWidth: filterMinWidth }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Filter op kleur
        </Typography>
        <Button
          size="small"
          sx={{ fontSize: '0.75rem', textTransform: 'none', minWidth: 'auto', p: 0 }}
          disabled={selectedSaldoStatussen.length === 0}
          onClick={() => onSaldoStatusChange([])}
        >
          Alle kleuren
        </Button>
      </Box>
      <ToggleButtonGroup
        size="small"
        value={selectedSaldoStatussen}
        onChange={(_event, nieuweSelectie: SaldoStatusFilter[]) => {
          if (nieuweSelectie.length === 3) {
            onSaldoStatusChange([]);
            return;
          }

          onSaldoStatusChange(nieuweSelectie);
        }}
        aria-label="saldo status filter"
        sx={{ gap: 1, border: 0, flexWrap: 'wrap' }}
      >
        {saldoStatusOpties.map((statusOptie) => {
          return (
            <ToggleButton
              key={statusOptie.value}
              value={statusOptie.value}
              aria-label={`filter ${statusOptie.label}`}
              sx={{
                fontSize: '0.8rem',
                gap: 0.75,
                textTransform: 'none',
                borderRadius: 999,
                px: 1.25,
                border: '1px solid',
                borderColor: 'divider',
                '&.MuiToggleButtonGroup-grouped': {
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: 'divider',
                  margin: 0,
                },
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: statusOptie.color,
                }}
              />
              {statusOptie.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );

  const labelFilterElement = (
    <FormControl variant="standard" size="small" sx={{ minWidth: filterMinWidth }}>
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
          Vullen
        </Button>
      </ButtonGroup>;

  if (variant === 'filters-inline') {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        gap={1}
        flexWrap="wrap"
        onClick={(event) => event.stopPropagation()}
        onFocus={(event) => event.stopPropagation()}
      >
        {showFilters ? saldoStatusFilterElement : null}
        {showFilters && showLabelFilter && labels.length > 0 ? labelFilterElement : null}
      </Box>
    );
  }

  if (layout === 'vertical') {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="center">
          {buttonGroupElement}
        </Box>
        <Box display="flex" justifyContent="center">
          {toggleElement}
        </Box>
        {showFilters ? (
          <>
            <Box display="flex" justifyContent="center">
              {saldoStatusFilterElement}
            </Box>
            <Box display="flex" justifyContent="center">
              {showLabelFilter && labels.length > 0 ? labelFilterElement : null}
            </Box>
          </>
        ) : null}
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
      {showFilters ? saldoStatusFilterElement : null}
      {showFilters && showLabelFilter && labels.length > 0 ? labelFilterElement : null}
      {periodeSelectElement}
    </Box>
  );
};
