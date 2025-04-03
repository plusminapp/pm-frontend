import { useEffect, useState } from 'react';
import { Button, Typography, Box, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2'; // Import Grid2
import { BetalingsSoort, betalingsSoort2Categorie, betalingsSoortFormatter, inkomstenBetalingsSoorten, internBetalingsSoorten, uitgavenBetalingsSoorten } from '../../model/Betaling';
import { useCustomContext } from '../../context/CustomContext';
import { InternIcon } from '../../icons/Intern';
import { InkomstenIcon } from '../../icons/Inkomsten';
import { UitgavenIcon } from '../../icons/Uitgaven';
import { RekeningSoort } from '../../model/Rekening';

type BetalingSoortSelectProps = {
    betalingsSoort: BetalingsSoort | undefined;
    bron: string | undefined;
    bestemming: string | undefined;
    budget: string | undefined;
    onBetalingsSoortChange: (betalingsSoort: BetalingsSoort | undefined, bron: string | undefined, bestemming: string | undefined, budget: string | undefined) => void;
};

const BetalingSoortSelect = (props: BetalingSoortSelectProps) => {
    const { betalingsSoorten2Rekeningen, rekeningen } = useCustomContext();
    const rekeningPaar = props.betalingsSoort ? betalingsSoorten2Rekeningen.get(props.betalingsSoort) : undefined;

    const [selectedCategorie, setSelectedCategorie] = useState<string | undefined>(betalingsSoort2Categorie(props.betalingsSoort));
    const [selectedBetalingsSoort, setSelectedBetalingsSoort] = useState<BetalingsSoort | undefined>(props.betalingsSoort);
    const [selectedBronRekening, setSelectedBronRekening] = useState<string | undefined>(props.bron);
    const [selectedBestemmingRekening, setSelectedBestemmingRekening] = useState<string | undefined>(props.bestemming);
    const [selectedBudget, setSelectedBudget] = useState<string | undefined>(props.budget);

    useEffect(() => {
        setSelectedCategorie(betalingsSoort2Categorie(props.betalingsSoort));
        setSelectedBetalingsSoort(props.betalingsSoort);
        setSelectedBronRekening(props.bron);
        setSelectedBestemmingRekening(props.bestemming);
        setSelectedBudget(props.budget);
    }, [props.betalingsSoort, props.bron, props.bestemming, props.budget]);

    const categorie2DefaultBetalingsSoort = (categorie: string): BetalingsSoort | undefined => {
        if (categorie === 'INKOMSTEN') return BetalingsSoort.inkomsten;
        if (categorie === 'UITGAVEN') return BetalingsSoort.uitgaven;
        if (categorie === 'INTERN' && arrayContainsObjectWithAttribute(rekeningen, 'rekeningSoort', RekeningSoort.creditcard)) return BetalingsSoort.incasso_creditcard;
        if (categorie === 'INTERN' && arrayContainsObjectWithAttribute(rekeningen, 'rekeningSoort', RekeningSoort.spaarrekening)) return BetalingsSoort.opnemen_spaarrekening;
        if (categorie === 'INTERN' && arrayContainsObjectWithAttribute(rekeningen, 'rekeningSoort', RekeningSoort.contant)) return BetalingsSoort.opnemen_contant;
        return undefined;
    }

    const arrayContainsObjectWithAttribute = <T, K extends keyof T>(array: T[], attribute: K, value: T[K]): boolean => {
        return array.some(obj => obj[attribute] === value);
    };

    const countIntersection = <T,>(arr1: T[], arr2: T[]): number => {
        const set1 = new Set(arr1);
        return arr2.filter(item => set1.has(item)).length;
    };

    const handleCategorieChange = (categorie: string) => {
        if (selectedCategorie === categorie) {
            setSelectedCategorie(undefined);
            handleBetalingsSoortChange(undefined);
        } else {
            setSelectedCategorie(categorie);
            handleBetalingsSoortChange(categorie2DefaultBetalingsSoort(categorie));
        }
    };

    const handleBetalingsSoortChange = (betalingsSoort: BetalingsSoort | undefined) => {
        if (betalingsSoort === undefined || selectedBetalingsSoort?.toString() === betalingsSoort.toString()) {
            setSelectedCategorie(undefined);
            setSelectedBetalingsSoort(undefined);
            setSelectedBronRekening(undefined);
            setSelectedBestemmingRekening(undefined);
            setSelectedBudget(undefined);
            props.onBetalingsSoortChange(undefined, undefined, undefined, undefined);
        } else {
            const newBetalingsSoort = betalingsSoort;
            const newBron = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0].naam;
            const newBestemming = betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0].naam;
            const newBudget =
                inkomstenBetalingsSoorten.includes(newBetalingsSoort) ?
                    (betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0]?.budgetten?.length ?
                        betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bron[0]?.budgetten[0]?.budgetNaam :
                        undefined) :
                    uitgavenBetalingsSoorten.includes(newBetalingsSoort) ?
                        (betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0]?.budgetten.length ?
                            betalingsSoorten2Rekeningen.get(newBetalingsSoort)?.bestemming[0]?.budgetten[0]?.budgetNaam :
                            undefined) : undefined
            setSelectedCategorie(betalingsSoort2Categorie(newBetalingsSoort));
            setSelectedBetalingsSoort(newBetalingsSoort);
            setSelectedBronRekening(newBron);
            setSelectedBestemmingRekening(newBestemming);
            setSelectedBudget(newBudget);
            props.onBetalingsSoortChange(newBetalingsSoort, newBron, newBestemming, newBudget);
        }
    };

    const handleBronButtonClick = (rekeningNaam: string) => {
        const nieuweBudgetNaam = selectedBetalingsSoort ? betalingsSoorten2Rekeningen.get(selectedBetalingsSoort)?.bron.find(rekening => rekening.naam === rekeningNaam)?.budgetten[0]?.budgetNaam : undefined;
        setSelectedBudget(nieuweBudgetNaam);
        setSelectedBronRekening(rekeningNaam);
        props.onBetalingsSoortChange(selectedBetalingsSoort, rekeningNaam, selectedBestemmingRekening, selectedBudget);
    };

    const handleBestemmingButtonClick = (rekeningNaam: string) => {
        const nieuweBudgetNaam = selectedBetalingsSoort ? betalingsSoorten2Rekeningen.get(selectedBetalingsSoort)?.bestemming.find(rekening => rekening.naam === rekeningNaam)?.budgetten[0]?.budgetNaam : undefined;
        setSelectedBudget(nieuweBudgetNaam);
        setSelectedBestemmingRekening(rekeningNaam);
        props.onBetalingsSoortChange(selectedBetalingsSoort, selectedBronRekening, rekeningNaam, nieuweBudgetNaam);
    };

    const handleBudgetButtonClick = (budgetNaam: string) => {
        setSelectedBudget(budgetNaam);
        props.onBetalingsSoortChange(selectedBetalingsSoort, selectedBronRekening, selectedBestemmingRekening, budgetNaam);
    };

    return (
        <div>
            <Grid container spacing={5} justifyContent="center">
                <Tooltip title="Inkomsten" placement={"top"}>
                    <Button
                        color='success'
                        variant={selectedCategorie === 'INKOMSTEN' ? 'contained' : 'outlined'}
                        onClick={() => handleCategorieChange('INKOMSTEN')}
                    >
                        <InkomstenIcon color={selectedCategorie === 'INKOMSTEN' ? 'white' : 'success'} />
                    </Button>
                </Tooltip>
                {countIntersection(internBetalingsSoorten, Array.from(betalingsSoorten2Rekeningen.keys())) > 0 &&
                    <Tooltip title="Intern" placement={"top"}>
                        <Button
                            color='success'
                            variant={selectedCategorie === 'INTERN' ? 'contained' : 'outlined'}
                            onClick={() => handleCategorieChange('INTERN')}
                        >
                            <InternIcon color={selectedCategorie === 'INTERN' ? 'white' : 'success'} />
                        </Button>
                    </Tooltip>
                }
                <Tooltip title="Uitgaven" placement={"top"}>
                    <Button
                        color='success'
                        variant={selectedCategorie === 'UITGAVEN' ? 'contained' : 'outlined'}
                        onClick={() => handleCategorieChange('UITGAVEN')}
                    >
                        <UitgavenIcon color={selectedCategorie === 'UITGAVEN' ? 'white' : 'success'} />
                    </Button>
                </Tooltip>
            </Grid>

            {selectedCategorie === 'INKOMSTEN' &&
                (countIntersection(inkomstenBetalingsSoorten, Array.from(betalingsSoorten2Rekeningen.keys())) > 1 ||
                    (rekeningPaar && rekeningPaar.bron.length > 1) || (rekeningPaar && rekeningPaar.bestemming.length > 1)) && (
                    <>
                        <Grid container mt={3} spacing={5} justifyContent="center">
                            {countIntersection(inkomstenBetalingsSoorten, Array.from(betalingsSoorten2Rekeningen.keys())) > 1 &&
                                inkomstenBetalingsSoorten.map((betalingsSoort) =>
                                    Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                                        <Button
                                            color='success'
                                            sx={{ m: '3px' }}
                                            key={betalingsSoort}
                                            variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                            onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                                        >
                                            {betalingsSoortFormatter(betalingsSoort)}
                                        </Button>
                                    )
                                )}
                        </Grid>
                        <Box mt={2}>
                            {inkomstenBetalingsSoorten.map((betalingsSoort) =>
                                betalingsSoorten2Rekeningen.get(betalingsSoort) &&
                                Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                                    <Grid container spacing={2} justifyContent={"center"}>
                                        {rekeningPaar && rekeningPaar.bron.length >= 1 && betalingsSoort === selectedBetalingsSoort && (
                                            <Grid container spacing={2} justifyContent={"center"}>
                                                <>
                                                    {rekeningPaar && rekeningPaar.bron.length > 1 && rekeningPaar?.bron.map((rekening) => (
                                                        <Button
                                                            color='success'
                                                            style={{ textTransform: 'none' }}
                                                            sx={{ m: '3px' }}
                                                            key={rekening.id}
                                                            variant={selectedBronRekening === rekening.naam ? 'contained' : 'outlined'}
                                                            onClick={() => handleBronButtonClick(rekening.naam)}
                                                        >
                                                            {rekening.naam}
                                                        </Button>
                                                    ))}
                                                    {rekeningPaar?.bron.map((rekening) => (
                                                        <>
                                                            {selectedBronRekening !== undefined && selectedBronRekening === rekening.naam && rekening.budgetten.length > 1 &&
                                                                <Grid container spacing={1} justifyContent={"center"} direction={"column"} >
                                                                    <Grid >
                                                                        <Typography sx={{ mt: '3px', fontSize: 12, textAlign: 'center', color: 'grey' }}>Budget: </Typography>
                                                                    </Grid>
                                                                    <Grid container direction={"row"}>
                                                                        {rekening.budgetten.map(budget => (
                                                                            <Button
                                                                                color='success'
                                                                                style={{ textTransform: 'none' }}
                                                                                sx={{ p: '3px', fontSize: 11 }}
                                                                                size="small"
                                                                                key={budget.budgetNaam}
                                                                                variant={selectedBudget === budget.budgetNaam ? 'contained' : 'outlined'}
                                                                                onClick={() => handleBudgetButtonClick(budget.budgetNaam)}>
                                                                                {budget.budgetNaam}
                                                                            </Button>
                                                                        ))}
                                                                    </Grid>
                                                                </Grid>
                                                            }
                                                        </>
                                                    ))}
                                                </>
                                            </Grid>
                                        )}
                                        {rekeningPaar && rekeningPaar.bestemming.length > 1 && betalingsSoort === selectedBetalingsSoort && (
                                            <Grid container spacing={2} justifyContent={"center"} direction={"column"}>
                                                <Grid >
                                                    <Typography sx={{ mt: '3px', fontSize: 12, textAlign: 'center', color: 'grey' }}>Ik heb 't ontvangen: </Typography>
                                                </Grid>
                                                <Grid container direction={"row"}>
                                                    {rekeningPaar?.bestemming.map((rekening) => (
                                                        <Button
                                                            color='success'
                                                            style={{ textTransform: 'none' }}
                                                            sx={{ m: '3px' }}
                                                            key={rekening.id}
                                                            variant={selectedBestemmingRekening === rekening.naam ? 'contained' : 'outlined'}
                                                            onClick={() => handleBestemmingButtonClick(rekening.naam)}
                                                        >
                                                            {rekening.naam}
                                                        </Button>
                                                    ))}
                                                </Grid>
                                            </Grid>
                                        )}
                                    </Grid>
                                )
                            )}
                        </Box>
                    </>
                )}

            {selectedCategorie === 'UITGAVEN' &&
                (countIntersection(uitgavenBetalingsSoorten, Array.from(betalingsSoorten2Rekeningen.keys())) > 1 ||
                    (rekeningPaar && rekeningPaar.bestemming.length > 1) || (rekeningPaar && rekeningPaar.bron.length > 1)) && (
                    <>
                        <Grid container mt={3} spacing={5} justifyContent="center">
                            {countIntersection(uitgavenBetalingsSoorten, Array.from(betalingsSoorten2Rekeningen.keys())) > 1 &&
                                uitgavenBetalingsSoorten.map((betalingsSoort) =>
                                    Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                                        <Button
                                            color='success'
                                            sx={{ m: '3px' }}
                                            key={betalingsSoort}
                                            variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                            onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                                        >
                                            {betalingsSoortFormatter(betalingsSoort)}
                                        </Button>
                                    )
                                )}
                        </Grid>
                        <Box mt={2}>
                            {uitgavenBetalingsSoorten.map((betalingsSoort) =>
                                betalingsSoorten2Rekeningen.get(betalingsSoort) &&
                                Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                                    <Grid container spacing={2} justifyContent="center">
                                        {rekeningPaar && rekeningPaar.bestemming.length > 1 && betalingsSoort === selectedBetalingsSoort && (
                                            <Grid container spacing={2} justifyContent={"center"}>
                                                <>
                                                    {rekeningPaar?.bestemming.map((rekening) => (
                                                        <Button
                                                            color='success'
                                                            style={{ textTransform: 'none' }}
                                                            sx={{ m: '3px' }}
                                                            key={rekening.id}
                                                            variant={selectedBestemmingRekening === rekening.naam ? 'contained' : 'outlined'}
                                                            onClick={() => handleBestemmingButtonClick(rekening.naam)}
                                                        >
                                                            {rekening.naam}
                                                        </Button>
                                                    ))}
                                                    {rekeningPaar?.bestemming.map((rekening) => (
                                                        <>
                                                            {selectedBestemmingRekening !== undefined && selectedBestemmingRekening === rekening.naam && rekening.budgetten.length > 1 &&
                                                                <Grid container spacing={1} justifyContent={"center"} direction={"column"} >
                                                                    <Grid >
                                                                        <Typography sx={{ mt: '3px', fontSize: 12, textAlign: 'center', color: 'grey' }}>Budget: </Typography>
                                                                    </Grid>
                                                                    <Grid container direction={"row"}>
                                                                        {rekening.budgetten.map(budget => (
                                                                            <Button
                                                                                color='success'
                                                                                style={{ textTransform: 'none' }}
                                                                                sx={{ p: '3px', fontSize: 11 }}
                                                                                size="small"
                                                                                key={budget.budgetNaam}
                                                                                variant={selectedBudget === budget.budgetNaam ? 'contained' : 'outlined'}
                                                                                onClick={() => handleBudgetButtonClick(budget.budgetNaam)}>
                                                                                {budget.budgetNaam}
                                                                            </Button>
                                                                        ))}
                                                                    </Grid>
                                                                </Grid>
                                                            }
                                                        </>
                                                    ))}
                                                </>
                                            </Grid>
                                        )}
                                        {rekeningPaar && rekeningPaar.bron.length > 1 && betalingsSoort === selectedBetalingsSoort && (
                                            <Grid container spacing={2} justifyContent={"center"} direction={"column"}>
                                                <Grid >
                                                    <Typography sx={{ mt: '3px', fontSize: 12, textAlign: 'center', color: 'grey' }}>Ik heb 't betaald met: </Typography>
                                                </Grid>
                                                <Grid container direction={"row"}>
                                                    {rekeningPaar?.bron.map((rekening) => (
                                                        <Button
                                                            color='success'
                                                            style={{ textTransform: 'none' }}
                                                            sx={{ m: '3px' }}
                                                            key={rekening.id}
                                                            variant={selectedBronRekening === rekening.naam ? 'contained' : 'outlined'}
                                                            onClick={() => handleBronButtonClick(rekening.naam)}
                                                        >
                                                            {rekening.naam}
                                                        </Button>
                                                    ))}
                                                </Grid>
                                            </Grid>
                                        )}
                                    </Grid>
                                )
                            )}
                        </Box>
                    </>
                )}

            {selectedCategorie === 'INTERN' && (
                <Grid container mt={3} spacing={1} justifyContent="center">
                    {internBetalingsSoorten.map((betalingsSoort) =>
                        Array.from(betalingsSoorten2Rekeningen.keys()).includes(betalingsSoort) && (
                            <Button
                                color='success'
                                style={{ textTransform: 'none' }}
                                sx={{ m: '3px' }}
                                key={betalingsSoort}
                                variant={selectedBetalingsSoort === betalingsSoort ? 'contained' : 'outlined'}
                                onClick={() => handleBetalingsSoortChange(betalingsSoort)}
                            >
                                {betalingsSoortFormatter(betalingsSoort)}
                            </Button>
                        )
                    )}
                </Grid>
            )}
            {selectedBetalingsSoort &&
                <Typography textAlign={"center"} fontSize={"12px"} color='grey' marginTop={"12px"}>Samenvatting: {selectedBetalingsSoort && betalingsSoortFormatter(selectedBetalingsSoort)} van {selectedBronRekening} naar {selectedBestemmingRekening}
                    {selectedBudget && ` (met budget ${selectedBudget})`}
                </Typography>
            }
        </div>
    );
};

export default BetalingSoortSelect;