import { Box, Button, ButtonGroup, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PeriodeSelect } from '../Periode/PeriodeSelect';

interface PotjesActiesProps {
  view: 'potjes' | 'tabel';
  handleViewChange: (event: React.MouseEvent<HTMLElement>, newView: 'potjes' | 'tabel' | null) => void;
  isReservering: boolean;
  handleReserveerClick: () => void;
  handleReserveerAlleClick: () => void;
  layout?: 'horizontal' | 'vertical';
}

export const PotjesActies: React.FC<PotjesActiesProps> = ({
  view,
  handleViewChange,
  isReservering,
  handleReserveerClick,
  handleReserveerAlleClick,
  layout = 'horizontal',
}) => {
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

  const buttonGroupElement = (
    <ButtonGroup variant="contained" color="success" disabled={isReservering}>
      <Button onClick={handleReserveerClick} sx={{ fontSize: '0.875rem' }}>
        {isReservering ? 'Bezig...' : 'Reserveer'}
      </Button>
      <Button onClick={handleReserveerAlleClick} sx={{ fontSize: '0.875rem' }}>
        {isReservering ? 'Bezig...' : 'Reserveer Alle'}
      </Button>
    </ButtonGroup>
  );

  if (layout === 'vertical') {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="center" mt={-6}>
          {periodeSelectElement}
        </Box>
        <Box display="flex" justifyContent="center">
          {toggleElement}
        </Box>
        <Box display="flex" justifyContent="center">
          {buttonGroupElement}
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
      {periodeSelectElement}
      {toggleElement}
      {buttonGroupElement}
    </Box>
  );
};
