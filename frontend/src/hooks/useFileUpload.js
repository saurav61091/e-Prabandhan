import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file, options = {}) => {
    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const onProgress = (percent) => {
        setProgress(percent);
        options.onProgress?.(percent);
      };

      const result = await apiService.uploadFile(file, onProgress);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return {
    upload,
    reset,
    progress,
    isUploading,
    error
  };
};
