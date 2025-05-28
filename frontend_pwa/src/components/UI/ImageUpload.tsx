// frontend_pwa/src/components/UI/ImageUpload.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext'; // Importar useNotification

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  previewUrl?: string;
  isUploading?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  previewUrl,
  isUploading = false
}) => {
  const [preview, setPreview] = useState<string | undefined>(previewUrl);
  const notification = useNotification();

  const MAX_FILE_SIZE_MB = 2; // Definir tamanho máximo em MB
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // Validação de tipo de arquivo (extensão e MIME type básico do navegador)
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      // A biblioteca dropzone já faz uma filtragem inicial via 'accept' prop,
      // mas é bom ter uma validação explícita aqui também.
      if (!allowedMimeTypes.includes(file.type)) {
        notification.showError('Tipo de arquivo não permitido. Apenas JPG, PNG, GIF.');
        return;
      }

      // Validação de tamanho
      if (file.size > MAX_FILE_SIZE_BYTES) {
        notification.showError(`Arquivo muito grande. Máximo ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      onImageUpload(file);

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Limpar o objectURL quando o componente for desmontado ou um novo arquivo for selecionado
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [onImageUpload, notification]); // Adicionar notification às dependências

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxFiles: 1
  });

  const handleRemove = () => {
    setPreview(undefined);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {!preview ? (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'background.paper',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" align="center">
            {isDragActive
              ? 'Solte a imagem aqui...'
              : 'Arraste e solte uma imagem aqui, ou clique para selecionar'}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: {MAX_FILE_SIZE_MB}MB.
            O sistema verificará a integridade do arquivo.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ position: 'relative' }}>
          <Paper
            sx={{
              p: 1,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              component="img"
              src={preview}
              alt="Preview da imagem"
              sx={{
                width: '100%',
                height: 200,
                objectFit: 'contain',
                display: 'block'
              }}
            />

            {isUploading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Paper>

          <IconButton
            onClick={handleRemove}
            disabled={isUploading}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};