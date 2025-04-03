import { Box } from "@mui/material";

interface NaamPlaatjeProps {
  bijnaam: string;
  geselecteerd: boolean;
}

export const NaamPlaatje = ({ bijnaam, geselecteerd }: NaamPlaatjeProps) => {

  return <Box
    key={bijnaam}
    sx={{
      display: 'inline-block',
      mx: 0.5,
      px: 1.2, // Halveer de padding
      py: 1.2, // Halveer de padding
      borderRadius: '8px',
      background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
      boxShadow: '5px 5px 10px #c9c9c9, -5px -5px 10px #ffffff',
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#333',
      fontFamily: '"Roboto", sans-serif',
      fontSize: '1.2rem', // Halveer de font size
      position: 'relative',
      border: `${geselecteerd ? '3px solid green' : '1px solid #c9c9c9' }`,
      minWidth: '75px', // Halveer de minimum breedte
      '&:before': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(0, 0, 0, 0.1))',
        borderRadius: '12px',
        zIndex: '1',
      },
    }}
    data-text={bijnaam}>
    {bijnaam}
  </Box>
};