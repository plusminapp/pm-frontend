import { useEffect, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Import Grid2
import { BetalingsSoort, betalingsSoort2Categorie, betalingsSoortFormatter, internBetalingsSoorten, uitgavenBetalingsSoorten } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';
import { InternIcon } from '../../icons/Intern';
import { InkomstenIcon } from '../../icons/Inkomsten';
import { UitgavenIcon } from '../../icons/Uitgaven';
import { RekeningGroepDTO } from '../../model/RekeningGroep';
import { RekeningDTO } from '../../model/Rekening';

type BetalingsSoortSelectProps = {
  betalingsSoort: BetalingsSoort | undefined;
  rekeningGroep: RekeningGroepDTO | undefined;
  rekening: RekeningDTO | undefined;
  betaalMethode: RekeningDTO | undefined;
  onBetalingsSoortChange: (betalingsSoort: BetalingsSoort | undefined, rekeningGroep: RekeningGroepDTO | undefined, rekening: RekeningDTO | undefined, betaalMethode: RekeningDTO | undefined) => void;
};

const BetalingsSoortSelect = (props: BetalingsSoortSelectProps) => {
  const { rekeningGroepPerBetalingsSoort } = useCustomContext();

  const [selectedCategorie, setSelectedCategorie] = useState<string | undefined>(betalingsSoort2Categorie(props.betalingsSoort));
  const [selectedBetalingsSoort, setSelectedBetalingsSoort] = useState<BetalingsSoort | undefined>(props.betalingsSoort);
  const [selectedRekeningGroep, setSelectedRekeningGroep] = useState<RekeningGroepDTO | undefined>(props.rekeningGroep);
  const [selectedRekening, setSelectedRekening] = useState<RekeningDTO | undefined>(props.rekening);
  const [selectedBetaalMethode, setSelectedBetaalMethode] = useState<RekeningDTO | undefined>(props.betaalMethode);

  useEffect(() => {
    setSelectedCategorie(betalingsSoort2Categorie(props.betalingsSoort));
    setSelectedBetalingsSoort(props.betalingsSoort);
    setSelectedRekeningGroep(props.rekeningGroep);
    setSelectedRekening(props.rekening);
  }, [props.betalingsSoort, props.rekeningGroep, props.rekening, props.betaalMethode]);

  const categorie2DefaultBetalingsSoort = (categorie: string): BetalingsSoort | undefined => {
    if (categorie === 'INKOMSTEN') return BetalingsSoort.inkomsten;
    if (categorie === 'UITGAVEN') return BetalingsSoort.uitgaven;
    if (categorie === 'INTERN' && rekeningGroepPerBetalingsSoort.filter(rgpb => rgpb.betalingsSoort === BetalingsSoort.incasso_creditcard).length > 0) return BetalingsSoort.incasso_creditcard;
    if (categorie === 'INTERN' && rekeningGroepPerBetalingsSoort.filter(rgpb => rgpb.betalingsSoort === BetalingsSoort.opnemen_spaarrekening).length > 0) return BetalingsSoort.opnemen_spaarrekening;
    if (categorie === 'INTERN' && rekeningGroepPerBetalingsSoort.filter(rgpb => rgpb.betalingsSoort === BetalingsSoort.opnemen_contant).length > 0) return BetalingsSoort.opnemen_contant;
    return undefined;
  }

  const countIntersection = <T,>(arr1: T[], arr2: T[]): number => {
    const set1 = new Set(arr1);
    return arr2.filter(item => set1.has(item)).length;
  };

  const handleCategorieClick = (categorie: string) => {
    if (selectedCategorie === categorie) {
      setSelectedCategorie(undefined);
      handleBetalingsSoortClick(undefined);
    } else {
      setSelectedCategorie(categorie);
      handleBetalingsSoortClick(categorie2DefaultBetalingsSoort(categorie));
    }
  };

  const handleBetalingsSoortClick = (betalingsSoort: BetalingsSoort | undefined) => {
    console.log('handleBetalingsSoortChange', betalingsSoort);
    if (betalingsSoort === undefined || selectedBetalingsSoort?.toString() === betalingsSoort.toString()) {
      setSelectedCategorie(undefined);
      setSelectedBetalingsSoort(undefined);
      setSelectedRekeningGroep(undefined);
      setSelectedRekening(undefined);
      props.onBetalingsSoortChange(undefined, undefined, undefined, undefined);
    } else {
      const newBetalingsSoort = betalingsSoort;
      const newRekeningGroep = rekeningGroepPerBetalingsSoort.filter(rgpb => rgpb.betalingsSoort === newBetalingsSoort)[0].rekeningGroepen[0];
      const newRekening = newRekeningGroep.rekeningen[0];
      const newBetaalMethode = newRekening.betaalMethoden ? newRekening.betaalMethoden[0] : undefined

      setSelectedCategorie(betalingsSoort2Categorie(newBetalingsSoort));
      setSelectedBetalingsSoort(newBetalingsSoort);
      setSelectedRekeningGroep(newRekeningGroep);
      setSelectedRekening(newRekening);
      setSelectedBetaalMethode(newBetaalMethode);
      props.onBetalingsSoortChange(newBetalingsSoort, newRekeningGroep, newRekening, newBetaalMethode);
    }
  };

  const handleRekeningGroepClick = (rekeningGroepNaam: string) => {
    const newRekeningGroep = rekeningGroepPerBetalingsSoort
      .find(rgpb => rgpb.betalingsSoort === selectedBetalingsSoort)?.rekeningGroepen.find(rg => rg.naam === rekeningGroepNaam);
    const newRekening = newRekeningGroep?.rekeningen[0];
    const newBetaalMethode = newRekening?.betaalMethoden ? newRekening.betaalMethoden[0] : undefined

    setSelectedRekeningGroep(newRekeningGroep);
    setSelectedRekening(newRekening);
    setSelectedBetaalMethode(newBetaalMethode);

    props.onBetalingsSoortChange(selectedBetalingsSoort, newRekeningGroep, newRekening, newBetaalMethode);
  };

  const handleRekeningClick = (rekeningNaam: string) => {
    const newRekening = selectedRekeningGroep?.rekeningen
      .find(r => r.naam === rekeningNaam);
    const newBetaalMethode = newRekening?.betaalMethoden ? newRekening.betaalMethoden[0] : undefined

    setSelectedRekening(newRekening);
    setSelectedBetaalMethode(newBetaalMethode);
    props.onBetalingsSoortChange(selectedBetalingsSoort, selectedRekeningGroep, newRekening, selectedBetaalMethode);
  };

  const handleBetaalMethodeClick = (betaalMethodeNaam: string) => {
    const newBetaalMethode = selectedRekening?.betaalMethoden?.find(bm => bm.naam === betaalMethodeNaam);

    setSelectedBetaalMethode(newBetaalMethode);
    props.onBetalingsSoortChange(selectedBetalingsSoort, selectedRekeningGroep, selectedRekening, newBetaalMethode);
  };

  const creeerBronBestemmingTekst = (): string => {
    let bron, bestemming;
    switch (selectedBetalingsSoort) {
      case BetalingsSoort.opnemen_spaarrekening:
      case BetalingsSoort.storten_contant:
        bron = selectedRekening?.naam;
        bestemming = selectedBetaalMethode?.naam;
        break;
      default:
        bron = selectedBetaalMethode?.naam;
        bestemming = selectedRekening?.naam;
        break;
    };
    return `van ${bron} naar ${bestemming}`;
  };

  return (
    <div>
      <Grid container spacing={5} justifyContent="center">
        <Box>
          <Button
            color='success'
            variant={selectedCategorie === 'INKOMSTEN' ? 'contained' : 'outlined'}
            onClick={() => handleCategorieClick('INKOMSTEN')}
          >
            <InkomstenIcon color={selectedCategorie === 'INKOMSTEN' ? 'white' : 'success'} />
          </Button>
          <Typography fontSize={11} color="textSecondary" textAlign={'center'} sx={{ mt: 1 }}>
            Inkomsten
          </Typography>
        </Box>
        {countIntersection(internBetalingsSoorten, rekeningGroepPerBetalingsSoort.map(rgpb => rgpb.betalingsSoort)) > 0 &&
          <Box>
            <Button
              color='success'
              variant={selectedCategorie === 'INTERN' ? 'contained' : 'outlined'}
              onClick={() => handleCategorieClick('INTERN')}
            >
              <InternIcon color={selectedCategorie === 'INTERN' ? 'white' : 'success'} />
            </Button>
            <Typography fontSize={11} color="textSecondary" textAlign={'center'} sx={{ mt: 1 }}>
              Intern
            </Typography>
          </Box>
        }
        <Box>
          <Button
            color='success'
            variant={selectedCategorie === 'UITGAVEN' ? 'contained' : 'outlined'}
            onClick={() => handleCategorieClick('UITGAVEN')}
          >
            <UitgavenIcon color={selectedCategorie === 'UITGAVEN' ? 'white' : 'success'} />
          </Button>
          <Typography fontSize={11} color="textSecondary" textAlign={'center'} sx={{ mt: 1 }}>
            Uitgaven
          </Typography>
        </Box>
      </Grid>

      {selectedCategorie === 'INKOMSTEN' && (
        <>
          <Box mt={2}>
            {rekeningGroepPerBetalingsSoort
              .filter(rgpb => rgpb.betalingsSoort.toString().toLowerCase() === 'inkomsten')
              .map((rgpb) =>
                <>
                  <Grid container spacing={2} justifyContent={"center"}>
                    {rgpb && rgpb.rekeningGroepen.length > 1 && (
                      <>
                        {rgpb && rgpb.rekeningGroepen.map((rekeningGroep, index) => (
                          <Button
                            key={rekeningGroep.id + index}
                            color='success'
                            style={{ textTransform: 'none' }}
                            sx={{ mb: '13px' }}
                            variant={selectedRekeningGroep?.naam === rekeningGroep.naam ? 'contained' : 'outlined'}
                            onClick={() => handleRekeningGroepClick(rekeningGroep.naam)}
                          >
                            {rekeningGroep.naam}
                          </Button>
                        ))}
                      </>
                    )}
                  </Grid>
                  <Grid container spacing={2} display={'flex'} justifyContent={"center"}>
                    {rgpb.rekeningGroepen
                      .filter(rg => rg.naam === selectedRekeningGroep?.naam)
                      .map(rg => rg.rekeningen.map(rekening =>
                        <Button
                          color='success'
                          style={{ textTransform: 'none' }}
                          sx={{ p: '3px', fontSize: rgpb.rekeningGroepen.length > 1 ? 11 : undefined }}
                          variant={selectedRekening?.naam === rekening.naam ? 'contained' : 'outlined'}
                          onClick={() => handleRekeningClick(rekening.naam)}
                        >
                          {rekening.naam}
                        </Button>
                      ))}
                  </Grid>
                  {rgpb.rekeningGroepen
                    .filter(rg => rg.naam === selectedRekeningGroep?.naam)
                    .map(rg => rg.rekeningen
                      .filter(r => r.naam === selectedRekening?.naam)
                      .map(rekening =>
                      (rekening.betaalMethoden && rekening.betaalMethoden.length > 1 &&
                        <>
                          <Typography textAlign={"center"} fontSize={"12px"} color='grey' marginTop={"12px"}>
                            Betaalmethode</Typography>
                          <Grid container spacing={2} justifyContent={"center"}>
                            {rekening.betaalMethoden.map((betaalMethode) =>
                              <Button
                                color='success'
                                style={{ textTransform: 'none' }}
                                sx={{ mt: '3px', p: '3px', fontSize: 11 }}
                                variant={selectedBetaalMethode?.naam === betaalMethode.naam ? 'contained' : 'outlined'}
                                onClick={() => handleBetaalMethodeClick(betaalMethode.naam)}
                              >
                                {betaalMethode.naam}
                              </Button>
                            )}
                          </Grid>
                        </>
                      )))}
                </>
              )
            }
          </Box>
        </>
      )}

      {selectedCategorie === 'UITGAVEN' && (
        <>
          <Box mt={2}>
            {rekeningGroepPerBetalingsSoort
              .filter(rgpb => uitgavenBetalingsSoorten.includes(rgpb.betalingsSoort))
              .map((rgpb) =>
                <>
                  <Grid container spacing={2} justifyContent={"center"}>
                    {rgpb && rgpb.rekeningGroepen.length > 1 && (
                      <>
                        {rgpb && rgpb.rekeningGroepen.map((rekeningGroep, index) => (
                          <Button
                            key={rekeningGroep.id + index}
                            color='success'
                            style={{ textTransform: 'none' }}
                            sx={{ mb: '13px' }}
                            variant={selectedRekeningGroep?.naam === rekeningGroep.naam ? 'contained' : 'outlined'}
                            onClick={() => handleRekeningGroepClick(rekeningGroep.naam)}
                          >
                            {rekeningGroep.naam}
                          </Button>
                        ))}
                      </>
                    )}
                  </Grid>
                  <Grid container spacing={2} display={'flex'} justifyContent={"center"}>
                    {rgpb.rekeningGroepen
                      .filter(rg => rg.naam === selectedRekeningGroep?.naam)
                      .map(rg => rg.rekeningen.map(rekening =>
                        <Button
                          color='success'
                          style={{ textTransform: 'none' }}
                          sx={{ p: '3px', fontSize: 11 }}
                          variant={selectedRekening?.naam === rekening.naam ? 'contained' : 'outlined'}
                          onClick={() => handleRekeningClick(rekening.naam)}
                        >
                          {rekening.naam}
                        </Button>
                      ))}
                  </Grid>
                  {rgpb.rekeningGroepen
                    .filter(rg => rg.naam === selectedRekeningGroep?.naam)
                    .map(rg => rg.rekeningen
                      .filter(r => r.naam === selectedRekening?.naam)
                      .map(rekening =>
                      (rekening.betaalMethoden && rekening.betaalMethoden.length > 1 &&
                        <>
                          <Typography textAlign={"center"} fontSize={"12px"} color='grey' marginTop={"12px"}>
                            Betaalmethode</Typography>
                          <Grid container spacing={2} justifyContent={"center"}>
                            {rekening.betaalMethoden.map((betaalMethode) =>
                              <Button
                                color='success'
                                style={{ textTransform: 'none' }}
                                sx={{ mt: '3px', p: '3px', fontSize: 11 }}
                                variant={selectedBetaalMethode?.naam === betaalMethode.naam ? 'contained' : 'outlined'}
                                onClick={() => handleBetaalMethodeClick(betaalMethode.naam)}
                              >
                                {betaalMethode.naam}
                              </Button>
                            )}
                          </Grid>
                        </>
                      )))}
                </>
              )
            }
          </Box>
        </>
      )}
      {selectedCategorie === 'INTERN' && (
        <>
          <Box mt={2}>
            <Grid container spacing={2} display={'flex'} flexDirection={'row'} justifyContent={"center"}>
              {rekeningGroepPerBetalingsSoort
                .filter(rgpb => internBetalingsSoorten.includes(rgpb.betalingsSoort))
                .map((rgpb, index) =>
                  <Button
                    key={rgpb.betalingsSoort + index}
                    color='success'
                    style={{ textTransform: 'none' }}
                    sx={{ mb: '3px' }}
                    variant={selectedBetalingsSoort === rgpb.betalingsSoort ? 'contained' : 'outlined'}
                    onClick={() => handleBetalingsSoortClick(rgpb.betalingsSoort)}
                  >
                    {betalingsSoortFormatter(rgpb.betalingsSoort.toString())}
                  </Button>
                )
              }
            </Grid>
          </Box>
        </>
      )}

      {selectedCategorie && selectedCategorie !== 'INTERN' && selectedBetalingsSoort &&
        <Typography textAlign={"center"} fontSize={"12px"} color='grey' marginTop={"12px"}>
          {selectedRekeningGroep?.naam}:&nbsp;
          {selectedRekening?.naam} betaald {selectedBetalingsSoort === 'INKOMSTEN' ? ' naar ' : ' met '}
          {selectedBetaalMethode?.naam}
        </Typography>
      }
      {selectedCategorie && selectedCategorie === 'INTERN' && selectedBetalingsSoort &&
        <Typography textAlign={"center"} fontSize={"12px"} color='grey' marginTop={"12px"}>
          {betalingsSoortFormatter(selectedBetalingsSoort.toString())}:&nbsp;
          {creeerBronBestemmingTekst()}
        </Typography>
      }
    </div>
  );
};

export default BetalingsSoortSelect;