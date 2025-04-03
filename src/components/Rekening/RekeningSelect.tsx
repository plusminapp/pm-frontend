import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useCustomContext } from "../../context/CustomContext";
import { saveToLocalStorage } from "../Header";

import { bankRekeningSoorten, Rekening } from "../../model/Rekening";
import { useEffect, useState } from "react";


interface RekeningSelectProps {
    wijzigOcrBankNaam: (bankRekening: Rekening | undefined) => void;
}
export function RekeningSelect(props: RekeningSelectProps) {

    const { rekeningen } = useCustomContext();
    const bankRekeningen = rekeningen.filter(rekening => bankRekeningSoorten.includes(rekening.rekeningSoort));
    const [gekozenRekening, setGekozenRekening] = useState<Rekening | undefined>(undefined);

    useEffect(() => {
        if (bankRekeningen.length > 0) {
            if (gekozenRekening === undefined) {
                setGekozenRekening(bankRekeningen[0])
                props.wijzigOcrBankNaam(bankRekeningen[0]);
            }
            // const uniekeBankNamen = new Set(bankRekeningen.map(rekening => rekening.bankNaam));
            // if (uniekeBankNamen.size === 1) {
            //     props.wijzigOcrBankNaam(bankRekeningen[0]);
            // }
        }
    }, [bankRekeningen, props]);

    const handlegekozenRekeningChange = (event: SelectChangeEvent<string>) => {
        const rekening = rekeningen.find(rekening => rekening.naam === event.target.value)
        if (rekening) {
            setGekozenRekening(rekening);
            props.wijzigOcrBankNaam(rekening);
            saveToLocalStorage('gekozenRekening', rekening?.id + '');
        }
    };

    return (
        <Box sx={{ my: 2, width: '340px' }}>
            {bankRekeningen?.length > 1 &&
            <FormControl variant="standard" fullWidth>
                <InputLabel id="demo-simple-select-label">Kies de rekening</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={gekozenRekening?.naam || ''}
                    label="Rekening"
                    onChange={handlegekozenRekeningChange}>
                    {bankRekeningen
                        .map((rekening: Rekening) => (
                            <MenuItem key={rekening.naam} value={rekening.naam}>
                                {rekening.naam} ({rekening.bankNaam})
                            </MenuItem>))}
                </Select>
            </FormControl>}
        </Box>
    )
}
