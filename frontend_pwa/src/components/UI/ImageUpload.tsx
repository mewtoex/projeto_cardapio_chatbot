import React, { useState, useRef, type ChangeEvent } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  previewUrl?: string | null;
  isUploading?: boolean;
  currentImage?: string | null;
  label?: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, onImageRemove, previewUrl, isUploading = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      onImageUpload(file);
    }
  };

  const handleDeleteImage = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  return (
    <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
      {previewUrl ? (
        <Box sx={{ position: 'relative', width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
          />
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', '&:hover': { bgcolor: 'error.light' } }}
            onClick={handleDeleteImage}
            disabled={isUploading}
            aria-label="remover imagem"
          >
            <DeleteIcon color="error" />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <ImageIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Nenhuma imagem selecionada
          </Typography>
        </Box>
      )}
      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        sx={{ mt: 2 }}
        disabled={isUploading}
      >
        {previewUrl ? "Trocar Imagem" : "Selecionar Imagem"}
        <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
      </Button>
    </Box>
  );
};