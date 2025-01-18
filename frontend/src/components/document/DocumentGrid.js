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

const sortOptions = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' }
];

const DocumentGrid = () => {
  const dispatch = useDispatch();
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState('createdAt_desc');
  
  const { 
    documents,
    pagination,
    loading,
    error
  } = useSelector(state => state.document);

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

  React.useEffect(() => {
    const [field, order] = sortBy.split('_');
    dispatch(fetchDocuments({
      page,
      limit: pagination.limit,
      sort: { field, order },
      ...query && { search: query }
    }));
  }, [dispatch, page, sortBy, query]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

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
