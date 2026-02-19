import { Typography } from '@mui/material';
import { useCustomContext } from '../context/CustomContext';

export default function Home() {
  const { gebruiker } = useCustomContext();

  return (
    <>
      <Typography variant="h4">
        {gebruiker && gebruiker.administraties.length === 0
          ? `Gebruiker ${gebruiker.bijnaam} heeft nog geen administratie.`
          : `Dit is de App van de PlusMin gereedschapskist.`}
      </Typography>

      <Typography sx={{ my: '25px' }}>
        Deze App is een demo app en dus NIET de uiteindelijke app voor de
        gebruiker. Het is bedoeld om de werking van de toekomstige app uit te
        kunnen leggen.
      </Typography>
      <Typography sx={{ my: '25px' }}>
        Op{' '}
        <a href="https://documentatie.plusmin.org" target="_blank" rel="noopener noreferrer">
          https://documentatie.plusmin.org
        </a>{' '}
        kun je meer informatie vinden.
      </Typography>
      <Typography sx={{ my: '25px' }}>
      Bezoek de demo van potjes op <a href="/potjesdemo">/potjesdemo</a>.
      </Typography>
      <Typography sx={{ my: '25px' }}>
      Bezoek de beslisboom om te bepalen wat voor een soort potje je moet kiezen op <a href="/beslisboom">/beslisboom</a>.
      </Typography>
    </>
  );
}
