import React, { useRef, useState } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { usePlusminApi } from '../../api/plusminApi';
import { ErrorResponse } from '../../model/ErrorResponse';
import { useCustomContext } from '../../context/CustomContext';

const CreeerAdministratie: React.FC = () => {
  const { uploadSpel } = usePlusminApi();
  const { setSnackbarMessage } = useCustomContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valideer dat het een JSON bestand is
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Alleen JSON bestanden zijn toegestaan');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const fileText = await file.text();
      let jsonData;
      try {
        jsonData = JSON.parse(fileText);
      } catch {
        setError('Ongeldig JSON bestand');
        return;
      }
      await uploadSpel(jsonData);
      console.log('Spel succesvol geüpload');
      setSnackbarMessage({
        message: 'Spel succesvol geüpload',
        type: 'success',
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (uploadError) {
      console.error('Fout bij uploaden van spel:', uploadError);

      if (
        uploadError &&
        typeof uploadError === 'object' &&
        'body' in uploadError
      ) {
        try {
          // Parse de body string naar een object
          const bodyString = uploadError.body as string;
          const parsedBody = JSON.parse(bodyString) as ErrorResponse;

          console.error('Parsed error response:', parsedBody);

          setSnackbarMessage({
            message:
              parsedBody.message ||
              'Fout bij uploaden van het spel. Probeer opnieuw.',
            type: 'error',
          });
        } catch (parseError) {
          console.error('Could not parse error body:', parseError);
          setSnackbarMessage({
            message: 'Fout bij uploaden van het spel. Probeer opnieuw.',
            type: 'error',
          });
        }
      } else {
        setSnackbarMessage({
          message: 'Fout bij uploaden van het spel. Probeer opnieuw.',
          type: 'error',
        });
      }

      setError('Fout bij uploaden van het spel. Probeer opnieuw.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
      }}
    >
      <Typography>
        {isUploading
          ? 'Uploaden...'
          : 'Klik om een JSON administratie bestand te uploaden'}
      </Typography>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        style={{ display: 'none' }}
      />

      <IconButton
        onClick={handleUploadClick}
        disabled={isUploading}
        aria-label="Upload spel JSON bestand"
      >
        <UploadIcon />
      </IconButton>

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default CreeerAdministratie;
