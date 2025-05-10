import { Box, Button, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';

import dayjs from "dayjs";
import { BudgetDTO } from "../model/Budget";

import { useCallback, useEffect, useState } from "react";
import { berekenPeriodeBijPeilDatum, dagInPeriode } from "../model/Periode";
import { BudgetType, RekeningSoort } from "../model/Rekening";
import { aflossingen, boodschappenBudgetten, inkomstenBudgetten, rekeningTemplate, vastelastenBudgetten } from "../components/DemoData";
import { AflossingDTO } from "../model/Aflossing";
import StandGeneriekIcon from "../components/Stand/StandGeneriekGrafiek";
import PaymentsIcon from '@mui/icons-material/Payments';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AflossingGrafiek from "../components/Stand/AflossingGrafiek";
import BudgetContinuGrafiek from "../components/Stand/BudgetContinuGrafiek";
import BudgetInkomstenGrafiek from "../components/Stand/BudgetInkomstenGrafiek";
import BudgetVastGrafiek from "../components/Stand/BudgetVastGrafiek";

type FormField = {
  rekeningNaam: string;
  rekeningSoort: string;
  budgetType: string;
  budgetten: BudgetDTO[];
  aflossingen: AflossingDTO[];
  status: string;
  percentageFill: number;
  rekeningIcon: React.ReactNode;
  headerText: string;
  bodyText: string;
  cfoText: string;
}

const initialFormFields = {
  rekeningNaam: 'Inkomsten',
  rekeningSoort: 'inkomsten',
  budgetType: BudgetType.vast,
  budgetten: inkomstenBudgetten,
  aflossingen: aflossingen,
  status: 'green',
  percentageFill: 33,
  rekeningIcon: <PaymentsIcon color="disabled" fontSize="large" />,
  bodyText: 'Pas op met je uitgaven',
  cfoText: 'Probeer te bezuinigen'
} as FormField;

export default function Visualisatie() {

  const periode = berekenPeriodeBijPeilDatum(dayjs());
  const [formFields, setFormFields] = useState<FormField>(initialFormFields);

  const [selectedVisualisatie, setSelectedVisualisatie] = useState<string | undefined>('Inkomsten');

  const [peilDatum, setPeilDatum] = useState(dayjs(periode.periodeStartDatum));
  const [gekozenPeilDatumNaam, setGekozenPeilDatumNaam] = useState<string | undefined>('begin');

  const handlePeilDatumChange = (value: dayjs.Dayjs) => {
    const newPeilDatum = (value.isBefore(dayjs(periode.periodeStartDatum))) ? dayjs(periode.periodeStartDatum) :
      (value.isAfter(dayjs(periode.periodeEindDatum))) ? dayjs(periode.periodeEindDatum) :
        value
    setPeilDatum(newPeilDatum);
    const newFormFields = {
      ...formFields, budgetten: formFields.budgetten.map(budget => ({
        ...budget,
        budgetPeilDatum: newPeilDatum.toISOString()
      }))
    };
    setFormFields(newFormFields);
    setGekozenPeilDatumNaam(undefined);
  }
  const handleGekozenPeilDatumNaam = (positie: string) => {
    switch (positie) {
      case 'begin':
        setPeilDatum(dayjs(periode.periodeStartDatum));
        break;
      case 'midden':
        setPeilDatum(dayjs(periode.periodeStartDatum).add(14, 'day'));
        break;
      case 'einde':
        setPeilDatum(dayjs(periode.periodeEindDatum));
    }
  }
  useEffect(() => {
    switch (peilDatum.format('YYYY-MM-DD')) {
      case periode.periodeStartDatum:
        setGekozenPeilDatumNaam('begin');
        break;
      case dayjs(periode.periodeStartDatum).add(14, 'day').format('YYYY-MM-DD'):
        setGekozenPeilDatumNaam('midden');
        break;
      case periode.periodeEindDatum:
        setGekozenPeilDatumNaam('einde');
        break;
      default:
        setGekozenPeilDatumNaam('');
    }
  }, [peilDatum, periode.periodeEindDatum, periode.periodeStartDatum]);

  const [betalingNamen, setBetalingNamen] = useState<string[]>(inkomstenBudgetten.map(() => 'niets'));
  const handleBetalingNaamChange = (datum: dayjs.Dayjs, index: number, gekozenBetalingNaam: string) => {
    const verwachtBudgetBedrag =
      selectedVisualisatie !== 'Aflossing' ?
        verwachtBudget(datum, formFields.budgetten[index].bedrag) :
        formFields.aflossingen[index].aflossingsBedrag;
    switch (gekozenBetalingNaam) {
      case 'niets':
        handleInputChange(index, '0');
        break;
      case 'minder':
        handleInputChange(index, Math.round(0.5 * verwachtBudgetBedrag).toString());
        break;
      case 'verwacht':
        handleInputChange(index, Math.round(verwachtBudgetBedrag).toString());
        break;
      case 'meer':
        handleInputChange(index, Math.round(1.1 * verwachtBudgetBedrag).toString());
    }
  }
  const verwachtBudget = useCallback((datum: dayjs.Dayjs, budget: number): number => {
    if (selectedVisualisatie !== 'Boodschappen') {
      return budget;
    }
    const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    const dagenTotPeilDatum = datum.diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    return Math.round((dagenTotPeilDatum / periodeLengte) * budget);
  }, [selectedVisualisatie, periode.periodeEindDatum, periode.periodeStartDatum]);

  useEffect(() => {
    let nieuweBetalingNamen = betalingNamen;
    formFields.budgetten.forEach((budget, index) => {
      const verwachtBudgetBedrag = verwachtBudget(peilDatum, budget.bedrag);
      switch (budget.budgetBetaling) {
        case 0:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'niets' : item));
          break;
        case Math.round(0.5 * verwachtBudgetBedrag):
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'minder' : item));
          break;
        case verwachtBudgetBedrag:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'verwacht' : item));
          break;
        case Math.round(1.1 * verwachtBudgetBedrag):
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'meer' : item));
          break;
        default:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? '' : item));
          break;
      }
    });
    setBetalingNamen(nieuweBetalingNamen);
  }, [peilDatum, formFields.budgetten, betalingNamen, verwachtBudget]);

  useEffect(() => {
    let nieuweBetalingNamen = betalingNamen;
    formFields.aflossingen.forEach((aflossing, index) => {
      const verwachtBudgetBedrag = verwachtBudget(peilDatum, aflossing.aflossingsBedrag);
      switch (aflossing.aflossingBetaling) {
        case 0:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'niets' : item));
          break;
        case Math.round(0.5 * verwachtBudgetBedrag):
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'minder' : item));
          break;
        case verwachtBudgetBedrag:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'verwacht' : item));
          break;
        case Math.round(1.1 * verwachtBudgetBedrag):
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? 'meer' : item));
          break;
        default:
          nieuweBetalingNamen = nieuweBetalingNamen.map((item, i) => (i === index ? '' : item));
          break;
      }
    });
    setBetalingNamen(nieuweBetalingNamen);
  }, [peilDatum, formFields.aflossingen, betalingNamen, verwachtBudget]);

  const handleInputChange = (index: number, value: string) => {
    value = value === null || value === undefined || value === '' ? '0' : value;
    if (selectedVisualisatie !== 'Aflossing')
      setFormFields({
        ...formFields,
        budgetten: [
          ...formFields.budgetten.slice(0, index),
          { ...formFields.budgetten[index], budgetBetaling: Math.round(parseFloat(value)) },
          ...formFields.budgetten.slice(index + 1)
        ]
      });
    else
      setFormFields({
        ...formFields,
        aflossingen: [
          ...formFields.aflossingen.slice(0, index),
          { ...formFields.aflossingen[index], aflossingBetaling: Math.round(parseFloat(value)) },
          ...formFields.aflossingen.slice(index + 1)
        ]
      });

  };

  const handleVisualisatieButtonClick = (key: string) => {
    setSelectedVisualisatie(key);
    if (key === 'Inkomsten') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Inkomsten',
        rekeningSoort: 'inkomsten',
        budgetType: BudgetType.vast,
        budgetten: inkomstenBudgetten,
      })
      setBetalingNamen(inkomstenBudgetten.map(() => 'niets'));
    } else if (key === 'Boodschappen') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Boodschappen',
        rekeningSoort: 'uitgaven',
        budgetType: BudgetType.continu,
        budgetten: boodschappenBudgetten,
      });
      setBetalingNamen(boodschappenBudgetten.map(() => 'niets'));
    } else if (key === 'Vaste lasten') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Vaste lasten',
        rekeningSoort: 'uitgaven',
        budgetType: BudgetType.vast,
        budgetten: vastelastenBudgetten,
      })
      setBetalingNamen(vastelastenBudgetten.map(() => 'niets'));
    } else if (key === 'Aflossing') {
      setFormFields({
        ...formFields,
        rekeningNaam: 'Aflossing',
        rekeningSoort: 'aflossing',
        budgetType: BudgetType.vast,
        aflossingen: aflossingen,
      })
      setBetalingNamen(aflossingen.map(() => 'niets'));
    }
  }
  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const handleStandGeneriekChange = (key: string, value: string) => {
    setFormFields({
      ...formFields,
      [key]: value
    });
  }

  return (
    <>
      <Box border={1} borderRadius={2} p={2} mb={5} boxShadow={2} >
        <Typography variant='h6'>Visualisatie experiment voor potjes en budgetten</Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          Met dit formulier kun je de visualisatie van de besteding van een potje, met bijbehorende budgetten, testen.
          (In de praktijk kunnen er meer potjes zijn.)
          Ik hoop met de visualisatie de besteding van een budget in 1 oogopslag inzichtelijk te maken.
          Er is bewust geen legenda, dat geeft mijns inziens meer ruis dan dat het helpt. (Eens?)
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          De app werkt op basis van periodes van een maand, waarbij voor de hulpvrager kan worden ingesteld op welke dag van de maand de periode start.
          Het is bedoeld om te starten vlak voor dat de hulpvrager zijn/haar inkomen ontvangt.
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          De peilDatum zal in het echte gebruik altijd de huidige datum zijn. In dit formulier kun je de peilDatum aanpassen, 'tijdreizen',
          om te zien hoe de visualisatie daardoor verandert. De periode is altijd de huidige periode
        </Typography>
        <Typography variant='body2' sx={{ mb: '8px' }}>
          Reacties en voorstellen voor verbetering zijn meer dan welkom!!!
        </Typography>
        <Typography variant='h6' sx={{ mb: '8px' }}>
          Vaste waarde:
        </Typography>
        <Typography variant='body2'>
          De periode loopt van {dayjs(periode.periodeStartDatum).format('D MMMM')} tot {dayjs(periode.periodeEindDatum).format('D MMMM')}<br />
        </Typography>
        <Typography variant='h6' sx={{ my: '8px' }}>
          Variabele waarden:
        </Typography>
        <Grid container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
          <Grid size={1} >
            <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
              {selectedVisualisatie === 'Aflossing' && 'De visualisatie veronderstelt een betalingsachterstand van € 25,- voor Infomedics.'}
              {selectedVisualisatie === 'Boodschappen' && 'Let op: een tekort op een budget wordt gecompenseerd met een eventueel overschot op een ander budget.'}
            </Typography>
          </Grid>
          <Grid size={1} >
            {['Inkomsten', 'Boodschappen', 'Vaste lasten', 'Aflossing'].map(visualisatie =>
              <Button
                color='success'
                style={{ textTransform: 'none' }}
                sx={{ m: '3px' }}
                key={visualisatie}
                variant={selectedVisualisatie === visualisatie ? 'contained' : 'outlined'}
                onClick={() => handleVisualisatieButtonClick(visualisatie)}
              >
                {visualisatie}
              </Button>)}
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
          <Grid size={1} sx={{ pl: '8px' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"nl"}>
              <DatePicker
                sx={{ color: 'success.main' }}
                slotProps={{ textField: { variant: "standard" } }}
                label="Wat is de peilDatum?"
                value={peilDatum}
                onChange={(newvalue) => handlePeilDatumChange(newvalue ? newvalue : dayjs())}
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={1} >
            {['begin', 'midden', 'einde'].map(positie =>
              <Button
                color='success'
                style={{ textTransform: 'none' }}
                sx={{ p: '3px', m: '3px', fontSize: 11 }}
                size="small"
                key={positie}
                variant={gekozenPeilDatumNaam === positie ? 'contained' : 'outlined'}
                onClick={() => handleGekozenPeilDatumNaam(positie)}>
                {positie}
              </Button>)}
          </Grid>
        </Grid>
        {formFields.rekeningSoort !== 'aflossing' && formFields.budgetten.map((budget, index) =>
          <Grid key={budget.budgetNaam + index} container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
            <Grid size={1} display={'flex'} flexDirection={'row'} alignItems={'center'}>
              <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                {budget.budgetNaam}: {formatAmount(budget.bedrag.toString())}, betaaldag {budget.betaalDag && dagInPeriode(budget.betaalDag, periode).format('D MMMM')}, waarvan er
              </Typography>
              <TextField
                label=""
                sx={{ fontSize: '0.875rem', ml: 1, width: '95px', textAlign: 'right' }}
                variant="standard"
                slotProps={{ inputLabel: { shrink: true, } }}
                id="besteedOpPeilDatum1"
                value={formFields.budgetten[index].budgetBetaling}
                type="number"
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
              <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                is {budget.rekeningSoort === 'inkomsten' ? 'ontvangen' : 'betaald'}.
              </Typography>
            </Grid>
            <Grid size={1} >
              {['niets', 'minder', 'verwacht', 'meer'].map((betalingNaam) =>
                <Button
                  color='success'
                  style={{ textTransform: 'none' }}
                  sx={{ p: '3px', m: '3px', fontSize: 11 }}
                  size="small"
                  key={betalingNaam}
                  variant={betalingNamen[index] === betalingNaam ? 'contained' : 'outlined'}
                  onClick={() => handleBetalingNaamChange(peilDatum, index, betalingNaam)}>
                  {betalingNaam}
                </Button>)}
            </Grid>
          </Grid>
        )}
        {formFields.rekeningSoort === 'aflossing' && formFields.aflossingen.map((aflossing, index) =>
          <Grid key={aflossing.rekening.naam + index} container spacing={2} alignItems="center" columns={2} justifyContent={'start'}>
            <Grid size={1} display={'flex'} flexDirection={'row'} alignItems={'center'}>
              <Typography key={index} variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                {aflossing.rekening.naam}: {formatAmount(aflossing.aflossingsBedrag.toString())}, betaaldag {aflossing.betaalDag && dagInPeriode(aflossing.betaalDag, periode).format('D MMMM')}, waarvan er
              </Typography>
              <TextField
                label=""
                sx={{ fontSize: '0.875rem', ml: 1, width: '95px', textAlign: 'right' }}
                variant="standard"
                slotProps={{ inputLabel: { shrink: true, } }}
                id="besteedOpPeilDatum1"
                value={formFields.aflossingen[index].aflossingBetaling}
                type="number"
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
              <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                is betaald.
              </Typography>
            </Grid>
            <Grid size={1} >
              {['niets', 'minder', 'verwacht', 'meer'].map((betalingNaam) =>
                <Button
                  color='success'
                  style={{ textTransform: 'none' }}
                  sx={{ p: '3px', m: '3px', fontSize: 11 }}
                  size="small"
                  key={betalingNaam}
                  variant={betalingNamen[index] === betalingNaam ? 'contained' : 'outlined'}
                  onClick={() => handleBetalingNaamChange(peilDatum, index, betalingNaam)}>
                  {betalingNaam}
                </Button>)}
            </Grid>
          </Grid>
        )}
      </Box>

      {periode &&
        <>
          {formFields.budgetType === BudgetType.continu &&
            <BudgetContinuGrafiek
              visualisatie={'all'}
              periode={periode}
              peilDatum={peilDatum}
              rekening={{
                ...rekeningTemplate,
                naam: formFields.rekeningNaam,
                rekeningSoort: RekeningSoort.uitgaven,
                budgetType: formFields.budgetType,
              }}
              budgetten={formFields.budgetten.map((budget) => ({
                ...budget,
                budgetBetaling: -(budget.budgetBetaling ?? 0),
              }))} />}
          {formFields.budgetType === BudgetType.vast && formFields.rekeningSoort === 'uitgaven' &&
            <BudgetVastGrafiek
              visualisatie={'all'}
              periode={periode}
              peilDatum={peilDatum}
              rekening={{
                ...rekeningTemplate,
                naam: formFields.rekeningNaam,
                rekeningSoort: RekeningSoort.uitgaven,
                budgetType: formFields.budgetType,
              }}
              budgetten={formFields.budgetten.map((budget) => ({
                ...budget,
                budgetBetaling: -(budget.budgetBetaling ?? 0),
              }))} />}
          {formFields.budgetType === BudgetType.vast && formFields.rekeningSoort === 'inkomsten' &&
            <BudgetInkomstenGrafiek
              visualisatie={'all'}
              periode={periode}
              peilDatum={peilDatum}
              rekening={{
                ...rekeningTemplate,
                naam: 'Inkomsten',
                rekeningSoort: RekeningSoort.inkomsten,
                budgetType: BudgetType.vast,
              }}
              budgetten={formFields.budgetten} />}
          {formFields.rekeningSoort === 'aflossing' &&
            <AflossingGrafiek
              visualisatie={'all'}
              periode={periode}
              peilDatum={peilDatum}
              aflossingen={formFields.aflossingen} 
              geaggregeerdeAflossingen={formFields.aflossingen[0]}
              />}
        </>
      }

      <Grid container marginTop={4} spacing={1} alignItems="center" columns={{ sm: 1, md: 5 }} justifyContent={'start'}>
        <Grid size={1} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
          <InputLabel id="rekening-select-label" sx={{ fontSize: '0.8rem', ml: 1 }}>Rekening</InputLabel>
          <Select
            labelId="rekening-select-label"
            variant="standard"
            id="rekening-select"
            value={formFields.rekeningNaam}
            onChange={(e) => handleStandGeneriekChange('rekeningNaam', e.target.value)}
            sx={{ fontSize: '0.875rem', mr: 5, width: '200px', textAlign: 'right' }}
          >
            {['Samenvatting', 'Inkomsten', 'Boodschappen', 'Vaste lasten', 'Aflossing'].map((rekening) => (
              <MenuItem key={rekening} value={rekening}>
                {rekening}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid size={1} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
          <InputLabel id="status-select-label" sx={{ fontSize: '0.8rem', ml: 1 }}>Kleur</InputLabel>
          <Select
            labelId="status-select-label"
            variant="standard"
            id="status-select"
            value={formFields.status}
            onChange={(e) => handleStandGeneriekChange('status', e.target.value)}
            sx={{ fontSize: '0.875rem', mr: 2, width: '200px', textAlign: 'right' }}
          >
            {['green', 'orange', 'red'].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid size={1} display={'flex'} flexDirection={'row'} alignItems={'center'}>
          <TextField
            label="Percentage gevuld"
            sx={{ fontSize: '0.875rem', ml: 1, width: '200px', textAlign: 'right' }}
            variant="standard"
            slotProps={{ inputLabel: { shrink: true, } }}
            id="besteedOpPeilDatum1"
            value={formFields.percentageFill}
            type="text"
            onChange={(e) => handleStandGeneriekChange('percentageFill', e.target.value)}
          />
        </Grid>
        <Grid size={1} display={'flex'} flexDirection={'row'} alignItems={'center'}>
          <TextField
            label="Body tekst"
            sx={{ fontSize: '0.875rem', ml: 1, width: '300px', textAlign: 'right' }}
            variant="standard"
            slotProps={{ inputLabel: { shrink: true, } }}
            id="besteedOpPeilDatum1"
            value={formFields.bodyText}
            type="text"
            onChange={(e) => handleStandGeneriekChange('bodyText', e.target.value)}
          />
        </Grid>
        <Grid size={1} display={'flex'} flexDirection={'row'} alignItems={'center'}>
          <TextField
            label="Call for action"
            sx={{ fontSize: '0.875rem', ml: 1, width: '300px', textAlign: 'right' }}
            variant="standard"
            slotProps={{ inputLabel: { shrink: true, } }}
            id="besteedOpPeilDatum1"
            value={formFields.cfoText}
            type="text"
            onChange={(e) => handleStandGeneriekChange('cfoText', e.target.value)}
          />
        </Grid>
        {/* <InputLabel id="demo-simple-select-label">Kies de status</InputLabel>
          <Select
            sx={{ fontSize: '0.875rem' }}
            // labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={formFields.status}
            label="Status"
            onChange={(e) => handlegekozenStatusChange(e)}>
            {['green', 'red', 'orange']
              .map((status) => (
                <MenuItem >
                  {status}
                </MenuItem>))}
          </Select> */}
      </Grid>


      <Box marginBottom={2} marginTop={4} display={'flex'} justifyContent={'flex-start'} alignItems={'center'}>
        <StandGeneriekIcon
          status={formFields.status}
          percentageFill={formFields.percentageFill}
          headerText={formFields.rekeningNaam}
          bodyText={formFields.bodyText}
          cfoText={formFields.cfoText} 
          rekeningIconNaam={formFields.rekeningNaam.toLowerCase()}        />
      </Box>
      {/* <Box marginBottom={2} marginTop={4} display={'flex'} justifyContent={'flex-start'} alignItems={'center'}>
        <StandGeneriekIcon
          status={formFields.status}
          rekeningIcon={formFields.rekeningIcon}
          percentageFill={formFields.percentageFill}
          headerText={formFields.rekeningNaam}
          bodyText={formFields.bodyText}
          cfoText={formFields.cfoText}
        />
      </Box> */}
    </>)
}