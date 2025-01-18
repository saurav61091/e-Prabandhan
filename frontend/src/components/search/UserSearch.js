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
  Avatar,
  Tooltip,
  Card,
  CardContent,
  CardActionArea,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as UserIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  GridView as GridIcon,
  List as ListIcon,
  Business as DepartmentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as RoleIcon,
  Star as StarIcon,
  Circle as StatusIcon,
  Message as MessageIcon,
  PersonAdd as AddIcon
} from '@mui/icons-material';
import { debounce } from 'lodash';
import ErrorAlert from '../common/ErrorAlert';

const UserSearch = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState('grid');
  const [filters, setFilters] = React.useState({
    department: '',
    role: '',
    status: '',
    location: ''
  });
  const [sort, setSort] = React.useState('name');
  const { results, loading, error } = useSelector(state => state.userSearch);

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((searchQuery) => {
      if (searchQuery.length >= 2) {
        // dispatch(searchUsers({ query: searchQuery, filters, sort }));
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

  const handleMessage = (user) => {
    // Handle messaging user
  };

  const handleAddContact = (user) => {
    // Handle adding user to contacts
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      case 'busy':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderGridView = () => (
    <Grid container spacing={2}>
      {results?.map((user) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
          <Card>
            <CardActionArea>
              <Box p={2} textAlign="center">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <StatusIcon
                      sx={{
                        color: `${getStatusColor(user.status)}.main`,
                        backgroundColor: 'background.paper',
                        borderRadius: '50%'
                      }}
                    />
                  }
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 80, height: 80, margin: 'auto' }}
                  />
                </Badge>
                <Typography variant="h6" mt={2}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.role}
                </Typography>
                <Box mt={1} display="flex" justifyContent="center" gap={1}>
                  <Chip
                    icon={<DepartmentIcon />}
                    label={user.department}
                    size="small"
                  />
                  <Chip
                    icon={<LocationIcon />}
                    label={user.location}
                    size="small"
                  />
                </Box>
                <Box mt={2} display="flex" justifyContent="center" gap={1}>
                  <IconButton size="small" onClick={() => handleMessage(user)}>
                    <MessageIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleAddContact(user)}>
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <List>
      {results?.map((user) => (
        <React.Fragment key={user.id}>
          <ListItemButton>
            <ListItemIcon>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <StatusIcon
                    sx={{
                      color: `${getStatusColor(user.status)}.main`,
                      backgroundColor: 'background.paper',
                      borderRadius: '50%'
                    }}
                  />
                }
              >
                <Avatar src={user.avatar} alt={user.name} />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  {user.name}
                  {user.starred && (
                    <StarIcon fontSize="small" color="warning" />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {user.role}
                  </Typography>
                  <Box mt={1} display="flex" alignItems="center" gap={2}>
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <DepartmentIcon fontSize="small" />
                      {user.department}
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <EmailIcon fontSize="small" />
                      {user.email}
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <PhoneIcon fontSize="small" />
                      {user.phone}
                    </Typography>
                    <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
                      <LocationIcon fontSize="small" />
                      {user.location}
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <Box>
              <IconButton size="small" onClick={() => handleMessage(user)}>
                <MessageIcon />
              </IconButton>
              <IconButton size="small" onClick={() => handleAddContact(user)}>
                <AddIcon />
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
              placeholder="Search users by name, email, role..."
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
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                label="Role"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="away">Away</MenuItem>
                <MenuItem value="busy">Busy</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                label="Location"
              >
                <MenuItem value="">All</MenuItem>
                {/* Add location options */}
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
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="role">Role</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="location">Location</MenuItem>
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
              <UserIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary" mt={2}>
                No users found
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

export default UserSearch;
