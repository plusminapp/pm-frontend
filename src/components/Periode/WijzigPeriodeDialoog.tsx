
import 'dayjs/locale/nl';
import { useCustomContext } from '../../context/CustomContext';
import { Periode } from '../../model/Periode';
import { WijzigPeriodeForm } from './WijzigPeriodeForm';


type WijzigPeriodeDialoogProps = {
  periodes: Periode[];
  index: number;
  editMode?: boolean;
  onWijzigPeriodeClose: () => void;
};
export default function WijzigPeriodeDialoog({
  periodes,
  index,
  editMode,
  onWijzigPeriodeClose,
}: WijzigPeriodeDialoogProps) {
  const { stand } = useCustomContext();

  const handleClose = () => {
    onWijzigPeriodeClose();
  };

  return (
    <>
      {stand && (
        <WijzigPeriodeForm
          periodes={periodes}
          index={index}
          editMode={editMode}
          stand={stand}
          onWijzigPeriodeClose={handleClose}
        />
      )}
    </>
  );
}
