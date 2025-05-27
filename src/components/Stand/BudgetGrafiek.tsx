// import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
// import Grid from '@mui/material/Grid2';
// import dayjs from 'dayjs';
// import { dagInPeriode, Periode } from '../../model/Periode';
// import { BudgetType, RekeningGroepDTO, RekeningGroepSoort } from '../../model/RekeningGroep';
// import { PlusIcon } from '../../icons/Plus';
// import { MinIcon } from '../../icons/Min';
// import StandGeneriekGrafiek from './StandGeneriekGrafiek';

// type BudgetGrafiekProps = {
//   peilDatum: dayjs.Dayjs;
//   periode: Periode;
//   RekeningGroep: RekeningGroepDTO
//   budgetten: BudgetDTO[];
//   geaggregeerdBudget: BudgetDTO | undefined;
//   detailsVisible: boolean;
// };

// export const BudgetGrafiek = ({ peilDatum, periode, RekeningGroep, geaggregeerdBudget, budgetten, detailsVisible }: BudgetGrafiekProps) => {

//   const grafiekType = RekeningGroep.rekeningGroepSoort === RekeningGroepSoort.inkomsten ? 'inkomsten' :
//     RekeningGroep.budgetType === BudgetType.continu ? 'continu' :
//       RekeningGroep.budgetType === BudgetType.vast ? 'vast' : 'onbekend';

//   const formatAmount = (amount: string): string => {
//     return parseFloat(amount).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
//   };

//   const betaaldBinnenBudget = geaggregeerdBudget?.betaaldBinnenBudget ?? 0;
//   const maandBudget = geaggregeerdBudget?.budgetMaandBedrag ?? 0;
//   const restMaandBudget = geaggregeerdBudget?.restMaandBudget ?? 0;
//   const meerDanBudget = geaggregeerdBudget?.meerDanBudget ?? 0;
//   const minderDanBudget = geaggregeerdBudget?.minderDanBudget ?? 0;
//   const meerDanMaandBudget = geaggregeerdBudget?.meerDanMaandBudget ?? 0;

//   const tabelBreedte = maandBudget + meerDanMaandBudget + 5;

//   const periodeLengte = dayjs(periode.periodeEindDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
//   const periodeVoorbij = dayjs(peilDatum).diff(dayjs(periode.periodeStartDatum), 'day') + 1;
//   const percentagePeriodeVoorbij = periodeVoorbij / periodeLengte * 100;

//   const berekenBudgetIcoon = (budget: BudgetDTO): JSX.Element => {
//     if ((budget.meerDanBudget ?? 0) === 0 && (budget.minderDanBudget ?? 0) === 0 && (budget.meerDanMaandBudget ?? 0) === 0) {
//       if ((budget.betaaldBinnenBudget ?? 0) === 0)
//         return <PlusIcon color="#1977d3" height={18} />
//       else return <PlusIcon color="#green" height={18} />
//     }
//     if ((budget.minderDanBudget ?? 0) > 0) return <MinIcon color="red" height={18} />
//     if ((budget.meerDanBudget ?? 0) > 0) return <PlusIcon color="lightgreen" height={18} />
//     if ((budget.meerDanMaandBudget ?? 0) > 0) return <PlusIcon color="green" height={18} />
//     return <PlusIcon color="black" />
//   }

//   // const berekenRekeningIcoon = (): JSX.Element => {
//   //   const height = visualisatie === 'icon-xs' ? 15 : 30;
//   //   // console.log('berekenRekeningInkomstenIcoon', height);
//   //   if (meerDanBudget === 0 && minderDanBudget === 0 && meerDanMaandBudget === 0) return <PlusIcon color="#green" height={height} />
//   //   if (minderDanBudget > 0 && meerDanMaandBudget > 0) return <MinIcon color="green" height={height} />
//   //   if (minderDanBudget > 0) return <MinIcon color="red" height={height} />
//   //   if (meerDanMaandBudget > 0) return <PlusIcon color="green" height={height} />
//   //   if (meerDanBudget > 0) return <PlusIcon color="green" height={height} />
//   //   return <MinIcon color="black" />
//   // }

//   return (
//     <>
//       <Box sx={{ maxWidth: '500px' }}>
//         <Box sx={{ cursor: 'pointer' }}>
//           {geaggregeerdBudget &&
//             <StandGeneriekGrafiek
//               status={berekenBudgetStand(geaggregeerdBudget)}
//               percentageFill={percentagePeriodeVoorbij}
//               headerText={RekeningGroep.naam}
//               bodyText={"Deze tekst moet nog wijzigen, maar dat kan ik nu nog niet"}
//               cfoText={"En deze ook ..."}
//               rekeningIconNaam={RekeningGroep.rekeningGroepIcoonNaam} />}
//         </Box>

//         <TableContainer >
//           <Table size={'small'}>
//             <TableBody>

//               <TableRow>
//                 {betaaldBinnenBudget > 0 &&
//                   <TableCell
//                     width={`${(betaaldBinnenBudget / tabelBreedte) * 90}%`}
//                     sx={{
//                       backgroundColor: 'grey',
//                       borderBottom: detailsVisible ? '4px solid #333' : '0px',
//                       color: 'white',
//                       textAlign: 'center',
//                       fontSize: '0.7rem'
//                     }}>
//                     {detailsVisible && formatAmount(betaaldBinnenBudget.toString())}
//                   </TableCell>}
//                 {meerDanBudget > 0 &&
//                   <TableCell
//                     width={`${(meerDanBudget / tabelBreedte) * 90}%`}
//                     sx={{
//                       backgroundColor: grafiekType === 'continu' ? 'red' : 'lightgreen',
//                       borderBottom: detailsVisible ? '4px solid #333' : '0px',
//                       color: 'white',
//                       textAlign: 'center',
//                       fontSize: '0.7rem'
//                     }}>
//                     {detailsVisible && formatAmount(meerDanBudget.toString())}
//                   </TableCell>}
//                 {meerDanMaandBudget > 0 &&
//                   <TableCell
//                     width={`${(meerDanMaandBudget / tabelBreedte) * 90}%`}
//                     sx={{
//                       backgroundColor: grafiekType === 'inkomsten' ? 'green' : grafiekType === 'vast' ? 'orange' : '#c00',
//                       borderBottom: detailsVisible ? '4px solid #333' : '0px',
//                       color: 'white',
//                       textAlign: 'center',
//                       fontSize: '0.7rem'
//                     }}>
//                     {detailsVisible && formatAmount(meerDanMaandBudget.toString())}
//                   </TableCell>}
//                 {minderDanBudget > 0 &&
//                   <TableCell
//                     width={`${(minderDanBudget / tabelBreedte) * 90}%`}
//                     sx={{
//                       backgroundColor: grafiekType === 'continu' ? 'green' : 'red',
//                       borderBottom: !detailsVisible ? '0px' : grafiekType === 'continu' ? '4px solid green' : '4px solid red',
//                       color: 'white',
//                       textAlign: 'center',
//                       fontSize: '0.7rem'
//                     }}>
//                     {detailsVisible && formatAmount(minderDanBudget.toString())}
//                   </TableCell>}
//                 {restMaandBudget > 0 &&
//                   <TableCell
//                     width={`${(restMaandBudget / tabelBreedte) * 90}%`}
//                     sx={{
//                       backgroundColor: '#1977d3',
//                       borderBottom: detailsVisible ? '4px solid #1977d3' : '0px',
//                       color: 'white',
//                       textAlign: 'center',
//                       fontSize: '0.7rem'
//                     }}>
//                     {detailsVisible && formatAmount(restMaandBudget.toString())}
//                   </TableCell>}
//               </TableRow>

//             </TableBody>
//           </Table>
//         </TableContainer >
//         {detailsVisible && 
//           <Grid size={2} alignItems={'flex-start'}>
//             {budgetten.map((budget, index) => (
//               <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
//                 {berekenBudgetIcoon(budget)}
//                 <Typography variant='body2' sx={{ fontSize: '0.875rem', ml: 1 }}>
//                   {budget.budgetNaam}: {formatAmount((budget.budgetMaandBedrag ?? 0).toString())}<br />
//                   Betaaldag {budget.betaalDag && dagInPeriode(budget.betaalDag, periode).format('D MMMM')}<br />
//                   Betaald {formatAmount(budget.budgetBetaling?.toString() ?? "nvt")}<br />
//                   Dit is {(budget.meerDanBudget ?? 0) === 0 && (budget.minderDanBudget ?? 0) === 0 && (budget.meerDanMaandBudget ?? 0) === 0 && ' zoals verwacht'}
//                   {[(budget.meerDanBudget ?? 0) > 0 && ' eerder dan verwacht',
//                   (budget.minderDanBudget ?? 0) > 0 && ` ${formatAmount((budget.minderDanBudget ?? 0).toString())} minder dan verwacht`,
//                   (budget.meerDanMaandBudget ?? 0) > 0 && ` ${formatAmount((budget.meerDanMaandBudget ?? 0).toString())} meer dan verwacht`
//                   ].filter(Boolean).join(' en ')}.
//                 </Typography>
//               </Box>
//             ))}
//           </Grid>}

//       </Box>
//     </>
//   );
// };

// export default BudgetGrafiek;