import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  CircularProgress
} from '@mui/material';
import { DateRangePicker } from '@mui/lab';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import debounce from 'lodash/debounce';

const FileSearch = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    department: '',
    category: '',
    status: '',
    priority: '',
    confidentialityLevel: '',
    dateRange: [null, null],
    tags: [],
    page: 1,
    limit: 10
  });

  const [results, setResults] = useState({
    files: [],
    pagination: {
      total: 0,
      totalPages: 0,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  });

  const [suggestions, setSuggestions] = useState({
    recentFiles: [],
    similarFiles: [],
    frequentFiles: []
  });

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch initial data
  useEffect(() => {
    fetchDepartments();
    fetchCategories();
  }, []);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      enqueueSnackbar('Error loading departments', { variant: 'error' });
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/file-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Error loading categories', { variant: 'error' });
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (params) => {
      try {
        setLoading(true);
        const response = await axios.get('/api/files/search', { params });
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        enqueueSnackbar('Error performing search', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Fetch suggestions
  const fetchSuggestions = async (context) => {
    try {
      const response = await axios.get('/api/files/suggestions', {
        params: { context }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle search parameter changes
  const handleParamChange = (param, value) => {
    const newParams = { ...searchParams, [param]: value };
    setSearchParams(newParams);
    debouncedSearch(newParams);
  };

  // Handle page change
  const handlePageChange = (event, newPage) => {
    handleParamChange('page', newPage);
  };

  // Clear search
  const handleClear = () => {
    setSearchParams({
      query: '',
      department: '',
      category: '',
      status: '',
      priority: '',
      confidentialityLevel: '',
      dateRange: [null, null],
      tags: [],
      page: 1,
      limit: 10
    });
    debouncedSearch({});
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {/* Search input */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search files"
                value={searchParams.query}
                onChange={(e) => handleParamChange('query', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />,
                  endAdornment: searchParams.query && (
                    <IconButton size="small" onClick={() => handleParamChange('query', '')}>
                      <ClearIcon />
                    </IconButton>
                  )
                }}
              />
            </Grid>

            {/* Filters */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={searchParams.department}
                  onChange={(e) => handleParamChange('department', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={searchParams.category}
                  onChange={(e) => handleParamChange('category', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={searchParams.status}
                  onChange={(e) => handleParamChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="in-review">In Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Results */}
            <Grid item xs={12}>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Search Results ({results.pagination.total})
                  </Typography>
                  {/* Render file list here */}
                  {/* Pagination */}
                  <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                      count={results.pagination.totalPages}
                      page={results.pagination.page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                </>
              )}
            </Grid>

            {/* Suggestions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Suggestions
              </Typography>
              <Grid container spacing={2}>
                {/* Recent Files */}
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        <HistoryIcon /> Recent Files
                      </Typography>
                      {/* Render recent files */}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Similar Files */}
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        <TrendingUpIcon /> Similar Files
                      </Typography>
                      {/* Render similar files */}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Frequent Files */}
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        <TrendingUpIcon /> Frequently Accessed
                      </Typography>
                      {/* Render frequent files */}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FileSearch;
