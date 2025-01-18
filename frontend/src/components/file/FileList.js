import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Pagination,
  Tooltip,
  Checkbox
} from '@mui/material';
import {
  Download,
  Delete,
  Edit,
  Search as SearchIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FileDetails from './FileDetails';
import BatchOperations from './BatchOperations';
import { format } from 'date-fns';

const FileList = () => {
  const [files, setFiles] = useState({ files: [], pagination: {} });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    priority: '',
    fromDate: '',
    toDate: ''
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
    fetchDepartments();
  }, [search, filters, page]);

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams({
        search,
        page,
        limit: 10,
        ...filters
      });
      
      const response = await axios.get(`/api/files?${params}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`/api/files/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`/api/files/${id}`);
        fetchFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      department: '',
      priority: '',
      fromDate: '',
      toDate: ''
    });
    setPage(1);
  };

  const toggleConfidential = async (file) => {
    try {
      await axios.put(`/api/files/${file.id}`, {
        isConfidential: !file.isConfidential
      });
      fetchFiles();
    } catch (error) {
      console.error('Error updating file confidentiality:', error);
    }
  };

  const handleSelectFile = (file) => {
    const isSelected = selectedFiles.some(f => f.id === file.id);
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleBatchOperationComplete = () => {
    setSelectedFiles([]);
    fetchFiles();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Files</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <BatchOperations
            selectedFiles={selectedFiles}
            onComplete={handleBatchOperationComplete}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          {Object.values(filters).some(Boolean) && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>

      {showFilters && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={handleFilterChange('status')}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={handleFilterChange('department')}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={handleFilterChange('priority')}
                label="Priority"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="From Date"
                  value={filters.fromDate}
                  onChange={handleFilterChange('fromDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="To Date"
                  value={filters.toDate}
                  onChange={handleFilterChange('toDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by file number, name, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={files.files.length > 0 && selectedFiles.length === files.files.length}
                  indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.files.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFiles(files.files);
                    } else {
                      setSelectedFiles([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>File Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Current Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.files.map((file) => (
              <TableRow
                key={file.id}
                selected={selectedFiles.some(f => f.id === file.id)}
                onClick={() => handleSelectFile(file)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedFiles.some(f => f.id === file.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleSelectFile(file)}
                  />
                </TableCell>
                <TableCell>{file.fileNumber}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {file.isConfidential && <LockIcon fontSize="small" color="warning" />}
                    {file.name}
                  </Box>
                </TableCell>
                <TableCell>{file.subject}</TableCell>
                <TableCell>{file.currentHolder?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={file.status}
                    color={
                      file.status === 'completed'
                        ? 'success'
                        : file.status === 'in_progress'
                        ? 'primary'
                        : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={file.priority}
                    color={
                      file.priority === 'high'
                        ? 'error'
                        : file.priority === 'medium'
                        ? 'warning'
                        : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(file.updatedAt), 'PPp')}
                </TableCell>
                <TableCell>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file.id);
                      }}
                      size="small"
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/files/edit/${file.id}`);
                      }}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Confidential">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleConfidential(file);
                      }}
                      size="small"
                      color={file.isConfidential ? 'warning' : 'default'}
                    >
                      {file.isConfidential ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={files.pagination?.pages || 1}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog
        open={Boolean(selectedFile)}
        onClose={() => setSelectedFile(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedFile && (
          <FileDetails
            fileId={selectedFile}
            onClose={() => {
              setSelectedFile(null);
              fetchFiles();
            }}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default FileList;
