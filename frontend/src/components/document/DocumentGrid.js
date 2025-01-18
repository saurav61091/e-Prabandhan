/**
 * Document Grid Component
 * 
 * A responsive grid layout for displaying document cards.
 * Features include:
 * - Responsive grid layout
 * - Empty state handling
 * - Loading state
 * - Infinite scroll
 * - Document filtering and sorting
 * 
 * @component
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Box,
  Typography,
  Button,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DocumentCard from './DocumentCard';
import DocumentUploadDialog from './DocumentUploadDialog';
import NoData from '../common/NoData';
import LoadingState from '../common/LoadingState';
import ErrorAlert from '../common/ErrorAlert';
import { useSearch } from '../../hooks/useSearch';
import { 
  fetchDocuments,
  deleteDocument,
  setSort,
  setFilters
} from '../../store/slices/documentSlice';

/**
 * Sort options for the document grid
 * 
 * @type {Array}
 */
const sortOptions = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' }
];

/**
 * Document Grid Component
 * 
 * @returns {JSX.Element} Document grid component
 */
const DocumentGrid = () => {
  const dispatch = useDispatch();
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState('createdAt_desc');
  
  /**
   * Get documents, pagination, loading, and error from the Redux store
   * 
   * @type {Object}
   */
  const { 
    documents,
    pagination,
    loading,
    error
  } = useSelector(state => state.document);

  /**
   * Get search query, set query, search, and search loading from the useSearch hook
   * 
   * @type {Object}
   */
  const {
    query,
    setQuery,
    search,
    loading: searchLoading
  } = useSearch({
    debounceTime: 500,
    minChars: 2,
    autoSearch: true
  });

  /**
   * Handle fetch documents on component mount and when page, sortBy, or query changes
   * 
   * @type {function}
   */
  React.useEffect(() => {
    const [field, order] = sortBy.split('_');
    dispatch(fetchDocuments({
      page,
      limit: pagination.limit,
      sort: { field, order },
      ...query && { search: query }
    }));
  }, [dispatch, page, sortBy, query]);

  /**
   * Handle sort change
   * 
   * @param {Object} event - Event object
   */
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  /**
   * Handle page change
   * 
   * @param {Object} event - Event object
   * @param {number} value - New page number
   */
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  /**
   * Handle upload
   * 
   * @type {function}
   */
  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

  /**
   * Handle delete
   * 
   * @param {string} documentId - ID of the document to delete
   * @type {function}
   */
  const handleDelete = async (documentId) => {
    try {
      await dispatch(deleteDocument(documentId)).unwrap();
      // Refresh the current page
      dispatch(fetchDocuments({
        page,
        limit: pagination.limit,
        sort: sortBy
      }));
    } catch (err) {
      // Error is handled by the reducer
    }
  };

  // Show loading state
  if (loading || searchLoading) {
    return <LoadingState />;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">Documents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleUpload}
        >
          Upload Document
        </Button>
      </Box>

      {error && (
        <ErrorAlert
          error={error}
          sx={{ mb: 3 }}
        />
      )}

      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mb={2}
      >
        <FormControl
          size="small"
          sx={{ minWidth: 200 }}
        >
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            {sortOptions.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {documents.length === 0 ? (
        <NoData
          message="No documents found"
          description={query ? "Try adjusting your search" : "Upload your first document to get started"}
          actionLabel={!query && "Upload Document"}
          onAction={!query && handleUpload}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {documents.map((document) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
                <DocumentCard
                  document={document}
                  onView={() => {/* Handle view */}}
                  onEdit={() => {/* Handle edit */}}
                  onDelete={() => handleDelete(document.id)}
                  onDownload={() => {/* Handle download */}}
                  onShare={() => {/* Handle share */}}
                  onVersionHistory={() => {/* Handle version history */}}
                />
              </Grid>
            ))}
          </Grid>

          <Box
            display="flex"
            justifyContent="center"
            mt={4}
          >
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </Box>
  );
};

export default DocumentGrid;
