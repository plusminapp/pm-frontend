import React, { useState } from 'react';
import { Box, TextField, Typography, Tabs, Tab } from '@mui/material';
import PotjesUitgave from '../components/Potjes/PotjesUitgave';
import PotjesInkomstenDemo from '../components/Potjes/PotjesInkomstenDemo';
import PotjesSparenDemo from '../components/Potjes/PotjesSparenDemo';
import PotjesAggregaatDemo from '../components/Potjes/PotjesAggregaatDemo';

const PotjesDemoWrapper: React.FC = () => {
  const [openingsReserveSaldo, setOpeningsReserveSaldo] = useState<number>(0);
  const [periodeReservering, setPeriodeReservering] = useState<number>(0);
  const tabLabels = ['Leefgeld', 'Vast', 'Inkomsten', 'Sparen', 'Aggregaat'];
  const [naam, setNaam] = useState<string>(tabLabels[0]);
  const [isNaamDirty, setIsNaamDirty] = useState<boolean>(false);
  const [periodeBetaling, setPeriodeBetaling] = useState<number>(0);
  const [nogNodig, setNogNodig] = useState<number>(100);
  // default dates: peildatum = today, betaalDatum = day after tomorrow
  const today = new Date();
  const toDateInput = (d: Date) => d.toISOString().slice(0, 10);
  const defaultPeil = toDateInput(today);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  const defaultBetaal = toDateInput(dayAfterTomorrow);

  const [budgetBetaalDatum, setBudgetBetaalDatum] = useState<string>(defaultBetaal);
  const [peilDatum, setpeilDatum] = useState<string>(defaultPeil);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [budgetMaandBedrag, setBudgetMaandBedrag] = useState<number>(100);
  const [bedragPerMaandTeGaan, setBedragPerMaandTeGaan] = useState<number>(0);
  const [aantalPotjes, setAantalPotjes] = useState<number>(3);
  const [aantalOranje, setAantalOranje] = useState<number>(0);
  const [aantalRode, setAantalRode] = useState<number>(0);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {`${['Leefgeld', 'Vast', 'Inkomsten', 'Sparen', 'Aggregaat'][tabIndex]} Potjes Demo`}
      </Typography>

      <Box
        component="form"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' },
          gap: 2,
          mb: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          label="naam"
          type="text"
          value={naam}
          onChange={(e) => {
            setNaam(e.target.value);
            setIsNaamDirty(true);
          }}
          size="small"
          fullWidth
        />

        {/* When Aggregaat tab is selected show only aggregaat-specific fields (name is always shown above) */}
        {tabIndex === 4 ? (
          <>
            <TextField
              label="aantal potjes"
              type="number"
              value={aantalPotjes}
              onChange={(e) => setAantalPotjes(Number(e.target.value))}
              size="small"
              fullWidth
            />

            <TextField
              label="aantal oranje"
              type="number"
              value={aantalOranje}
              onChange={(e) => setAantalOranje(Number(e.target.value))}
              size="small"
              fullWidth
            />

            <TextField
              label="aantal rode"
              type="number"
              value={aantalRode}
              onChange={(e) => setAantalRode(Number(e.target.value))}
              size="small"
              fullWidth
            />
          </>
        ) : (
          <>
            <TextField
              label="budgetMaandBedrag"
              type="number"
              value={budgetMaandBedrag}
              onChange={(e) => setBudgetMaandBedrag(Number(e.target.value))}
              size="small"
              fullWidth
            />

            <TextField
              label="openingsReserveSaldo"
              type="number"
              value={openingsReserveSaldo}
              onChange={(e) => setOpeningsReserveSaldo(Number(e.target.value))}
              size="small"
              fullWidth
            />

            <TextField
              label="periodeReservering"
              type="number"
              value={periodeReservering}
              onChange={(e) => setPeriodeReservering(Number(e.target.value))}
              size="small"
              fullWidth
            />

            {/* date fields: show only for tabs Vast(1) and Inkomsten(2) */}
            {tabIndex !== 0 && tabIndex !== 3 && (
              <>
                <TextField
                  label="peilDatum"
                  type="date"
                  value={peilDatum}
                  onChange={(e) => setpeilDatum(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="budgetBetaalDatum"
                  type="date"
                  value={budgetBetaalDatum}
                  onChange={(e) => setBudgetBetaalDatum(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            )}

            <TextField
              label="periodeBetaling"
              type="number"
              value={periodeBetaling}
              onChange={(e) => setPeriodeBetaling(Number(e.target.value))}
              size="small"
              fullWidth
            />

            {(tabIndex === 0 || tabIndex === 1) && (
              <TextField
                label="nog nodig"
                type="number"
                value={nogNodig}
                onChange={(e) => setNogNodig(Number(e.target.value))}
                size="small"
                fullWidth
              />
            )}

            {/* Sparen-only input */}
            {tabIndex === 3 && (
              <TextField
                label="bedragPerMaandTeGaan"
                type="number"
                value={bedragPerMaandTeGaan}
                onChange={(e) => setBedragPerMaandTeGaan(Number(e.target.value))}
                size="small"
                fullWidth
              />
            )}
          </>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
          <Tabs
          value={tabIndex}
          onChange={(_, v) => {
            setTabIndex(v);
            if (!isNaamDirty) {
              setNaam(tabLabels[v]);
            }
          }}
          aria-label="Potjes demo tabs"
        >
          <Tab label="Leefgeld" />
          <Tab label="Vast" />
          <Tab label="Inkomsten" />
          <Tab label="Sparen" />
          <Tab label="Aggregaat" />
        </Tabs>

        {/* Tab panels - render based on tabIndex */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          {tabIndex === 0 && (
            <PotjesUitgave
              naam={naam}
              openingsReserveSaldo={openingsReserveSaldo}
              periodeReservering={periodeReservering}
              periodeBetaling={periodeBetaling}
              nogNodig={nogNodig}
              budgetMaandBedrag={budgetMaandBedrag}
            />
          )}

          {tabIndex === 1 && (
            <PotjesUitgave
              naam={naam}
              openingsReserveSaldo={openingsReserveSaldo}
              periodeReservering={periodeReservering}
              periodeBetaling={periodeBetaling}
              nogNodig={nogNodig}
              budgetMaandBedrag={budgetMaandBedrag}
              peilDatum={peilDatum}
              budgetBetaalDatum={budgetBetaalDatum}
            />
          )}

          {tabIndex === 2 && (
            <PotjesInkomstenDemo
              naam={naam}
              openingsReserveSaldo={openingsReserveSaldo}
              periodeReservering={periodeReservering}
              periodeBetaling={periodeBetaling}
              nogNodig={nogNodig}
              budgetMaandBedrag={budgetMaandBedrag}
              peilDatum={peilDatum}
              budgetBetaalDatum={budgetBetaalDatum}
            />
          )}

          {tabIndex === 3 && (
            <PotjesSparenDemo
              naam={naam}
              openingsReserveSaldo={openingsReserveSaldo}
              periodeReservering={periodeReservering}
              periodeBetaling={periodeBetaling}
              nogNodig={nogNodig}
              budgetMaandBedrag={budgetMaandBedrag}
              bedragPerMaandTeGaan={bedragPerMaandTeGaan}
            />
          )}

          {tabIndex === 4 && (
            <PotjesAggregaatDemo
              naam={naam}
              aantal={aantalPotjes}
              aantalOranje={aantalOranje}
              aantalRood={aantalRode}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PotjesDemoWrapper;
