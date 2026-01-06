import { Box, Typography } from '@mui/material';

interface PotjeProps {
  lineColor: string;
  fillColor: string;
  naam: string;
  reserveNu: number;
  eindReserve: number;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Potje: React.FC<PotjeProps> = ({
  lineColor,
  fillColor,
  naam,
  reserveNu,
  eindReserve,
  onClick,
  children,
}) => {
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        width: '92.4px',
        height: '129.36px',
        margin: '13.2px auto',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-5px)',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))',
            }
          : {},
      }}
    >
      {/* SVG voor de trapezium vorm met stroke */}
      <svg
        width="92.4"
        height="129.36"
        viewBox="0 0 92.4 129.36"
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
      >
        <polygon
          points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04"
          fill={fillColor}
          stroke={lineColor}
          strokeWidth="2.64"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Naam apart gepositioneerd bovenaan */}
      <Box
        sx={{
          position: 'absolute',
          top: '9.9px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          zIndex: 1,
        }}
      >
        {children}
        
        <Typography
          sx={{
            color: '#333',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            textAlign: 'center',
            fontFamily: 'Roboto',
            lineHeight: 1,
          }}
        >
          {naam}
        </Typography>
      </Box>

      {/* Rest van de content gecentreerd */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '5.28px',
          zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              color: '#333',
              fontSize: '0.8rem',
              fontFamily: 'Roboto',
              lineHeight: 1,
              mb: '1.32px',
            }}
          >
            Reserve nu
          </Typography>
          <Typography
            sx={{
              color: '#333',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              fontFamily: 'Roboto',
              lineHeight: 1,
            }}
          >
            {formatAmount(reserveNu)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              color: '#333',
              fontSize: '0.8rem',
              fontFamily: 'Roboto',
              lineHeight: 1,
              mb: '1.32px',
            }}
          >
            Eind
          </Typography>
          <Typography
            sx={{
              color: '#333',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              fontFamily: 'Roboto',
              lineHeight: 1,
            }}
          >
            {formatAmount(eindReserve)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};