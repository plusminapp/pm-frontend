import { Fragment, useEffect, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Import Grid2
import { bestemmingBetalingsSoorten, BetalingDTO, BetalingsSoort, betalingsSoort2Categorie, betalingsSoortFormatter, internBetalingsSoorten, uitgavenBetalingsSoorten } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';
import { InternIcon } from '../../icons/Intern';
import { InkomstenIcon } from '../../icons/Inkomsten';
import { UitgavenIcon } from '../../icons/Uitgaven';
import { RekeningGroepDTO, RekeningGroepPerBetalingsSoort, RekeningGroepSoort } from '../../model/RekeningGroep';
import { RekeningDTO } from '../../model/Rekening';
import { SaldoDTO } from '../../model/Saldo';

type BetalingsSoortSelectProps = {
  betaling: BetalingDTO | undefined;
  onBetalingsChange: (betalingsSoort: BetalingsSoort | undefined, bron: string | undefined, bestemming: string | undefined) => void;
};

const BetalingsSoortSelect = (props: BetalingsSoortSelectProps) => {
  const { rekeningGroepPerBetalingsSoort, stand } = useCustomContext();

  const [selectedCategorie, setSelectedCategorie] = useState<string | undefined>(betalingsSoort2Categorie(props.betaling?.betalingsSoort));
  const [selectedBetalingsSoort, setSelectedBetalingsSoort] = useState<BetalingsSoort | undefined>(props.betaling?.betalingsSoort);
  const [selectedRekeningGroep, setSelectedRekeningGroep] = useState<RekeningGroepDTO | undefined>(undefined);
  const [selectedRekening, setSelectedRekening] = useState<RekeningDTO | undefined>(undefined);
  const [selectedBetaalMethode, setSelectedBetaalMethode] = useState<RekeningDTO | undefined>(undefined);

  const [sparenSaldi, setSparenSaldi] = useState<SaldoDTO[]>([]);

  useEffect(() => {
    if (stand) {
      setSparenSaldi(
        stand.resultaatOpDatum.filter((r) => r.rekeningGroepSoort === RekeningGroepSoort.spaarrekening)
      );
    }
  }, [stand]);


  useEffect(() => {
    if (props.betaling) {
      const rekeningGroepen = rekeningGroepPerBetalingsSoort.find(rgpb => rgpb.betalingsSoort === props.betaling?.betalingsSoort)?.rekeningGroepen;
      const rekening = props.betaling?.betalingsSoort && bestemmingBetalingsSoorten.includes(props.betaling.betalingsSoort) ?
        rekeningGroepen?.find(rg => rg.rekeningen.some(r => r.naam === props.betaling?.bron))?.rekeningen.find(r => r.naam === props.betaling?.bron) :
        rekeningGroepen?.find(rg => rg.rekeningen.some(r => r.naam === props.betaling?.bestemming))?.rekeningen.find(r => r.naam === props.betaling?.bestemming)
      const betaalMethode = props.betaling?.betalingsSoort && bestemmingBetalingsSoorten.includes(props.betaling.betalingsSoort) ?
        rekening?.betaalMethoden?.find(bm => bm.naam === props.betaling?.bestemming) :
        rekening?.betaalMethoden?.find(bm => bm.naam === props.betaling?.bron)
      const rekeningGroep = rekeningGroepen?.find(rg => rekening?.rekeningGroepNaam === rg.naam);
      setSelectedBetalingsSoort(props.betaling.betalingsSoort);
      setSelectedCategorie(betalingsSoort2Categorie(props.betaling.betalingsSoort));
      setSelectedRekeningGroep(rekeningGroep);
      setSelectedRekening(rekening);
      setSelectedBetaalMethode(betaalMethode);
    }
  }, [props.betaling, rekeningGroepPerBetalingsSoort]);

  const categorie2DefaultBetalingsSoort = (categorie: string): BetalingsSoort | undefined => {
    if (categorie === 'INKOMSTEN') return BetalingsSoort.inkomsten;
    if (categorie === 'UITGAVEN') return BetalingsSoort.uitgaven;
    if (categorie === 'INTERN' && rekeningGroepPerBetalingsSoort.filter(rgpb => rgpb.betalingsSoort === BetalingsSoort.incasso_creditcard).length > 0) return BetalingsSoort.incasso_creditcard;
    if (categorie === 'INTERN' && rekeningGroepPerBetalingsSoort.filter(rgpb => rgpb.betalingsSoort === BetalingsSoort.opnemen).length > 0) return BetalingsSoort.opnemen;
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
    if (betalingsSoort === undefined || selectedBetalingsSoort?.toString() === betalingsSoort.toString()) {
      setSelectedCategorie(undefined);
      setSelectedBetalingsSoort(undefined);
      setSelectedRekeningGroep(undefined);
      setSelectedRekening(undefined);
      props.onBetalingsChange(undefined, undefined, undefined);
    } else {
      const newBetalingsSoort = betalingsSoort;
      const newRekeningGroep = rekeningGroepPerBetalingsSoort.filter(rgpb => rgpb.betalingsSoort === newBetalingsSoort)[0].rekeningGroepen[0];
      const newRekening = newRekeningGroep.rekeningen[0];
      const newBetaalMethode = newRekening.betaalMethoden ? newRekening.betaalMethoden[0] : undefined

      const newBron = bestemmingBetalingsSoorten.includes(newBetalingsSoort) ? newRekening.naam : newBetaalMethode?.naam;
      const newBestemming = bestemmingBetalingsSoorten.includes(newBetalingsSoort) ? newBetaalMethode?.naam : newRekening.naam;

      setSelectedCategorie(betalingsSoort2Categorie(newBetalingsSoort));
      setSelectedBetalingsSoort(newBetalingsSoort);
      setSelectedRekeningGroep(newRekeningGroep);
      setSelectedRekening(newRekening);
      setSelectedBetaalMethode(newBetaalMethode);
      props.onBetalingsChange(newBetalingsSoort, newBron, newBestemming);
    }
  };

  const handleRekeningGroepClick = (rekeningGroepNaam: string) => {
    const newBetalingsSoort = rekeningGroepPerBetalingsSoort
      .find(rgpb => rgpb.rekeningGroepen.some(rg => rg.naam === rekeningGroepNaam))?.betalingsSoort;
    const newRekeningGroep = rekeningGroepPerBetalingsSoort
      .find(rgpb => rgpb.betalingsSoort === newBetalingsSoort)?.rekeningGroepen.find(rg => rg.naam === rekeningGroepNaam);
    const newRekening = newRekeningGroep?.rekeningen[0];
    const newBetaalMethode = newRekening?.betaalMethoden ? newRekening.betaalMethoden[0] : undefined

    const newBron = selectedBetalingsSoort && bestemmingBetalingsSoorten.includes(selectedBetalingsSoort) ? newRekening?.naam : newBetaalMethode?.naam;
    const newBestemming = selectedBetalingsSoort && bestemmingBetalingsSoorten.includes(selectedBetalingsSoort) ? newBetaalMethode?.naam : newRekening?.naam;

    setSelectedBetalingsSoort(newBetalingsSoort);
    setSelectedRekeningGroep(newRekeningGroep);
    setSelectedRekening(newRekening);
    setSelectedBetaalMethode(newBetaalMethode);

    props.onBetalingsChange(newBetalingsSoort, newBron, newBestemming);
  };

  const handleRekeningClick = (rekeningNaam: string) => {
    const newRekening = selectedRekeningGroep?.rekeningen
      .find(r => r.naam === rekeningNaam);
    const newBetaalMethode = newRekening?.betaalMethoden ? newRekening.betaalMethoden[0] : undefined

    const newBron = selectedBetalingsSoort && bestemmingBetalingsSoorten.includes(selectedBetalingsSoort) ? newRekening?.naam : newBetaalMethode?.naam;
    const newBestemming = selectedBetalingsSoort && bestemmingBetalingsSoorten.includes(selectedBetalingsSoort) ? newBetaalMethode?.naam : newRekening?.naam;

    setSelectedRekening(newRekening);
    setSelectedBetaalMethode(newBetaalMethode);

    props.onBetalingsChange(selectedBetalingsSoort, newBron, newBestemming);
  };

  const handleBetaalMethodeClick = (betaalMethodeNaam: string) => {
    const newBetaalMethode = selectedRekening?.betaalMethoden?.find(bm => bm.naam === betaalMethodeNaam);

    const newBron = selectedBetalingsSoort && bestemmingBetalingsSoorten.includes(selectedBetalingsSoort) ? selectedRekening?.naam : newBetaalMethode?.naam;
    const newBestemming = selectedBetalingsSoort && bestemmingBetalingsSoorten.includes(selectedBetalingsSoort) ? newBetaalMethode?.naam : selectedRekening?.naam;

    setSelectedBetaalMethode(newBetaalMethode);

    props.onBetalingsChange(selectedBetalingsSoort, newBron, newBestemming);
  };

  const creeerBronBestemmingTekst = (): string => {
    let bron, bestemming;
    switch (selectedBetalingsSoort) {
      case BetalingsSoort.opnemen:
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

  function renderLijstLangerDan1<T>(lijst: T[]) {
    if (!lijst || lijst.length < 1) return [];
    return lijst;
  }
  function renderBetaalSelectBlok({
    filterFn,
  }: {
    filterFn: (rgpb: RekeningGroepPerBetalingsSoort) => boolean,
  }) {
    return (
      <Box mt={2}>
        <Grid container spacing={2} justifyContent={"center"}>
          {renderLijstLangerDan1(rekeningGroepPerBetalingsSoort
            .filter(filterFn)
            .flatMap((rgpb) => rgpb.rekeningGroepen))
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((rekeningGroep, index) => (
              <Button
                key={rekeningGroep.naam + '-' + index}
                color='success'
                style={{ textTransform: 'none' }}
                sx={{ mb: '13px' }}
                variant={selectedRekeningGroep?.naam === rekeningGroep.naam ? 'contained' : 'outlined'}
                onClick={() => handleRekeningGroepClick(rekeningGroep.naam)}
              >
                {rekeningGroep.naam}
              </Button>
            ))
          }
        </Grid>

        {rekeningGroepPerBetalingsSoort
          .filter(filterFn)
          .map((rgpb, rgpbIndex) =>
            <Fragment key={rgpb.betalingsSoort + '-' + rgpbIndex}>
              <Grid key={'rekening-' + rgpb.betalingsSoort + '-' + rgpbIndex} container spacing={2} display={'flex'} justifyContent={"center"}>
                {rgpb.rekeningGroepen
                  .filter(rg => rg.naam === selectedRekeningGroep?.naam)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map(rg =>
                    rg.rekeningen.length > 1 &&
                    rg.rekeningen.map(rekening =>
                      <Button
                        key={rekening.naam}
                        color='success'
                        style={{ textTransform: 'none' }}
                        sx={{ p: '3px', fontSize: 11 }}
                        variant={selectedRekening?.naam === rekening.naam ? 'contained' : 'outlined'}
                        onClick={() => handleRekeningClick(rekening.naam)}
                      >
                        {rekening.naam} {rgpb.betalingsSoort === BetalingsSoort.besteden ?
                          (<><br />{sparenSaldi.filter(s => s.rekeningNaam === rekening.naam)?.map(s => s.openingsBalansSaldo + s.betaling).reduce((a, b) => a + b, 0).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' }) || ''}</>) : null}
                      </Button>
                    ))}
              </Grid>
              {rgpb.rekeningGroepen
                .filter(rg => rg.naam === selectedRekeningGroep?.naam)
                .map(rg => rg.rekeningen
                  .filter(r => r.naam === selectedRekening?.naam)
                  .map(rekening =>
                  (rekening.betaalMethoden && rekening.betaalMethoden.length > 1 &&
                    <Fragment key={rekening.naam + '-betaalmethoden'}>
                      <Typography key={rekening.naam + '-text'} textAlign={"center"} fontSize={"12px"} color='grey' marginTop={"12px"}>
                        Betaalmethode
                      </Typography>
                      <Grid key={rekening.naam + '-grid'} container spacing={2} justifyContent={"center"}>
                        {rekening.betaalMethoden.map((betaalMethode) =>
                          <Button
                            key={rekening.naam + '-' + betaalMethode.naam}
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
                    </Fragment>
                  )))}
            </Fragment>
          )
        }
      </Box>
    );
  }

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

      {selectedCategorie === 'INKOMSTEN' &&
        renderBetaalSelectBlok({
          filterFn: rgpb => rgpb.betalingsSoort.toString().toLowerCase() === 'inkomsten',
        })
      }

      {selectedCategorie === 'UITGAVEN' &&
        renderBetaalSelectBlok({
          filterFn: rgpb => uitgavenBetalingsSoorten.includes(rgpb.betalingsSoort),
        })
      }

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
                    sx={{ mb: '13px' }}
                    variant={selectedBetalingsSoort === rgpb.betalingsSoort ? 'contained' : 'outlined'}
                    onClick={() => handleBetalingsSoortClick(rgpb.betalingsSoort)}
                  >
                     {betalingsSoortFormatter(rgpb.betalingsSoort.toString())}
                  </Button>
                )
              }
            </Grid>
            <Grid>
              {rekeningGroepPerBetalingsSoort
                // .filter(rgpb => internBetalingsSoorten.includes(rgpb.betalingsSoort))
                .filter(rgpb => rgpb.betalingsSoort === selectedBetalingsSoort)
                .map((rgpb, rgpbIndex) =>
                  <Fragment key={rgpb.betalingsSoort + '-' + rgpbIndex}>
                    <Grid key={'rekening-' + rgpb.betalingsSoort + '-' + rgpbIndex} container spacing={2} display={'flex'} justifyContent={"center"}>
                      {rgpb.rekeningGroepen
                        .filter(rg => rg.naam === selectedRekeningGroep?.naam)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(rg =>
                          rg.rekeningen.length > 1 &&
                          rg.rekeningen.map(rekening =>
                            <Button
                              key={rekening.naam}
                              color='success'
                              style={{ textTransform: 'none' }}
                              sx={{ p: '3px', fontSize: 11 }}
                              variant={selectedRekening?.naam === rekening.naam ? 'contained' : 'outlined'}
                              onClick={() => handleRekeningClick(rekening.naam)}
                            >
                              {rekening.naam} <br />{sparenSaldi.filter(s => s.rekeningNaam === rekening.naam)?.map(s => s.openingsBalansSaldo + s.betaling).reduce((a, b) => a + b, 0).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' }) || ''}
                            </Button>
                          ))}
                    </Grid>
                  </Fragment>
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
      {/* {JSON.stringify(props.betaling)}<br /><br />
      {JSON.stringify(rekeningGroepPerBetalingsSoort.find(rgpb => rgpb.betalingsSoort === props.betaling?.betalingsSoort))} */}
    </div>
  );
};

export default BetalingsSoortSelect;