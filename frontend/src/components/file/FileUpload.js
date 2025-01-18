import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleTagKeyPress = (event) => {
    if (event.key === 'Enter' && currentTag.trim()) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', JSON.stringify(tags));

      await axios.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/files');
    } catch (error) {
      setError(error.response?.data?.error || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Upload File
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <input
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
          style={{ display: 'none' }}
          id="file-input"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-input">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Choose File
          </Button>
        </label>

        {file && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selected file: {file.name}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Add Tags"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
          onKeyPress={handleTagKeyPress}
          helperText="Press Enter to add tags"
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={!file || loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </Box>
    </Paper>
  );
};

export default FileUpload;
