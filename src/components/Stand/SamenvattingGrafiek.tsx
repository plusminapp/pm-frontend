import { Box, FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import { Periode } from '../../model/Periode';
import { useState } from 'react';
import StandGeneriekGrafiek from '../../components/Stand/StandGeneriekGrafiek';
import { BudgetSamenvatting } from '../../model/Budget';

type SamenvattingGrafiekProps = {
  peilDatum: dayjs.Dayjs;
  periode: Periode;
  budgetSamenvatting: BudgetSamenvatting;
  visualisatie: string;
};

export const SamenvattingGrafiek = (props: SamenvattingGrafiekProps) => {

  // const { percentagePeriodeVoorbij, budgetMaandInkomstenBedrag, besteedTotPeilDatum, nogNodigNaPeilDatum, actueleBuffer } = props.budgetSamenvatting;

  const [toonbudgetSamenvattingVastDetails, setToonbudgetSamenvattingVastDetails] = useState<boolean>(localStorage.getItem('toonBudgetBudgetSamenvattingDetails') === 'true');
  const handleToonbudgetSamenvattingVastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('toonBudgetBudgetSamenvattingDetails', event.target.checked.toString());
    setToonbudgetSamenvattingVastDetails(event.target.checked);
  };

  // const formatAmount = (amount: string): string => {
  //   return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  // };

  // const tabelBreedte = budgetSamenvattingsBedrag + meerDanMaandBudgetSamenvatting + 5;

  const berekenSimonGrafiek = (): JSX.Element => {
    return <StandGeneriekGrafiek
      status='green'
      percentageFill={props.budgetSamenvatting.percentagePeriodeVoorbij} 
      headerText={'Samenvatting'} 
      bodyText={`Buffer: ${props.budgetSamenvatting.actueleBuffer.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })}`} 
      cfoText={''} />
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
              <strong>Samenvatting</strong>
            </Typography>
            {props.budgetSamenvatting &&
              <FormGroup >
                <FormControlLabel control={
                  <Switch
                    sx={{ transform: 'scale(0.6)' }}
                    checked={toonbudgetSamenvattingVastDetails}
                    onChange={handleToonbudgetSamenvattingVastChange}
                    slotProps={{ input: { 'aria-label': 'controlled' } }}
                  />}
                  sx={{ mr: 0 }}
                  label={
                    <Box display="flex" fontSize={'0.875rem'} >
                      Toon budgetSamenvatting details
                    </Box>
                  } />
              </FormGroup>}
          </Grid>
          {/* {toonbudgetSamenvattingVastDetails &&
            <Grid size={2} alignItems={'flex-start'}>
              {props.budgetSamenvattingen.map((budgetSamenvatting, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  {berekenToestandBudgetSamenvattingIcoon(budgetSamenvatting)}
                  <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
                    {budgetSamenvatting.rekening.naam}: {(budgetSamenvatting.deltaStartPeriode ?? 0) > 0 && `betaalachterstand van ${formatAmount(((budgetSamenvatting.deltaStartPeriode ?? 0)).toString())}; `}
                    maandbedrag: {formatAmount(budgetSamenvatting.budgetSamenvattingsBedrag.toString())}, betaaldag {budgetSamenvatting.betaalDag && dagInPeriode(budgetSamenvatting.betaalDag, props.periode).format('D MMMM')},&nbsp;
                    waarvan {formatAmount(budgetSamenvatting.budgetSamenvattingBetaling?.toString() ?? "nvt")} is betaald;
                    dit is
                    {budgetSamenvatting.meerDanVerwacht === 0 && budgetSamenvatting.minderDanVerwacht === 0 && budgetSamenvatting.meerDanMaandBudgetSamenvatting === 0 && ' zoals verwacht'}
                    {[budgetSamenvatting.meerDanVerwacht > 0 && ' eerder dan verwacht',
                    budgetSamenvatting.minderDanVerwacht > 0 && ` ${formatAmount(budgetSamenvatting.minderDanVerwacht.toString())} minder dan verwacht`,
                    budgetSamenvatting.meerDanMaandBudgetSamenvatting > 0 && ` ${formatAmount(budgetSamenvatting.meerDanMaandBudgetSamenvatting.toString())} meer dan verwacht`
                    ].filter(Boolean).join(' en ')}.
                  </Typography>
                </Box>
              ))}
            </Grid>} */}
          {/* <TableContainer >
            <Table>
              <TableBody>

                <TableRow>
                  {meerDanVerwacht > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudgetSamenvatting === 0 ? '2px dotted #333' : 'none', }}
                      align="right"
                      width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenBudgetSamenvatting + meerDanVerwacht).toString())}
                    </TableCell>}
                  {meerDanMaandBudgetSamenvatting > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px', borderRight: '2px dotted #333' }}
                      align="right"
                      width={`${(meerDanMaandBudgetSamenvatting / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenBudgetSamenvatting + meerDanVerwacht + meerDanMaandBudgetSamenvatting).toString())}
                    </TableCell>}
                  {minderDanVerwacht > 0 &&
                    <TableCell
                      sx={{ p: 1, fontSize: '10px' }}
                      align="right"
                      width={`${(minderDanVerwacht / tabelBreedte) * 90}%`}
                    >
                      {formatAmount((betaaldBinnenBudgetSamenvatting + meerDanVerwacht + meerDanMaandBudgetSamenvatting + minderDanVerwacht).toString())}
                    </TableCell>}
                </TableRow>

                <TableRow>
                  <TableCell width={'5%'} sx={{ borderBottom: '10px solid white' }} />
                  {betaaldBinnenBudgetSamenvatting > 0 &&
                    <TableCell
                      width={`${(betaaldBinnenBudgetSamenvatting / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'grey',
                        borderBottom: '10px solid #333',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(betaaldBinnenBudgetSamenvatting.toString())}
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
                  {meerDanMaandBudgetSamenvatting > 0 &&
                    <TableCell
                      width={`${(meerDanMaandBudgetSamenvatting / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: 'orange',
                        borderBottom: '10px solid #333',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(meerDanMaandBudgetSamenvatting.toString())}
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
                  {restMaandbudgetSamenvatting > 0 &&
                    <TableCell
                      width={`${(restMaandbudgetSamenvatting / tabelBreedte) * 90}%`}
                      sx={{
                        backgroundColor: '#1977d3',
                        borderBottom: '10px solid #1977d3',
                        color: 'white',
                        textAlign: 'center'
                      }}>
                      {formatAmount(restMaandbudgetSamenvatting.toString())}
                    </TableCell>}
                  {restMaandbudgetSamenvatting === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
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
                  {betaaldBinnenBudgetSamenvatting > 0 &&
                    <TableCell
                      align="right"
                      width={`${(betaaldBinnenBudgetSamenvatting / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanVerwacht === 0 && meerDanMaandBudgetSamenvatting === 0 ? '2px dotted #333' : 'none' }} >
                      {meerDanVerwacht === 0 && meerDanMaandBudgetSamenvatting === 0 && props.peilDatum.format('D/M')}
                    </TableCell>}
                  {meerDanVerwacht > 0 &&
                    <TableCell
                      align="right"
                      width={`${(meerDanVerwacht / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderRight: meerDanMaandBudgetSamenvatting === 0 ? '2px dotted #333' : 'none', }} >
                      {meerDanMaandBudgetSamenvatting === 0 && props.peilDatum.format('D/M')}
                    </TableCell>}
                  {meerDanMaandBudgetSamenvatting > 0 &&
                    <TableCell
                      align="right"
                      width={`${(meerDanMaandBudgetSamenvatting / tabelBreedte) * 90}%`}
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
                  {restMaandbudgetSamenvatting > 0 &&
                    <TableCell
                      align="right"
                      width={`${(restMaandbudgetSamenvatting / tabelBreedte) * 90}%`}
                      sx={{ p: 1, fontSize: '10px', borderLeft: minderDanVerwacht === 0 ? '2px dotted #333' : 'none' }} >
                      {dayjs(props.periode.periodeEindDatum).format('D/M')}
                    </TableCell>}
                  {restMaandbudgetSamenvatting === 0 && props.peilDatum.format('YYYY-MM-DD') != props.periode.periodeEindDatum &&
                    <TableCell
                      align="right"
                      sx={{ p: 1, fontSize: '10px' }} >
                      {dayjs(props.periode.periodeEindDatum).format('D/M')}
                    </TableCell>}
                </TableRow>

              </TableBody>
            </Table>
          </TableContainer > */}
        </>}
    </>
  );
};

export default SamenvattingGrafiek;