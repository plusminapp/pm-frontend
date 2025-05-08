import { Box, FormControlLabel, FormGroup, Switch, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { dagInPeriode, Periode } from '../../model/Periode';
import { useState } from 'react';
import { AflossingDTO } from '../../model/Aflossing';
import { PlusIcon } from '../../icons/Plus';
import { MinIcon } from '../../icons/Min';
import StandGeneriekGrafiek from '../../components/Stand/StandGeneriekGrafiek';

type AflossingGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  aflossingen: AflossingDTO[];
  geaggregeerdeAflossingen: AflossingDTO;
  visualisatie: string;
};

export const AflossingGrafiek = (props: AflossingGrafiekProps) => {

  const { meerDanMaandAflossing, meerDanVerwacht, minderDanVerwacht, aflossingsBedrag, betaaldBinnenAflossing } = props.geaggregeerdeAflossingen;

  const [toonaflossingVastDetails, setToonaflossingVastDetails] = useState<boolean>(localStorage.getItem('toonBudgetAflossingDetails') === 'true');
  const handleToonaflossingVastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonBudgetAflossingDetails', event.target.checked.toString());
    setToonaflossingVastDetails(event.target.checked);
  };

  if (props.aflossingen.length === 0 ||
    props.aflossingen.some(aflossing => aflossing.betaalDag === undefined) ||
    props.aflossingen.some(aflossing => (aflossing?.betaalDag ?? 0) < 1) ||
    props.aflossingen.some(aflossing => (aflossing?.betaalDag ?? 30) > 28)) {
    throw new Error('aflossingVastGrafiek: rekeningSoort moet \'aflossing\' zijn, er moet minimaal 1 aflossing zijn en alle aflossingen moeten een geldige betaalDag hebben.');
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

  const berekenToestandAflossingIcoon = (aflossing: AflossingDTO): JSX.Element => {
    if (aflossing.meerDanVerwacht === 0 && aflossing.minderDanVerwacht === 0 && aflossing.meerDanMaandAflossing === 0) {
      if (!aflossing.aflossingMoetBetaaldZijn)
        return <PlusIcon color="#1977d3" height={18} />
      else return <PlusIcon color="#green" height={18} />
    }
    if (aflossing.minderDanVerwacht > 0) return <MinIcon color="red" height={18} />
    if (aflossing.meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={18} />
    if (aflossing.meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={18} />
    return <PlusIcon color="black" />
  }
  // const berekenRekeningAflossingIcoon = (): JSX.Element => {
  //   if (meerDanVerwacht === 0 && minderDanVerwacht === 0 && meerDanMaandAflossing === 0) return <PlusIcon color="#green" height={30} />
  //   if (minderDanVerwacht > 0) return <MinIcon color="red" height={30} />
  //   if (meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={30} />
  //   if (meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={30} />
  //   return <MinIcon color="black" />
  // }
  const berekenSimonGrafiek = (): JSX.Element => {
    // if (meerDanVerwacht === 0 && minderDanVerwacht === 0 && meerDanMaandAflossing === 0) return <PlusIcon color="#green" height={30} />
    // if (minderDanVerwacht > 0) return <MinIcon color="red" height={30} />
    // if (meerDanMaandAflossing > 0) return <PlusIcon color="orange" height={30} />
    // if (meerDanVerwacht > 0) return <PlusIcon color="lightgreen" height={30} />
    return <StandGeneriekGrafiek
      status='green'
      percentageFill={66} 
      headerText={'Aflossing'} 
      bodyText={'Op schema'} 
      cfoText={''} 
      rekeningIconNaam={'aflossing'} />
  }
  return (
    <>
      {(props.visualisatie === 'icon-sm' || props.visualisatie === 'all') &&
        <Box>
          {berekenSimonGrafiek()}
        </Box>
      }

      {(props.visualisatie === 'bar' || props.visualisatie === 'all') &&
        <>
          <Grid display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <Typography variant='body2'>
              <strong>Alossingen</strong>
            </Typography>
            {props.aflossingen.length >= 1 &&
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
          </Grid>
          {toonaflossingVastDetails &&
            <Grid size={2} alignItems={'flex-start'}>
              {props.aflossingen.map((aflossing, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {berekenToestandAflossingIcoon(aflossing)}
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                    {aflossing.rekening.naam}: {(aflossing.deltaStartPeriode ?? 0) > 0 && `betaalachterstand van ${formatAmount(((aflossing.deltaStartPeriode ?? 0)).toString())}; `}
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
            </Grid>}
          <TableContainer >
            <Table>
              <TableBody>

                <TableRow>
                  <TableCell width={'5%'} />
                  {betaaldBinnenAflossing > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanVerwacht === 0 && meerDanMaandAflossing === 0 ? '2px dotted #333' : 'none' }}
                      align="right"
                      width={`${(betaaldBinnenAflossing / tabelBreedte) * 90}%`}
                    />}
                  {meerDanVerwacht > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandAflossing === 0 ? '2px dotted #333' : 'none', }}
                      align="right"
                      width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenAflossing + meerDanVerwacht).toString())}
                    </TableCell>}
                  {meerDanMaandAflossing > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                      align="right"
                      width={`${(meerDanMaandAflossing / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenAflossing + meerDanVerwacht + meerDanMaandAflossing).toString())}
                    </TableCell>}
                  {minderDanVerwacht > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px' }}
                      align="right"
                      width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenAflossing + meerDanVerwacht + meerDanMaandAflossing + minderDanVerwacht).toString())}
                    </TableCell>}
                  {restMaandaflossing > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderLeft: minderDanVerwacht === 0 ? '2px dotted #333' : 'none' }}
                      align="right"
                      width={`${(restMaandaflossing / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenAflossing + meerDanVerwacht + minderDanVerwacht + meerDanMaandAflossing + restMaandaflossing).toString())}
                    </TableCell>}
                  {restMaandaflossing === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                    <TableCell />}
                </TableRow>

                <TableRow>
                  <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
                  {betaaldBinnenAflossing > 0 &&
                    <TableCell
                      width={`${(betaaldBinnenAflossing / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'grey',
                        borderBottom: '10px solid #333',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(betaaldBinnenAflossing.toString())}
                    </TableCell>}
                  {meerDanVerwacht > 0 &&
                    <TableCell
                      width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'lightGreen',
                        borderBottom: '10px solid #333',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(meerDanVerwacht.toString())}
                    </TableCell>}
                  {meerDanMaandAflossing > 0 &&
                    <TableCell
                      width={`${(meerDanMaandAflossing / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'orange',
                        borderBottom: '10px solid #333',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(meerDanMaandAflossing.toString())}
                    </TableCell>}
                  {minderDanVerwacht > 0 &&
                    <TableCell
                      width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'red',
                        borderBottom: '10px solid red',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(minderDanVerwacht.toString())}
                    </TableCell>}
                  {restMaandaflossing > 0 &&
                    <TableCell
                      width={`${(restMaandaflossing / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: '#1977d3',
                        borderBottom: '10px solid #1977d3',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(restMaandaflossing.toString())}
                    </TableCell>}
                  {restMaandaflossing === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                    <TableCell
                      sx={{
                        backgroundColor: '#333',
                        borderBottom: '10px solid #333',
                      }} />}
                </TableRow>

                <TableRow>
                  <TableCell
                    align="right"
                    width={'5%'}
                    sx={{ p: 1, fontSize: '10px' }} >
                    {dayjs(props.periode.periodeStartDatum).format('D/M')}
                  </TableCell>
                  {betaaldBinnenAflossing > 0 &&
                    <TableCell
                      align="right"
                      width={`${(betaaldBinnenAflossing / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanVerwacht === 0 && meerDanMaandAflossing === 0 ? '2px dotted #333' : 'none' }} >
                      {meerDanVerwacht === 0 && meerDanMaandAflossing === 0 && props.peilDatum.format('D/M')}
                    </TableCell>}
                  {meerDanVerwacht > 0 &&
                    <TableCell
                      align="right"
                      width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandAflossing === 0 ? '2px dotted #333' : 'none', }} >
                      {meerDanMaandAflossing === 0 && props.peilDatum.format('D/M')}
                    </TableCell>}
                  {meerDanMaandAflossing > 0 &&
                    <TableCell
                      align="right"
                      width={`${(meerDanMaandAflossing / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }} >
                      {props.peilDatum.format('D/M')}
                    </TableCell>}
                  {minderDanVerwacht > 0 &&
                    <TableCell
                      align="right"
                      width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px' }}>
                      {props.peilDatum.format('YYYY-MM-DD') === props.periode.periodeEindDatum && props.peilDatum.format('D/M')}
                    </TableCell>}
                  {restMaandaflossing > 0 &&
                    <TableCell
                      align="right"
                      width={`${(restMaandaflossing / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderLeft: minderDanVerwacht === 0 ? '2px dotted #333' : 'none' }} >
                      {dayjs(props.periode.periodeEindDatum).format('D/M')}
                    </TableCell>}
                  {restMaandaflossing === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                    <TableCell
                      align="right"
                      sx={{ p: 1, fontSize: '10px' }} >
                      {dayjs(props.periode.periodeEindDatum).format('D/M')}
                    </TableCell>}
                </TableRow>

              </TableBody>
            </Table>
          </TableContainer >
        </>}
    </>
  );
};

export default AflossingGrafiek;