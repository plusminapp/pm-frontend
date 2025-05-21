import { Box, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { AflossingDTO } from '../../model/Aflossing';
import StandGeneriekGrafiek from '../../components/Stand/StandGeneriekGrafiek';
// import { aflossingen } from '../DemoData';

type AflossingGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  aflossingen: AflossingDTO[];
  geaggregeerdeAflossingen: AflossingDTO;
  detailsVisible: boolean;
};

export const AflossingGrafiek = ({peilDatum, periode, aflossingen, geaggregeerdeAflossingen, detailsVisible }: AflossingGrafiekProps) => {

  const { meerDanMaandAflossing, meerDanVerwacht, minderDanVerwacht, aflossingsBedrag, betaaldBinnenAflossing } = geaggregeerdeAflossingen;

  // const [toonaflossingVastDetails, setToonaflossingVastDetails] = useState<boolean>(localStorage.getItem('toonBudgetAflossingDetails') === 'true');
  // const handleToonaflossingVastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   localStorage.setItem('toonBudgetAflossingDetails', event.target.checked.toString());
  //   setToonaflossingVastDetails(event.target.checked);
  // };
    const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    const periodeVoorbij = dayjs(peilDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
    const percentagePeriodeVoorbij = periodeVoorbij / periodeLengte * 100;
  

  if (aflossingen.length === 0 ||
    aflossingen.some(aflossing => aflossing.betaalDag === undefined) ||
    aflossingen.some(aflossing => (aflossing?.betaalDag ?? 0) < 1) ||
    aflossingen.some(aflossing => (aflossing?.betaalDag ?? 30) > 28)) {
    throw new Error('aflossingVastGrafiek: rekeningGroepSoort moet \'aflossing\' zijn, er moet minimaal 1 aflossing zijn en alle aflossingen moeten een geldige betaalDag hebben.');
  }

  const formatAmount = (amount: string): string => {
    return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  const restMaandaflossing = aflossingsBedrag -
    meerDanMaandAflossing -
    meerDanVerwacht -
    minderDanVerwacht -
    betaaldBinnenAflossing

  const tabelBreedte = aflossingsBedrag + meerDanMaandAflossing + 5;

  // const berekenToestandAflossingIcoon = (aflossing: AflossingDTO): JSX.Element => {
  //   if (aflossing.meerDanVerwacht === 0 && aflossing.minderDanVerwacht === 0 && aflossing.meerDanMaandAflossing === 0) {
  //     if (!aflossing.aflossingMoetBetaaldZijn)
  //       return <PlusIcon color="#1977d3" height={18} />
  //     else return <PlusIcon color="#green" height={18} />
  //   }
  //   if (aflossing.minderDanVerwacht > 0) return <MinIcon color="red" height={18} />
  //   if (aflossing.meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={18} />
  //   if (aflossing.meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={18} />
  //   return <PlusIcon color="black" />
  // }
  // const berekenRekeningAflossingIcoon = (): JSX.Element => {
  //   if (meerDanVerwacht === 0 && minderDanVerwacht === 0 && meerDanMaandAflossing === 0) return <PlusIcon color="#green" height={30} />
  //   if (minderDanVerwacht > 0) return <MinIcon color="red" height={30} />
  //   if (meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={30} />
  //   if (meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={30} />
  //   return <MinIcon color="black" />
  // }
  // const berekenSimonGrafiek = (): JSX.Element => {
  //   // if (meerDanVerwacht === 0 && minderDanVerwacht === 0 && meerDanMaandAflossing === 0) return <PlusIcon color="#green" height={30} />
  //   // if (minderDanVerwacht > 0) return <MinIcon color="red" height={30} />
  //   // if (meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={30} />
  //   // if (meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={30} />
  //   return <StandGeneriekGrafiek
  //     status='green'
  //     percentageFill={66} 
  //     headerText={'Aflossing'} 
  //     bodyText={'Op schema'} 
  //     cfoText={''} 
  //     rekeningIconNaam={'aflossing'} />
  // }
  return (
    <>
      <Box sx={{ maxWidth: '500px' }}>

        <Box>
          <StandGeneriekGrafiek
            status='green'
            percentageFill={percentagePeriodeVoorbij}
            headerText={'Aflossing'}
            bodyText={'Op schema'}
            cfoText={''}
            rekeningIconNaam={'aflossing'} />
        </Box>


        <>
          {/* <Grid display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <Typography variant='body2'>
              <strong>Alossingen</strong>
            </Typography>
            {aflossingen.length >= 1 &&
              <FormGroup >
                <FormControlLabel control={
                  <Switch
                    sx={{ transform: 'scale(0.6)' }}
                    checked={toonaflossingVastDetails}
                    onChange={handleToonaflossingVastChange}
                    slotProps={{ input: { 'aria-label': 'controlled' } }}
                  />}
                  sx={{ mr: 0 }}
                  label={
                    <Box display="flex" fontSize={'0.875rem'} >
                      Toon aflossing details
                    </Box>
                  } />
              </FormGroup>}
          </Grid> */}
          {/* {toonaflossingVastDetails &&
            <Grid size={2} alignItems={'flex-start'}>
              {aflossingen.map((aflossing, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {berekenToestandAflossingIcoon(aflossing)}
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                    {aflossing.RekeningGroep.naam}: {(aflossing.deltaStartPeriode ?? 0) > 0 && `betaalachterstand van ${formatAmount(((aflossing.deltaStartPeriode ?? 0)).toString())}; `}
                    maandbedrag: {formatAmount(aflossing.aflossingsBedrag.toString())}, betaaldag {aflossing.betaalDag && dagInPeriode(aflossing.betaalDag, props.periode).format('D MMMM')},&nbsp;
                    waarvan {formatAmount(aflossing.aflossingBetaling?.toString() ?? "nvt")} is betaald;
                    dit is
                    {aflossing.meerDanVerwacht === 0 && aflossing.minderDanVerwacht === 0 && aflossing.meerDanMaandAflossing === 0 && ' zoals verwacht'}
                    {[aflossing.meerDanVerwacht > 0 && ' eerder dan verwacht',
                    aflossing.minderDanVerwacht > 0 && ` ${formatAmount(aflossing.minderDanVerwacht.toString())} minder dan verwacht`,
                    aflossing.meerDanMaandAflossing > 0 && ` ${formatAmount(aflossing.meerDanMaandAflossing.toString())} meer dan verwacht`
                    ].filter(Boolean).join(' en ')}.
                  </Typography>
                </Box>
              ))}
            </Grid>} */}
          <TableContainer >
            <Table size='small'>
              <TableBody>

                <TableRow>
                  {betaaldBinnenAflossing > 0 &&
                    <TableCell
                      width={`${(betaaldBinnenAflossing / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'grey',
                        borderBottom: detailsVisible ? '4px solid #333' : '0px',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.7rem'
                        }}>
                      {detailsVisible && formatAmount(betaaldBinnenAflossing.toString())}
                    </TableCell>}
                  {meerDanVerwacht > 0 &&
                    <TableCell
                      width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'lightGreen',
                        borderBottom: detailsVisible ? '4px solid #333' : '0px',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.7rem'
                        }}>
                      {detailsVisible && formatAmount(meerDanVerwacht.toString())}
                    </TableCell>}
                  {meerDanMaandAflossing > 0 &&
                    <TableCell
                      width={`${(meerDanMaandAflossing / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'orange',
                        borderBottom: detailsVisible ? '4px solid #333' : '0px',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.7rem'
                        }}>
                      {detailsVisible && formatAmount(meerDanMaandAflossing.toString())}
                    </TableCell>}
                  {minderDanVerwacht > 0 &&
                    <TableCell
                      width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'red',
                        borderBottom: detailsVisible ? '4px solid red' : '0px',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.7rem'
                        }}>
                      {detailsVisible && formatAmount(minderDanVerwacht.toString())}
                    </TableCell>}
                  {restMaandaflossing > 0 &&
                    <TableCell
                      width={`${(restMaandaflossing / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: '#1977d3',
                        borderBottom: detailsVisible ? '4px solid #1977d3' : '0px',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.7rem'
                        }}>
                      {detailsVisible && formatAmount(restMaandaflossing.toString())}
                    </TableCell>}
                </TableRow>

              </TableBody>
            </Table>
          </TableContainer >
        </>
      </Box>
    </>
  );
};

export default AflossingGrafiek;