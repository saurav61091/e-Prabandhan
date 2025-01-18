import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  Divider,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  CardActionArea
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Description as DocumentIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  GridView as GridIcon,
  List as ListIcon,
  Category as CategoryIcon,
  Schedule as DateIcon,
  Person as UserIcon,
  Business as DepartmentIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import ErrorAlert from '../common/ErrorAlert';

const DocumentSearch = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState('grid');
  const [filters, setFilters] = React.useState({
    type: '',
    department: '',
    owner: '',
    dateRange: '',
    status: ''
  });
  const [sort, setSort] = React.useState('relevance');
  const { results, loading, error } = useSelector(state => state.documentSearch);

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((searchQuery) => {
      if (searchQuery.length >= 2) {
        // dispatch(searchDocuments({ query: searchQuery, filters, sort }));
      }
    }, 300),
    [filters, sort]
  );

  React.useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery('');
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handleViewChange = () => {
    setView(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const handleDownload = (document) => {
    // Handle document download
  };

  const handleShare = (document) => {
    // Handle document sharing
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'pdf':
        return 'pdf-icon.png';
      case 'doc':
        return 'word-icon.png';
      case 'xls':
        return 'excel-icon.png';
      case 'img':
        return 'image-icon.png';
      default:
        return 'file-icon.png';
    }
  };

  const renderGridView = () => (
    <Grid container spacing={2}>
      {results?.map((doc) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
          <Card>
            <CardActionArea>
              <CardMedia
                component="img"
                height="140"
                image={getDocumentIcon(doc.type)}
                alt={doc.name}
              />
              <CardContent>
                <Typography variant="subtitle1" noWrap>
                  {doc.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {doc.description}
                </Typography>
                <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={doc.type}
                    size="small"
                    icon={<CategoryIcon />}
                  />
                  <Box>
                    <IconButton size="small" onClick={() => handleDownload(doc)}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleShare(doc)}>
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box mt={1} display="flex" alignItems="center" gap={1}>
                  <ViewIcon fontSize="small" color="action" />
                  <Typography variant="caption">
                    {doc.views} views
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • {format(new Date(doc.lastModified), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <List>
      {results?.map((doc) => (
        <React.Fragment key={doc.id}>
          <ListItemButton>
            <ListItemIcon>
              <DocumentIcon />
            </ListItemIcon>
            <ListItemText
              primary={doc.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {doc.description}
                  </Typography>
                  <Box mt={1} display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={doc.type}
                      size="small"
                      icon={<CategoryIcon />}
                    />
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <UserIcon fontSize="small" />
                      {doc.owner}
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <DepartmentIcon fontSize="small" />
                      {doc.department}
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <ViewIcon fontSize="small" />
                      {doc.views} views
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <DateIcon fontSize="small" />
                      {format(new Date(doc.lastModified), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <Box>
              <IconButton size="small" onClick={() => handleDownload(doc)}>
                <DownloadIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleShare(doc)}>
                <ShareIcon />
              </IconButton>
            </Box>
          </ListItemButton>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search documents by name, content, owner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {query && (
                      <IconButton
                        edge="end"
                        onClick={handleClear}
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="doc">Word</MenuItem>
                <MenuItem value="xls">Excel</MenuItem>
                <MenuItem value="img">Image</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                {/* Add department options */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Owner</InputLabel>
              <Select
                value={filters.owner}
                onChange={(e) => handleFilterChange('owner', e.target.value)}
                label="Owner"
              >
                <MenuItem value="">All</MenuItem>
                {/* Add owner options */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                label="Date Range"
              >
                <MenuItem value="">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sort}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="type">Type</MenuItem>
                <MenuItem value="views">Views</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box display="flex" justifyContent="flex-end">
              <Tooltip title={`Switch to ${view === 'grid' ? 'list' : 'grid'} view`}>
                <IconButton onClick={handleViewChange}>
                  {view === 'grid' ? <ListIcon /> : <GridIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <ErrorAlert error={error} sx={{ mb: 2 }} />
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2} sx={{ p: 2 }}>
          {results?.length === 0 ? (
            <Box textAlign="center" py={4}>
              <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary" mt={2}>
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          ) : (
            view === 'grid' ? renderGridView() : renderListView()
          )}
        </Paper>
      )}
    </Box>
  );
};

export default DocumentSearch;
