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
        width: '140px',
        height: '196px',
        margin: '20px auto',
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
        width="140"
        height="196"
        viewBox="0 0 140 196"
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
      >
        <polygon
          points="2,2 138,2 115.5,194 24.5,194"
          fill={fillColor}
          stroke={lineColor}
          strokeWidth="4"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Naam apart gepositioneerd bovenaan */}
      <Box
        sx={{
          position: 'absolute',
          top: '15px',
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
            fontSize: '1rem',
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
          gap: '8px',
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
              mb: '2px',
            }}
          >
            Reserve nu
          </Typography>
          <Typography
            sx={{
              color: '#333',
              fontWeight: 'bold',
              fontSize: '1.1rem',
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
              mb: '2px',
            }}
          >
            Eindreserve
          </Typography>
          <Typography
            sx={{
              color: '#333',
              fontWeight: 'bold',
              fontSize: '1.1rem',
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