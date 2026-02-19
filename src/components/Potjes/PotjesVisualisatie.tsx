import { Box, Typography, styled } from '@mui/material';
import UTurnRightOutlinedIcon from '@mui/icons-material/UTurnRightOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  RekeningGroepSoort,
  potjesRekeningGroepSoorten,
} from '../../model/RekeningGroep';
import { useCustomContext } from '../../context/CustomContext';
import { SaldoDTO } from '../../model/Saldo';
import { useState } from 'react';
import { HevelReserveOverForm } from './HevelReserveOverForm';
import { ReserveDetailsForm } from './ReserveDetailsForm';
import { BetalingDTO } from '@/model/Betaling';
import PotjesUitgave from './PotjesUitgave';

const IconButton = styled(Box)({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'rgba(226, 226, 226, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    background: 'rgba(171, 171, 171, 0.9)',
    transform: 'scale(1.1)',
  },
});

const IconContainer = styled(Box)({
  position: 'absolute',
  right: 'calc(50% + 65px)',
  bottom: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'center',
});

interface GroepData {
  groepNaam: string;
  saldi: SaldoDTO[];
  isDeelKolom: boolean;
  deelNummer?: number;
  totaleDelen?: number;
}

interface KolomData {
  groepen: GroepData[];
}

export const PotjesVisualisatie: React.FC = () => {
  const {
    betalingen,
    stand,
    gekozenPeriode,
    vandaag
  } = useCustomContext();

  const [overTeHevelenReserve, setOverTeHevelenReserve] = useState<
    SaldoDTO | undefined
  >(undefined);
  const [detailsSaldo, setDetailsSaldo] = useState<SaldoDTO | undefined>(
    undefined,
  );
  const [detailsBetalingen, setDetailsBetalingen] = useState<BetalingDTO[]>([]);

  const periodeIsAfgelopen = gekozenPeriode
    ? (vandaag ?? '') > gekozenPeriode.periodeEindDatum
    : false;
  const handleHevelReserveOverClick = (saldo: SaldoDTO) => {
    setOverTeHevelenReserve(saldo);
  };

  const handleDetailsClick = (saldo: SaldoDTO) => {
    setDetailsSaldo(saldo);
    setDetailsBetalingen(betalingen.filter(
      (betaling) =>
        (betaling.bron === saldo.rekeningNaam || betaling.bestemming === saldo.rekeningNaam)))
  };

  // Groepeer saldi per RekeningGroep
  const groepeerPerRekeningGroep = () => {
    if (!stand) return {};

    const grouped: Record<string, SaldoDTO[]> = {};

    stand.resultaatOpDatum
      .filter((saldo) =>
        potjesRekeningGroepSoorten.includes(
          saldo.rekeningGroepSoort as RekeningGroepSoort,
        ),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((saldo) => {
        if (!grouped[saldo.rekeningGroepNaam]) {
          grouped[saldo.rekeningGroepNaam] = [];
        }
        grouped[saldo.rekeningGroepNaam].push(saldo);
      });

    return grouped;
  };

  // Bereken evenredige verdeling
  const berekenEvenredigeVerdeling = (
    totaal: number,
    maxPerDeel: number,
  ): number => {
    if (totaal <= maxPerDeel) return totaal;

    // Bereken optimaal aantal delen
    const aantalDelen = Math.ceil(totaal / maxPerDeel);

    // Bereken evenredige grootte per deel
    return Math.ceil(totaal / aantalDelen);
  };

  // Splits groepen evenredig en vul korte kolommen aan
  const splitEnVulAan = (): KolomData[] => {
    const maxPotjesPerGroep = 4;
    const gegroepeerdeData = groepeerPerRekeningGroep();
    const alleGroepen: GroepData[] = [];

    // Stap 1: Split grote groepen evenredig
    Object.entries(gegroepeerdeData).forEach(([groepNaam, saldi]) => {
      if (saldi.length <= maxPotjesPerGroep) {
        // Kleine groep: blijft intact
        alleGroepen.push({
          groepNaam,
          saldi,
          isDeelKolom: false,
        });
      } else {
        // Grote groep: split evenredig
        const potjesPerDeel = berekenEvenredigeVerdeling(
          saldi.length,
          maxPotjesPerGroep,
        );
        const aantalDelen = Math.ceil(saldi.length / potjesPerDeel);

        for (let i = 0; i < aantalDelen; i++) {
          const startIndex = i * potjesPerDeel;
          const endIndex = Math.min(startIndex + potjesPerDeel, saldi.length);
          const deelSaldi = saldi.slice(startIndex, endIndex);

          alleGroepen.push({
            groepNaam,
            saldi: deelSaldi,
            isDeelKolom: true,
            deelNummer: i + 1,
            totaleDelen: aantalDelen,
          });
        }
      }
    });

    // Stap 2: Combineer korte groepen in kolommen
    const kolommen: KolomData[] = [];
    let huidigeKolom: GroepData[] = [];
    let huidigeTotaal = 0;

    alleGroepen.forEach((groep) => {
      const groepLengte = groep.saldi.length;

      // Als huidige kolom + nieuwe groep <= 4, voeg toe aan huidige kolom
      if (huidigeTotaal + groepLengte <= maxPotjesPerGroep) {
        huidigeKolom.push(groep);
        huidigeTotaal += groepLengte;
      } else {
        // Anders: sla huidige kolom op en start nieuwe kolom
        if (huidigeKolom.length > 0) {
          kolommen.push({ groepen: huidigeKolom });
        }
        huidigeKolom = [groep];
        huidigeTotaal = groepLengte;
      }
    });

    // Voeg laatste kolom toe
    if (huidigeKolom.length > 0) {
      kolommen.push({ groepen: huidigeKolom });
    }

    return kolommen;
  };

  const kolommen = splitEnVulAan();

  return (
    <>
      <Box
        sx={{
          minHeight: 'calc(100vh - 100px)',
          background: '#ffffff',
          padding: '20px 0',
        }}
      >
        {/* Responsive Grid met masonry-style flow */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(5, 1fr)',
            },
            gap: '20px',
            padding: '0 20px',
            gridAutoFlow: 'dense',
          }}
        >
          {kolommen.map((kolom, kolomIndex) => (
            <Box
              key={`kolom-${kolomIndex}`}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #e0e0e0',
                padding: '0 10px',
                '&:last-child': {
                  borderRight: 'none',
                },
              }}
            >
              {kolom.groepen.map((groep, groepIndex) => (
                <Box
                  key={`groep-${kolomIndex}-${groepIndex}`}
                  sx={{ mb: 4 }}
                >
                  {/* Groep naam als header */}
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      mb: 2,
                      color: '#333',
                      fontFamily: 'Roboto',
                    }}
                  >
                    {groep.isDeelKolom
                      ? `${groep.groepNaam} (${groep.deelNummer}/${groep.totaleDelen})`
                      : groep.groepNaam}
                  </Typography>

                  {/* Potjes in deze groep */}
                  {groep.saldi.map((saldo) => {

                    return (
                      <Box
                        key={saldo.rekeningNaam}
                        sx={{ position: 'relative' }}
                      >
                        <PotjesUitgave
                          naam={saldo.rekeningNaam}
                          budgetMaandBedrag={saldo.budgetMaandBedrag}
                          openingsReserveSaldo={saldo.openingsReserveSaldo}
                          periodeReservering={saldo.periodeReservering}
                          peilDatum={saldo.peilDatum}
                          periodeBetaling={saldo.periodeBetaling}
                          nogNodig={saldo.komtNogNodig}
                          budgetBetaalDatum={saldo.budgetBetaalDatum}
                          periodeIsAfgelopen={periodeIsAfgelopen}
                        />

                        <IconContainer>
                          {/* Bovenste icons */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}
                          >
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDetailsClick(saldo);
                              }}
                            >
                              <VisibilityOutlinedIcon
                                sx={{ fontSize: '18px', color: '#666' }}
                              />
                            </IconButton>
                          </Box>

                          {/* Onderste icon - UTurnRight */}
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHevelReserveOverClick(saldo);
                            }}
                          >
                            <UTurnRightOutlinedIcon
                              sx={{ fontSize: '18px', color: '#666' }}
                            />
                          </IconButton>
                        </IconContainer>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {overTeHevelenReserve !== undefined && stand !== undefined && (
        <HevelReserveOverForm
          stand={stand}
          saldo={overTeHevelenReserve}
          onHevelReserveOverClose={() => setOverTeHevelenReserve(undefined)}
        />
      )}

      {detailsSaldo !== undefined && (
        <ReserveDetailsForm
          betalingen={detailsBetalingen}
          saldo={detailsSaldo}
          onClose={() => setDetailsSaldo(undefined)}
        />
      )}
    </>
  );
};