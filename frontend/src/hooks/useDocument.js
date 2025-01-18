import { useState, useCallback } from 'react';
import apiService from '../services/api';

export const useDocument = (documentId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [document, setDocument] = useState(null);

  const fetchDocument = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDocument(documentId);
      setDocument(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const updateDocument = useCallback(async (data) => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await apiService.updateDocument(documentId, data);
      setDocument(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const deleteDocument = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      await apiService.deleteDocument(documentId);
      setDocument(null);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const downloadDocument = useCallback(async () => {
    if (!documentId) return;

    try {
      setLoading(true);
      setError(null);
      const blob = await apiService.downloadFile(documentId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document?.title || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [documentId, document?.title]);

  return {
    document,
    loading,
    error,
    fetchDocument,
    updateDocument,
    deleteDocument,
    downloadDocument
  };
};
