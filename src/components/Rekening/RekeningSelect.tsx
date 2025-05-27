import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useCustomContext } from "../../context/CustomContext";
import { saveToLocalStorage } from "../Header/HeaderExports.ts";

import { bankRekeningGroepSoorten, RekeningGroepDTO } from "../../model/RekeningGroep";
import { useEffect, useState } from "react";
import { RekeningDTO } from "../../model/Rekening.ts";


interface RekeningSelectProps {
    wijzigOcrBankNaam: (bankRekening: RekeningDTO | undefined) => void;
}
export function RekeningSelect(props: RekeningSelectProps) {

    const { rekeningGroepen: rekeningen } = useCustomContext();
    const bankRekeningen = rekeningen.filter(RekeningGroep => bankRekeningGroepSoorten.includes(RekeningGroep.rekeningGroepSoort));
    const [gekozenRekening, setGekozenRekening] = useState<RekeningGroepDTO | undefined>(undefined);

    useEffect(() => {
        if (bankRekeningen.length > 0) {
            if (gekozenRekening === undefined) {
                setGekozenRekening(bankRekeningen[0])
                props.wijzigOcrBankNaam(bankRekeningen[0]);
            }
            // const uniekeBankNamen = new Set(bankRekeningen.map(RekeningGroep => RekeningGroep.bankNaam));
            // if (uniekeBankNamen.size === 1) {
            //     props.wijzigOcrBankNaam(bankRekeningen[0]);
            // }
        }
    }, [bankRekeningen, gekozenRekening, props]);

    const handlegekozenRekeningChange = (event: SelectChangeEvent<string>) => {
        const RekeningGroep = rekeningen.find(RekeningGroep => RekeningGroep.naam === event.target.value)
        if (RekeningGroep) {
            setGekozenRekening(RekeningGroep);
            props.wijzigOcrBankNaam(RekeningGroep);
            saveToLocalStorage('gekozenRekening', RekeningGroep?.id + '');
        }
    };

    return (
        <Box sx={{ my: 2, width: '340px' }}>
            {bankRekeningen?.length > 1 &&
            <FormControl variant="standard" fullWidth>
                <InputLabel id="demo-simple-select-label">Kies de RekeningGroep</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={gekozenRekening?.naam || ''}
                    label="RekeningGroep"
                    onChange={handlegekozenRekeningChange}>
                    {bankRekeningen
                        .map((RekeningGroep: RekeningGroepDTO) => (
                            <MenuItem key={RekeningGroep.naam} value={RekeningGroep.naam}>
                                {RekeningGroep.naam} ({RekeningGroep.bankNaam})
                            </MenuItem>))}
                </Select>
            </FormControl>}
        </Box>
    )
}
