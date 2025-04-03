import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, useMediaQuery, useTheme, FormGroup, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Tesseract from 'tesseract.js';
import dayjs from 'dayjs';
import 'dayjs/locale/nl'; // Import the Dutch locale
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { BetalingDTO, BetalingvalidatieWrapper } from '../model/Betaling';
import { updateAfbeelding } from '../components/Ocr/UpdateAfbeelding'; // Import the updateAfbeelding function
import { parseText } from '../components/Ocr/ParseTekst';
import { RekeningSelect } from '../components/Rekening/RekeningSelect';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';
import { useNavigate } from 'react-router-dom';
import { Saldo } from '../model/Saldo';
import { Rekening } from '../model/Rekening';
import InkomstenUitgavenTabel from '../components/Betaling/InkomstenUitgavenTabel';
import UpsertBetalingDialoog from '../components/Betaling/UpsertBetalingDialoog';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('nl'); // Set the locale to Dutch

const BanlAppAfbeelding: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ocrData, setOcdData] = useState<string>('');
  const [parsedData, setParsedData] = useState<BetalingDTO[]>([]);
  const [validatedData, setValidatedData] = useState<BetalingvalidatieWrapper>({ betalingen: [] });
  const [groupedData, setGroupedData] = useState<{ [key: string]: BetalingDTO[] }>({});
  const [confidence, setConfidence] = useState<number | null>(null); // Add state for confidence
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Add state for image source
  const [toonAfbeelding, setToonUpdatedAfbeelding] = useState<boolean>(localStorage.getItem('toonUpdatedAfbeelding') === 'true'); // Add state for image source
  // const [updatedImageSrc, setUpdatedImageSrc] = useState<string | null>(null);
  const [ocrBankRekening, setOcrBankRekening] = useState<Rekening | undefined>(undefined);
  const [aantalVerwerkteBetalingen, setAantalVerwerkteBetalingen] = useState<number>(0);

  const aantalBetalingen = validatedData.betalingen.length;

  const { getIDToken } = useAuthContext();
  const { actieveHulpvrager, setSnackbarMessage } = useCustomContext();
  const navigate = useNavigate();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleToonUpdatedAfbeelding = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonUpdatedAfbeelding', event.target.checked.toString());
    setToonUpdatedAfbeelding(event.target.checked);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setParsedData([]);
    setValidatedData({ betalingen: [] });
    setConfidence(null);
    setImageSrc(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageSrc(URL.createObjectURL(file));

      try {
        const updatedFile = await updateAfbeelding(file, ocrBankRekening?.bankNaam);
        // setUpdatedImageSrc(URL.createObjectURL(updatedFile));
        handleFileUpload(updatedFile);
      } catch (error) {
        console.error('Error updating image:', error);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    Tesseract.recognize(
      file,
      'nld', // Change language to Dutch
      {
        // logger: (m) => console.log(m),
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-,.',
        tessedit_char_blacklist: '€',
        tessedit_preserve_interword_spaces: 1 as any,
      } as Partial<Tesseract.WorkerOptions>
    ).then(({ data: { text, confidence } }) => {
      const filteredText = text.replace(/^\d{2}:\d{2}.*\n/, '').trim();
      setOcdData(text + ' <<>> ' + filteredText);
      setConfidence(confidence);
      const parsedData = parseText(filteredText)
        .map((betaling) => ({ ...betaling, bedrag: Math.abs(betaling.bedrag) }));
      setParsedData(parsedData);
      setIsLoading(false);
    }).catch((error) => {
      console.error('OCR error:', error);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    // TODO? - Implement the valideerBetalingen function zonder useEffect?
    const valideerBetalingen = async () => {
      if (actieveHulpvrager && ocrBankRekening && parsedData.length > 0) {
        setIsLoading(true);
        const id = actieveHulpvrager.id
        let token = '';
        try { token = await getIDToken() }
        catch (error) {
          navigate('/login');
        }
        const response = await fetch(`/api/v1/betalingen/hulpvrager/${id}/betalingvalidatie`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            'saldoOpLaatsteBetalingDatum': { 'id': 0, 'rekeningNaam': ocrBankRekening?.naam, 'bedrag': 0 } as Saldo,
            'betalingen': parsedData.map(betaling => ({
              ...betaling,
              boekingsdatum: dayjs(betaling.boekingsdatum).format('YYYY-MM-DD')
            }))
          })
        });
        setIsLoading(false);
        if (response.ok) {
          const result = await response.json();
          setValidatedData({
            'laatsteBetalingDatum': result.laatsteBetalingDatum,
            'saldoOpLaatsteBetalingDatum': result.saldoOpLaatsteBetalingDatum,
            'betalingen': result.betalingen.map((betaling: BetalingDTO) => ({
              ...betaling,
              boekingsdatum: dayjs(betaling.boekingsdatum)
            }))
          })
        } else {
          console.error("Failed to fetch data", response.status);
          setSnackbarMessage({
            message: `De configuratie voor ${actieveHulpvrager.bijnaam} is niet correct.`,
            type: "warning",
          })
        }
      }
    };
    valideerBetalingen();

  }, [ocrBankRekening, parsedData, actieveHulpvrager, getIDToken]);

  const wijzigOcrBankRekening = (bankRekening: Rekening | undefined) => {
    setOcrBankRekening(bankRekening);
  };

  const onBetalingChange = (_sortOrder: string) => {
    // const newValidatedBetalingen = validatedData.betalingen.filter(item => item.sortOrder !== sortOrder)
    // console.log('onBetalingChange', newValidatedBetalingen, ', ', sortOrder);
    setAantalVerwerkteBetalingen(aantalVerwerkteBetalingen + 1);
    // setValidatedData({ ...validatedData, betalingen: newValidatedBetalingen });
  };

  const onBetalingBewaardChange = (sortOrder: string) => {
    console.log('onBetalingBewaardChange', sortOrder);
  }

  const onBetalingVerwijderdChange = (sortOrder: string) => {
    console.log('onBetalingVerwijderdChange', sortOrder);
  }

  useEffect(() => {
    setGroupedData(validatedData.betalingen.reduce((acc, item) => {
      if (!acc[item.boekingsdatum.format('YYYY-MM-DD')]) {
        acc[item.boekingsdatum.format('YYYY-MM-DD')] = [];
      }
      acc[item.boekingsdatum.format('YYYY-MM-DD')].push(item);
      return acc;
    }, {} as { [key: string]: BetalingDTO[] }))
  }, [validatedData]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Bank app afbeelding</Typography>
      <Grid container flexDirection='row' justifyContent="space-between" alignItems="center">
        <RekeningSelect
          wijzigOcrBankNaam={wijzigOcrBankRekening} />
        <Button
          color='success'
          variant="contained"
          component="label"
          disabled={isLoading}
        >
          {isLoading ? 'Verwerken...' : ocrData ? 'Vervang afbeelding' : 'Selecteer afbeelding'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </Button>
      </Grid>
      {validatedData.betalingen.length > 0 &&
        <Grid size={1} alignItems={{ xs: 'start', md: 'end' }} sx={{ mb: '12px', display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <UpsertBetalingDialoog
            editMode={false}
            betaling={undefined}
            onUpsertBetalingClose={() => { }}
            onBetalingBewaardChange={(betalingDTO) => onBetalingBewaardChange(betalingDTO.sortOrder)}
            onBetalingVerwijderdChange={(betalingDTO) => onBetalingVerwijderdChange(betalingDTO.sortOrder)} />
        </Grid>}

      <Grid container flexDirection='row' justifyContent="flex-end" alignItems={'center'}>
        <FormGroup sx={{ ml: 'auto' }} >
          <FormControlLabel control={
            <Switch
              sx={{ transform: 'scale(0.6)' }}
              checked={toonAfbeelding}
              onChange={handleToonUpdatedAfbeelding}
              inputProps={{ 'aria-label': 'controlled' }}
            />}
            label={<VisibilityOutlinedIcon sx={{mt: '4px', color: toonAfbeelding ? 'green' : 'lightgrey'}}/>} />
        </FormGroup>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: toonAfbeelding ? 6 : 12 }}>
          <Typography variant="caption">
            aantal: {aantalBetalingen}, verwerkt: {aantalVerwerkteBetalingen}, te gaan: {aantalBetalingen - aantalVerwerkteBetalingen}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '67vh', md: '80vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
            {validatedData.betalingen.length === 0 && (
              <Typography variant={isXs ? "h5" : isSm ? "h4" : isMdUp ? "h3" : "body1"} width={'50%'} textAlign={'center'} margin='auto' fontWeight={'bold'} color='lightgrey'>
                Hier komen de voorgestelde betalingen zodra de afbeelding is verwerkt
              </Typography>
            )}
            {Object.keys(groupedData).length > 0 && (
              <>
                <InkomstenUitgavenTabel
                  actueleRekening={undefined}
                  isOcr={true}
                  betalingen={validatedData.betalingen}
                  onBetalingBewaardChange={(betalingDTO) => onBetalingChange(betalingDTO.sortOrder)}
                  onBetalingVerwijderdChange={(betalingDTO) => onBetalingChange(betalingDTO.sortOrder)} />
              </>
            )}
          </Box>
        </Grid>
        {toonAfbeelding &&
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '67vh', md: '80vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
              {imageSrc ?
                <img src={imageSrc} alt="OCR" style={{ width: '100%', height: 'auto' }} /> :
                <Typography variant={isXs ? "h5" : isSm ? "h4" : isMdUp ? "h3" : "body1"} width={'50%'} textAlign={'center'} margin='auto' fontWeight={'bold'} color='lightgrey'>
                  Hier komt de afbeelding zodra je die hebt gekozen
                </Typography>}
            </Box>
          </Grid>}

        {/* {toonUpdatedAfbeelding &&
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: { xs: '33vh', md: '67vh' }, overflow: 'auto', alignItems: 'flex-start', border: '1px solid grey', borderRadius: '5px' }}>
              {updatedImageSrc ?
                <img src={updatedImageSrc} alt="OCR" style={{ width: '100%', height: 'auto' }} /> :
                <Typography variant={isXs ? "h5" : isSm ? "h4" : isMdUp ? "h3" : "body1"} width={'50%'} textAlign={'center'} margin='auto' fontWeight={'bold'} color='lightgrey'>
                  Hier komt de aangepaste afbeelding zodra is verwerkt
                </Typography>}
            </Box>
          </Grid>} */}

      </Grid>
      {/* {ocrData &&
        <Accordion >
          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
            <Typography variant="caption">OCR ruwe data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption">
              {ocrData}
            </Typography>
          </AccordionDetails>
        </Accordion>}
      {validatedData &&
        <Accordion >
          <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
            <Typography variant="caption">ValidatedData</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {validatedData.betalingen.map((betaling, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="caption">{betaling.boekingsdatum.format('D MMMM')} {betaling.ocrOmschrijving} {betaling.bedrag} {betaling.bestaatAl ? `bestaat al met omschrijving ${betaling.omschrijving}` : 'bestaat nog niet'}  </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>} */}
      <Typography variant="body2" sx={{ mt: 1 }}>
        {confidence && toonAfbeelding ? `OCR vertrouwen: ${confidence.toFixed(2)}%` : ''}
      </Typography>
    </Box>
  );
};

export default BanlAppAfbeelding;