import 'dayjs/locale/nl';
import { Periode } from '../../model/Periode';
import { WijzigPeriodeForm } from './WijzigPeriodeForm';
import { Gebruiker } from '../../model/Gebruiker';
import { useEffect, useState } from 'react';
import { usePlusminApi } from '../../api/plusminApi';
import { SaldoDTO } from '../../model/Saldo';

type WijzigPeriodeDialoogProps = {
  periode: Periode;
  editMode?: boolean;
  onWijzigPeriodeClose: () => void;
  actieveHulpvrager: Gebruiker | undefined;
};
export default function WijzigPeriodeDialoog({
  periode,
  editMode,
  onWijzigPeriodeClose,
  actieveHulpvrager,
}: WijzigPeriodeDialoogProps) {
  const { getPeriodeOpening } = usePlusminApi();

  const [openingsBalansSaldi, setOpeningsBalansSaldi] = useState<SaldoDTO[]>([]);

  const handleClose = () => {
    onWijzigPeriodeClose();
  };

  useEffect(() => {
    const fetchOpening = async () => {
      if (actieveHulpvrager) {
        try {
          const saldi: SaldoDTO[] = await getPeriodeOpening(actieveHulpvrager, periode);
          setOpeningsBalansSaldi(saldi);
        } catch (error) {
          console.error('Error getting periode opening', error);
        }
      }
    };
    if (actieveHulpvrager) {
      fetchOpening();
    }
  }, [actieveHulpvrager, getPeriodeOpening, periode]);

  return (
    <>
      {openingsBalansSaldi.length > 0 && (
        <WijzigPeriodeForm
          periode={periode}
          editMode={editMode}
          onWijzigPeriodeClose={handleClose}
          openingsBalansSaldi={openingsBalansSaldi}
        />
      )}
    </>
  );
}
