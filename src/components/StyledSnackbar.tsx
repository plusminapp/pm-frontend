import { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Alert, AlertColor } from '@mui/material';

const StyledSnackbar = ({
  message = undefined,
  type = 'info' as AlertColor,
  onClose,
}: {
  message: JSX.Element | string | undefined;
  type: AlertColor | undefined;
  onClose: () => void;
}) => {
  const [show, setShow] = useState(false);
  
  const close = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 10);
  };

  useEffect(() => {
    if (message) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [message, type]);

  return (
    <Snackbar
      open={show}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={
        type === 'error' ? 40000 : type === 'warning' ? 10000 : 5000
      }
      onClose={close}
    >
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
  message?: JSX.Element | string | undefined;
  type?: AlertColor | undefined;
};