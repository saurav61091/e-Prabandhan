import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import apiService from '../services/api';

export const useSearch = (options = {}) => {
  const {
    debounceTime = 300,
    minChars = 2,
    initialQuery = '',
    autoSearch = false
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < minChars) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiService.searchDocuments(searchQuery);
        setResults(data);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceTime),
    [minChars, debounceTime]
  );

  // Update search when query changes
  useEffect(() => {
    if (autoSearch) {
      debouncedSearch(query);
    }
    return () => debouncedSearch.cancel();
  }, [query, autoSearch, debouncedSearch]);

  // Manual search function
  const search = useCallback(async (searchQuery = query) => {
    if (!searchQuery || searchQuery.length < minChars) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.searchDocuments(searchQuery);
      setResults(data);
      return data;
    } catch (err) {
      setError(err);
      setResults([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [query, minChars]);

  const reset = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    reset
  };
};
