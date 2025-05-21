import { Rekening, RekeningPaar } from '../../model/Rekening';
import { betalingsSoorten2RekeningenSoorten } from '../../model/Betaling';
import { BetalingsSoort } from '../../model/Betaling';


export const saveToLocalStorage = (key: string, value: string) => {
    localStorage.setItem(key, value);
};

export const transformRekeningenToBetalingsSoorten = (rekeningen: Rekening[]): Map<BetalingsSoort, RekeningPaar> => {
    const result = new Map<BetalingsSoort, RekeningPaar>();
    betalingsSoorten2RekeningenSoorten.forEach((rekeningSoortPaar, betalingsSoort) => {
        const bronRekeningen = rekeningen
            .filter(rekening => rekeningSoortPaar.bron.includes(rekening.rekeningSoort))
            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1);
        const BestemmingRekeningen = rekeningen
            .filter(rekening => rekeningSoortPaar.bestemming.includes(rekening.rekeningSoort))
            .sort((a, b) => a.sortOrder > b.sortOrder ? 1 : -1);
        if (bronRekeningen.length > 0 && BestemmingRekeningen.length > 0) {
            result.set(betalingsSoort, {
                bron: bronRekeningen,
                bestemming: BestemmingRekeningen
            });
        }
    });
    return result;
}

  export const transformRekeningen2BetalingsSoorten = (rekeningen: Rekening[]) => {
    const betalingsSoortValues = Object.values(BetalingsSoort);
    const rekeningSoortValues = rekeningen.map((rekening: Rekening) => rekening.rekeningSoort.toLowerCase())
    const filteredBetalingsSoorten = rekeningSoortValues.flatMap((rekeningSoort) =>
      betalingsSoortValues.filter((betalingsSoort) =>
        betalingsSoort.toLowerCase().includes(rekeningSoort.toLowerCase())
      )
    );
    return filteredBetalingsSoorten.filter((value, index, self) => self.indexOf(value) === index); //deduplication ...
  }

