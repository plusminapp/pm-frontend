import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, styled, IconButton } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Close as CloseIcon, SaveOutlined as SaveOutlinedIcon } from '@mui/icons-material';
import { SaldoDTO } from '../../model/Saldo';
import { useCustomContext } from '../../context/CustomContext';
import { usePlusminApi } from '../../api/plusminApi';

interface AflossingFormData {
  dossierNummer: string;
  notities: string;
}

interface AflossingFormProps {
  aflossingSaldo: SaldoDTO;
  open: boolean;
  onClose: () => void;
  onSuccess?: (dossierNummer: string, notities: string) => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export function AflossingForm({ aflossingSaldo, open, onClose, onSuccess }: AflossingFormProps) {
  const { setSnackbarMessage } = useCustomContext();
  const { putAflossing } = usePlusminApi();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AflossingFormData>({
    defaultValues: {
      dossierNummer: aflossingSaldo?.aflossing?.dossierNummer ?? '',
      notities: aflossingSaldo?.aflossing?.notities ?? '',
    },
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const onSubmit = async (data: AflossingFormData) => {
    try {
      if (!aflossingSaldo?.aflossing) {
        throw new Error('Geen aflossing data beschikbaar');
      }

      const updatedAflossing = {
        ...aflossingSaldo.aflossing,
        dossierNummer: data.dossierNummer.trim(),
        notities: data.notities.trim(),
      };

      await putAflossing(updatedAflossing);
      
      setSnackbarMessage({
        message: 'Aflossing succesvol bijgewerkt',
        type: 'success',
      });
      
      // Update parent met nieuwe waarden
      onSuccess?.(data.dossierNummer.trim(), data.notities.trim());
      
      // Close dialog on success
      onClose();
    } catch (error) {
      console.error('Error updating aflossing:', error);
      setSnackbarMessage({
        message: 'Fout bij het bijwerken van de aflossing',
        type: 'error',
      });
    }
  };

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="aflossing-edit-dialog-title"
      open={open}
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="aflossing-edit-dialog-title">
          Aflossing bewerken: {aflossingSaldo?.rekeningNaam}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Controller
            name="dossierNummer"
            control={control}
            rules={{
              maxLength: {
                value: 100,
                message: 'Dossiernummer mag maximaal 100 karakters bevatten',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label="Dossiernummer"
                fullWidth
                variant="standard"
                error={!!errors.dossierNummer}
                helperText={errors.dossierNummer?.message}
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
            )}
          />
          <Controller
            name="notities"
            control={control}
            rules={{
              maxLength: {
                value: 1000,
                message: 'Notities mogen maximaal 1000 karakters bevatten',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Notities"
                fullWidth
                multiline
                rows={4}
                variant="standard"
                error={!!errors.notities}
                helperText={errors.notities?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            sx={{ color: 'success.main' }}
            startIcon={
              <SaveOutlinedIcon
                sx={{ fontSize: '35px', color: 'success.main' }}
              />
            }
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'BEWAREN...' : 'BEWAAR'}
          </Button>
        </DialogActions>
      </form>
    </BootstrapDialog>
  );
}