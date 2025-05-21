import { RekeningGroepDTO, RekeningGroepPaar } from '../../model/RekeningGroep';
import { betalingsSoorten2RekeningenSoorten } from '../../model/Betaling';
import { BetalingsSoort } from '../../model/Betaling';


export const saveToLocalStorage = (key: string, value: string) => {
    localStorage.setItem(key, value);
};

export const transformRekeningGroepenToBetalingsSoorten = (rekeningGroepen: RekeningGroepDTO[]): Map<BetalingsSoort, RekeningGroepPaar> => {
    const result = new Map<BetalingsSoort, RekeningGroepPaar>();
    betalingsSoorten2RekeningenSoorten.forEach((rekeningGroepSoortPaar, betalingsSoort) => {
        const bronrekeningGroepen = rekeningGroepen
            .filter(rekeningGroep => rekeningGroepSoortPaar.bron.includes(rekeningGroep.rekeningGroepSoort))
            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1);
        const BestemmingrekeningGroepen = rekeningGroepen
            .filter(rekeningGroep => rekeningGroepSoortPaar.bestemming.includes(rekeningGroep.rekeningGroepSoort))
            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1);
        if (bronrekeningGroepen.length > 0 && BestemmingrekeningGroepen.length > 0) {
            result.set(betalingsSoort, {
                bron: bronrekeningGroepen,
                bestemming: BestemmingrekeningGroepen
            });
        }
    });
    return result;
}

  export const transformRekeningGroepen2BetalingsSoorten = (rekeningGroepen: RekeningGroepDTO[]) => {
    const betalingsSoortValues = Object.values(BetalingsSoort);
    const rekeningGroepSoortValues = rekeningGroepen.map((rekeningGroep: RekeningGroepDTO) => rekeningGroep.rekeningGroepSoort.toLowerCase())
    const filteredBetalingsSoorten = rekeningGroepSoortValues.flatMap((rekeningGroepSoort) =>
      betalingsSoortValues.filter((betalingsSoort) =>
        betalingsSoort.toLowerCase().includes(rekeningGroepSoort.toLowerCase())
      )
    );
    return filteredBetalingsSoorten.filter((value, index, self) => self.indexOf(value) === index); //deduplication ...
  }

