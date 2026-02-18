import React from 'react';
import { Box, Typography } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

interface Props {
  naam: string;
  aantal: number;
  aantalOranje: number;
  aantalRood: number;
}

const VIEW_W = 92.4;
const VIEW_H = 129.36;

const PotjesAggregaatDemo: React.FC<Props> = ({ naam, aantal, aantalOranje, aantalRood }) => {
  // border color logic: front pot takes precedence (red > orange > green), back pot becomes gray when alerts present
  let frontBorder = '#2e7d32';
  let backBorder = '#2e7d32';
  if (aantalRood > 0) {
    frontBorder = '#d32f2f';
    backBorder = '#9e9e9e';
  } else if (aantalOranje > 0) {
    frontBorder = '#ff9800';
    backBorder = '#9e9e9e';
  } else {
    frontBorder = '#2e7d32';
    backBorder = '#2e7d32';
  }

  // badges
  const showOrange = aantalOranje > 0;
  const showRed = aantalRood > 0;
  const badgeBg = frontBorder === '#2e7d32' ? '#2e7d32' : '#9e9e9e';

  const showThumb = frontBorder === '#2e7d32';

  return (
    <Box sx={{ width: `${VIEW_W}px`, margin: '12px auto', position: 'relative', overflow: 'visible' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
        <Typography sx={{ color: '#333', fontWeight: 'bold', fontSize: '0.9rem', fontFamily: 'Roboto' }}>{naam}</Typography>
        {showThumb && <ThumbUpOffAltIcon sx={{ fontSize: 16, color: '#2e7d32' }} />}
      </Box>

      <Box sx={{ position: 'relative', width: `${VIEW_W}px`, height: `${VIEW_H}px` }}>
        {/* back potje slightly right-up */}
        <svg width={VIEW_W} height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ position: 'absolute', left: 8, top: -8, overflow: 'visible' }}>
          <polygon points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04" fill="#fff" stroke={backBorder} strokeWidth="2.64" strokeLinejoin="miter" />
        </svg>

        {/* front potje */}
        <svg width={VIEW_W} height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <polygon points="1.32,1.32 91.08,1.32 76.23,128.04 16.17,128.04" fill="#fff" stroke={frontBorder} strokeWidth="2.64" strokeLinejoin="miter" />
          {showRed && (
            <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle" fontSize="48" fill="#d32f2f">!</text>
          )}
        </svg>

        {/* replaced count+icon with a gray badge showing the number */}
        {showRed ? (
          <Box sx={{ position: 'absolute', left: VIEW_W / 2 - 10, top: VIEW_H / 4 - 10, width: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Roboto' }}>{aantal}</Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ position: 'absolute', left: 0, top: VIEW_H / 2 - 10, width: VIEW_W, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #fff' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Roboto' }}>{aantal}</Typography>
            </Box>
          </Box>
        )}

        {/* badges at top-right of front potje */}
        <Box sx={{ position: 'absolute', right: -6, top: -6, height: 0, width: 0 }}>
          {showRed && (
            <Box sx={{ position: 'absolute', right: 0, top: 0, zIndex: 2, bgcolor: '#d32f2f', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, boxShadow: '0 0 0 2px #fff' }}>{aantalRood}</Box>
          )}

          {showOrange && (
            <Box sx={{ position: 'absolute', right: showRed ? 26 : 0, top: 0, zIndex: 1, bgcolor: '#ff9800', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, boxShadow: '0 0 0 2px #fff' }}>{aantalOranje}</Box>
          )}
        </Box>

      </Box>
    </Box>
  );
};

export default PotjesAggregaatDemo;
