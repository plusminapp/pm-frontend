import React, { useEffect, useState } from 'react';
import {
  Button,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  FormGroup,
  FormControlLabel,
  Switch,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Tesseract from 'tesseract.js';
import dayjs from 'dayjs';
import 'dayjs/locale/nl'; // Import the Dutch locale
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { BetalingDTO, BetalingvalidatieWrapper } from '../model/Betaling';
import { updateAfbeelding } from '../components/Kasboek/Ocr/UpdateAfbeelding';
import { parseTekst } from '../components/Kasboek/Ocr/ParseTekst';
import { parseTekstCR } from '../components/Kasboek/Ocr/ParseTekstCR';
import { RekeningSelect } from '../components/Rekening/RekeningSelect';
import { useAuthContext } from '@asgardeo/auth-react';
import { useCustomContext } from '../context/CustomContext';
import { useNavigate } from 'react-router-dom';
import { SaldoDTO } from '../model/Saldo';
import InkomstenUitgavenTabel from '../components/Kasboek/InkomstenUitgavenTabel';
import UpsertBetalingDialoog from '../components/Kasboek/UpsertBetalingDialoog';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { RekeningDTO } from '../model/Rekening';
import { usePlusminApi } from '../api/plusminApi';
import { DateFormats } from '../util/date-formats';

dayjs.extend(customParseFormat); // Extend dayjs with the customParseFormat plugin
dayjs.locale('nl'); // Set the locale to Dutch

const BankAppAfbeelding: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ocrData, setOcdData] = useState<string>('');
  const [parsedData, setParsedData] = useState<BetalingDTO[]>([]);
  const [validatedData, setValidatedData] = useState<BetalingvalidatieWrapper>({
    betalingen: [],
  });
  const [groupedData, setGroupedData] = useState<{
    [key: string]: BetalingDTO[];
  }>({});
  const [confidence, setConfidence] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [toonAfbeelding, setToonUpdatedAfbeelding] = useState<boolean>(
    localStorage.getItem('toonUpdatedAfbeelding') === 'true',
  ); // Add state for image source
  const [updatedImageSrc, setUpdatedImageSrc] = useState<string | null>(null);
  const [ocrBankRekening, setOcrBankRekening] = useState<
    RekeningDTO | undefined
  >(undefined);
  const [aantalVerwerkteBetalingen, setAantalVerwerkteBetalingen] =
    useState<number>(0);

  const aantalBetalingen = validatedData.betalingen.length;

  const { getAccessToken } = useAuthContext();
  const { actieveAdministratie, setSnackbarMessage , vandaag} = useCustomContext();
  const navigate = useNavigate();
  const { putBetalingValidatie } = usePlusminApi();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleToonUpdatedAfbeelding = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    localStorage.setItem(
      'toonUpdatedAfbeelding',
      event.target.checked.toString(),
    );
    setToonUpdatedAfbeelding(event.target.checked);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setParsedData([]);
    setValidatedData({ betalingen: [] });
    setConfidence(null);
    setImageSrc(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageSrc(URL.createObjectURL(file));

      try {
        const updatedFile = await updateAfbeelding(
          file,
          ocrBankRekening?.bankNaam,
        );
        setUpdatedImageSrc(URL.createObjectURL(updatedFile));
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
        tessedit_char_whitelist:
          '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-,.',
        tessedit_char_blacklist: '€',
        tessedit_preserve_interword_spaces: 1,
      } as Partial<Tesseract.WorkerOptions>,
    )
      .then(({ data: { text, confidence } }) => {
        const filteredText = text.replace(/^\d{2}:\d{2}.*\n/, '').trim();
        setOcdData(filteredText);
        setConfidence(confidence);
        const parsedData = ocrBankRekening?.bankNaam === 'CR'
        ? parseTekstCR(filteredText, vandaag).map((betaling: BetalingDTO) => ({
          ...betaling,
          bedrag: Math.abs(betaling.bedrag),
        }))
        : parseTekst(filteredText, vandaag).map((betaling: BetalingDTO) => ({
          ...betaling,
          bedrag: Math.abs(betaling.bedrag),
        }));
        setParsedData(parsedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('OCR error:', error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // TODO? - Implement the valideerBetalingen function zonder useEffect?
    const valideerBetalingen = async () => {
      let token = '';
      try {
        token = await getAccessToken();
      } catch {
        navigate('/login');
      }
      if (
        actieveAdministratie &&
        ocrBankRekening &&
        token &&
        parsedData.length > 0
      ) {
        setIsLoading(true);
        const saldoOpLaatsteBetalingDatum = {
          id: 0,
          rekeningNaam: ocrBankRekening?.naam,
          bedrag: 0,
        } as unknown as SaldoDTO;
        const betalingen = parsedData
          .filter((betaling) => betaling.bedrag !== null)
          .map((betaling) => ({
            ...betaling,
            boekingsdatum: dayjs(betaling.boekingsdatum).format('YYYY-MM-DD'),
          }));
        try {
          const response = await putBetalingValidatie(
            actieveAdministratie,
            saldoOpLaatsteBetalingDatum,
            betalingen,
          );
          setIsLoading(false);
          setValidatedData({
            laatsteBetalingDatum: response.laatsteBetalingDatum,
            saldoOpLaatsteBetalingDatum: response.saldoOpLaatsteBetalingDatum,
            betalingen: response.betalingen.map((betaling: BetalingDTO) => ({
              ...betaling,
              boekingsdatum: dayjs(betaling.boekingsdatum).format(
                DateFormats.YYYY_MM_DD,
              ),
            })),
          });
        } catch (error) {
          console.error('Failed to fetch data', error);
          setSnackbarMessage({
            message: `De configuratie voor ${actieveAdministratie.naam} is niet correct.`,
            type: 'warning',
          });
        }
      }
    };
    valideerBetalingen();
  }, [
    ocrBankRekening,
    parsedData,
    actieveAdministratie,
    navigate,
    setSnackbarMessage,
    getAccessToken,
    putBetalingValidatie,
  ]);

  const wijzigOcrBankRekening = (bankRekening: RekeningDTO | undefined) => {
    setOcrBankRekening(bankRekening);
  };

  const onBetalingBewaardChange = () => {
    setAantalVerwerkteBetalingen(aantalVerwerkteBetalingen + 1);
  };

  const onBetalingVerwijderdChange = (sortOrder: string) => {
    setAantalVerwerkteBetalingen(aantalVerwerkteBetalingen + 1);
    console.log('onBetalingVerwijderdChange', sortOrder);
  };

  useEffect(() => {
    setGroupedData(
      validatedData.betalingen.reduce(
        (acc, item) => {
          if (!acc[item.boekingsdatum]) {
            acc[item.boekingsdatum] = [];
          }
          acc[item.boekingsdatum].push(item);
          return acc;
        },
        {} as { [key: string]: BetalingDTO[] },
      ),
    );
  }, [validatedData]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Bank app afbeelding
      </Typography>
      <Grid
        container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <RekeningSelect wijzigOcrBankNaam={wijzigOcrBankRekening} />
        <Button
          color="success"
          variant="contained"
          component="label"
          disabled={isLoading}
        >
          {isLoading
            ? 'Verwerken...'
            : ocrData
              ? 'Vervang afbeelding'
              : 'Selecteer afbeelding'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </Button>
      </Grid>
      {validatedData.betalingen.length > 0 && (
        <Grid
          size={1}
          alignItems={{ xs: 'start', md: 'end' }}
          sx={{
            mb: '12px',
            display: 'flex',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
          }}
        >
          <UpsertBetalingDialoog
            editMode={false}
            betaling={undefined}
            onUpsertBetalingClose={() => {}}
            onBetalingBewaardChange={onBetalingBewaardChange}
            onBetalingVerwijderdChange={(betalingDTO) =>
              onBetalingVerwijderdChange(betalingDTO.sortOrder)
            }
          />
        </Grid>
      )}

      <Grid
        container
        flexDirection="row"
        justifyContent="flex-end"
        alignItems={'center'}
      >
        <FormGroup sx={{ ml: 'auto' }}>
          <FormControlLabel
            control={
              <Switch
                sx={{ transform: 'scale(0.6)' }}
                checked={toonAfbeelding}
                onChange={handleToonUpdatedAfbeelding}
                slotProps={{ input: { 'aria-label': 'controlled' } }}
              />
            }
            label={
              <VisibilityOutlinedIcon
                sx={{
                  mt: '4px',
                  color: toonAfbeelding ? 'green' : 'lightgrey',
                }}
              />
            }
          />
        </FormGroup>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: toonAfbeelding ? 6 : 12 }}>
          <Typography variant="caption">
            aantal: {aantalBetalingen}, verwerkt: {aantalVerwerkteBetalingen},
            te gaan: {aantalBetalingen - aantalVerwerkteBetalingen}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              height: { xs: '67vh', md: '80vh' },
              overflow: 'auto',
              alignItems: 'flex-start',
              border: '1px solid grey',
              borderRadius: '5px',
            }}
          >
            {validatedData.betalingen.length === 0 && (
              <Typography
                variant={isXs ? 'h5' : isSm ? 'h4' : isMdUp ? 'h3' : 'body1'}
                width={'50%'}
                textAlign={'center'}
                margin="auto"
                fontWeight={'bold'}
                color="lightgrey"
              >
                Hier komen de voorgestelde betalingen zodra de afbeelding is
                verwerkt
              </Typography>
            )}
            {Object.keys(groupedData).length > 0 && (
              <>
                <InkomstenUitgavenTabel
                  actueleRekeningGroep={undefined}
                  isOcr={true}
                  betalingen={validatedData.betalingen}
                  onBetalingBewaardChange={onBetalingBewaardChange}
                  onBetalingVerwijderdChange={(betalingDTO) =>
                    onBetalingVerwijderdChange(betalingDTO.sortOrder)
                  }
                />
              </>
            )}
          </Box>
        </Grid>
        {toonAfbeelding && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                height: { xs: '67vh', md: '80vh' },
                overflow: 'auto',
                alignItems: 'flex-start',
                border: '1px solid grey',
                borderRadius: '5px',
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="OCR"
                  style={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <Typography
                  variant={isXs ? 'h5' : isSm ? 'h4' : isMdUp ? 'h3' : 'body1'}
                  width={'50%'}
                  textAlign={'center'}
                  margin="auto"
                  fontWeight={'bold'}
                  color="lightgrey"
                >
                  Hier komt de afbeelding zodra je die hebt gekozen
                </Typography>
              )}
            </Box>
          </Grid>
        )}

        {toonAfbeelding && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                height: { xs: '33vh', md: '67vh' },
                overflow: 'auto',
                alignItems: 'flex-start',
                border: '1px solid grey',
                borderRadius: '5px',
              }}
            >
              {updatedImageSrc ? (
                <img
                  src={updatedImageSrc}
                  alt="OCR"
                  style={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <Typography
                  variant={isXs ? 'h5' : isSm ? 'h4' : isMdUp ? 'h3' : 'body1'}
                  width={'50%'}
                  textAlign={'center'}
                  margin="auto"
                  fontWeight={'bold'}
                  color="lightgrey"
                >
                  Hier komt de aangepaste afbeelding zodra is verwerkt
                </Typography>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {confidence && toonAfbeelding
          ? `OCR vertrouwen: ${confidence.toFixed(2)}%`
          : ''}
        {/* GroupedData: {JSON.stringify(groupedData)} */}
        ParsedDate: {JSON.stringify(parsedData)}
      </Typography>
    </Box>
  );
};

export default BankAppAfbeelding;
