// src/components/UI/ImageUpload.tsx
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
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageUpload(file);
      
      // Criar preview local
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Limpar o objectURL quando o componente for desmontado
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [onImageUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
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
            Formatos aceitos: JPG, PNG, GIF
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
