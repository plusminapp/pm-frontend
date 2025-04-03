import { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Alert, AlertColor } from "@mui/material";

const StyledSnackbar = ({ message = '', type = "info" as AlertColor, onClose }: { message: string | undefined, type: AlertColor | undefined, onClose: () => void }) => {
    const [show, setShow] = useState(false);
    const resetMessage = () => message = '' 
    const close = () => {
        setShow(false);
        setTimeout(() => {
            resetMessage();
            onClose();
        }, 10);
    };

    useEffect(() => {
        if (message.length > 0) {
            setShow(true)
        } else {
            setShow(false)
        }
    }, [message, type]);

    return (
        <Snackbar open={show}
            anchorOrigin={{ 'vertical': 'top', horizontal: 'center' }}
            autoHideDuration={ type === 'error' ? 40000 : type === 'warning' ? 30000 : 25000 }
            onClose={close}>
            <Alert
                onClose={close}
                severity={type}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default StyledSnackbar;

export type SnackbarMessage = {
    message?: string | undefined,
    type?: AlertColor | undefined
}