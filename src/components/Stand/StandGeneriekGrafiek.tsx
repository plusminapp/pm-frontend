import React from "react";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import PaymentsIcon from '@mui/icons-material/Payments';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import CallMissedOutgoingIcon from '@mui/icons-material/CallMissedOutgoing';
import Redeem from '@mui/icons-material/Redeem';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';

interface StandGeneriekIconProps {
  statusIcon: JSX.Element;
  percentageFill: number;
  rekeningIconNaam: string | undefined;
  headerText: string;
  bodyText: string;
  cfaText: string;
}

const StandGeneriekGrafiek: React.FC<StandGeneriekIconProps> = ({
  statusIcon,
  percentageFill,
  rekeningIconNaam,
  headerText,
  bodyText,
  cfaText: cfoText,
}) => {

  let rekeningIcon;
  switch (rekeningIconNaam) {
    case 'inkomsten':
      rekeningIcon = <PaymentsIcon color="disabled" fontSize="large" />;
      break;
    case 'boodschappen':
      rekeningIcon = <LocalMallIcon color="disabled" fontSize="large" />;
      break;
    case 'vaste lasten':
      rekeningIcon = <ElectricalServicesIcon color="disabled" fontSize="large" />;
      break;
    case 'andere uitgave':
      rekeningIcon = <Redeem color="disabled" fontSize="large" />;
      break;
    case 'aflossing':
      rekeningIcon = <CallMissedOutgoingIcon color="disabled" fontSize="large" />;
      break;
    case 'reservering':
      rekeningIcon = <SavingsOutlinedIcon color="disabled" fontSize="large" />;
      break;
    case 'samenvatting':
      rekeningIcon = <SummarizeOutlinedIcon color="disabled" fontSize="large" />;
      break;
    default:
      rekeningIcon = <QuestionMarkOutlinedIcon color={'disabled'} height={36} />;
  }

  return (
    <Grid
      sx={{
        // height: '125px',
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Grid container width='100%' columns={12} zIndex={10} display={'flex'} alignItems='center' flexDirection={'row'} >
        <Grid size={2} padding={2}>
          {rekeningIcon}
        </Grid>

        <Grid size={7} display={'flex'} flexDirection={'column'} alignItems='flex-start' justifyContent='center'>
          <Typography
            variant="h6"
            sx={{ color: '#333', zIndex: 10, position: 'relative', }}>
            {headerText}
          </Typography>
          <Typography
            variant="body2"
            sx={{ pb: '5px', color: '#666', zIndex: 10, position: 'relative', }}>
            {bodyText}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#333', fontWeight: 'bold', zIndex: 10, position: 'relative', }}>
            {cfoText}
          </Typography>
        </Grid>

        <Grid size={2} padding={1}>
          {statusIcon}
        </Grid>

      </Grid>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '100%',
          width: `${percentageFill}%`,
          backgroundColor: '#d0d0d0',
          zIndex: 1,
        }}
      />

    </Grid>)
};

export default StandGeneriekGrafiek;