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
  Tabs,
  Tab,
  Tooltip,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as UserIcon,
  Business as DepartmentIcon,
  Description as DocumentIcon,
  Assignment as TaskIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  Star as StarIcon,
  Schedule as RecentIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import ErrorAlert from '../common/ErrorAlert';

const GlobalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState(0);
  const [filterAnchor, setFilterAnchor] = React.useState(null);
  const [filters, setFilters] = React.useState({
    users: true,
    departments: true,
    documents: true,
    tasks: true
  });
  const { results, loading, error } = useSelector(state => state.globalSearch);

  // Debounced search function
  const debouncedSearch = React.useCallback(
    debounce((searchQuery) => {
      if (searchQuery.length >= 2) {
        // dispatch(searchAll({ query: searchQuery, filters }));
      }
    }, 300),
    [filters]
  );

  React.useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery('');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterClick = (event) => {
    setFilterAnchor(filterAnchor ? null : event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterToggle = (filter) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const handleItemClick = (item) => {
    switch (item.type) {
      case 'user':
        navigate(`/users/${item.id}`);
        break;
      case 'department':
        navigate(`/departments/${item.id}`);
        break;
      case 'document':
        navigate(`/documents/${item.id}`);
        break;
      case 'task':
        navigate(`/tasks/${item.id}`);
        break;
      default:
        break;
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'user':
        return <UserIcon color="primary" />;
      case 'department':
        return <DepartmentIcon color="primary" />;
      case 'document':
        return <DocumentIcon color="primary" />;
      case 'task':
        return <TaskIcon color="primary" />;
      default:
        return null;
    }
  };

  const renderResults = () => {
    if (!query) {
      return (
        <Box p={3} textAlign="center" color="text.secondary">
          <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
          <Typography variant="body1" mt={2}>
            Start typing to search across all content
          </Typography>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box p={3} textAlign="center">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p={3}>
          <ErrorAlert error={error} />
        </Box>
      );
    }

    if (!results?.length) {
      return (
        <Box p={3} textAlign="center" color="text.secondary">
          <Typography variant="body1">
            No results found for "{query}"
          </Typography>
          <Typography variant="body2" mt={1}>
            Try adjusting your search or filters
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {results.map((item) => (
          <React.Fragment key={`${item.type}-${item.id}`}>
            <ListItemButton onClick={() => handleItemClick(item)}>
              <ListItemIcon>
                {renderIcon(item.type)}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.description}
              />
              <Chip
                label={item.type}
                size="small"
                color={
                  item.type === 'user' ? 'primary' :
                  item.type === 'department' ? 'secondary' :
                  item.type === 'document' ? 'success' : 'warning'
                }
              />
            </ListItemButton>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          position: 'relative',
          zIndex: 1100
        }}
      >
        <TextField
          fullWidth
          placeholder="Search users, departments, documents, tasks..."
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
                <IconButton
                  edge="end"
                  onClick={handleFilterClick}
                  color={filterAnchor ? 'primary' : 'default'}
                  size="small"
                >
                  <FilterIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Popper
          open={Boolean(filterAnchor)}
          anchorEl={filterAnchor}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper elevation={3}>
                <ClickAwayListener onClickAway={handleFilterClose}>
                  <MenuList>
                    <MenuItem>
                      <ListItemIcon>
                        <UserIcon />
                      </ListItemIcon>
                      <ListItemText primary="Users" />
                      <Chip
                        label={filters.users ? 'On' : 'Off'}
                        color={filters.users ? 'primary' : 'default'}
                        size="small"
                        onClick={() => handleFilterToggle('users')}
                      />
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon>
                        <DepartmentIcon />
                      </ListItemIcon>
                      <ListItemText primary="Departments" />
                      <Chip
                        label={filters.departments ? 'On' : 'Off'}
                        color={filters.departments ? 'primary' : 'default'}
                        size="small"
                        onClick={() => handleFilterToggle('departments')}
                      />
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon>
                        <DocumentIcon />
                      </ListItemIcon>
                      <ListItemText primary="Documents" />
                      <Chip
                        label={filters.documents ? 'On' : 'Off'}
                        color={filters.documents ? 'primary' : 'default'}
                        size="small"
                        onClick={() => handleFilterToggle('documents')}
                      />
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon>
                        <TaskIcon />
                      </ListItemIcon>
                      <ListItemText primary="Tasks" />
                      <Chip
                        label={filters.tasks ? 'On' : 'Off'}
                        color={filters.tasks ? 'primary' : 'default'}
                        size="small"
                        onClick={() => handleFilterToggle('tasks')}
                      />
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>

        {query && (
          <Box mt={2}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                icon={<StarIcon />}
                label="Best Match"
              />
              <Tab
                icon={<UserIcon />}
                label={`Users (${results?.filter(r => r.type === 'user').length || 0})`}
              />
              <Tab
                icon={<DepartmentIcon />}
                label={`Departments (${results?.filter(r => r.type === 'department').length || 0})`}
              />
              <Tab
                icon={<DocumentIcon />}
                label={`Documents (${results?.filter(r => r.type === 'document').length || 0})`}
              />
              <Tab
                icon={<TaskIcon />}
                label={`Tasks (${results?.filter(r => r.type === 'task').length || 0})`}
              />
            </Tabs>
          </Box>
        )}
      </Paper>

      <Paper
        elevation={2}
        sx={{
          mt: 2,
          minHeight: 400,
          maxHeight: 600,
          overflow: 'auto'
        }}
      >
        {renderResults()}
      </Paper>

      {query && (
        <Box mt={2} display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <RecentIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Recent Searches:
            </Typography>
            {['user reports', 'budget 2024', 'project timeline'].map((term) => (
              <Chip
                key={term}
                label={term}
                size="small"
                onClick={() => setQuery(term)}
                onDelete={() => {/* Handle delete recent search */}}
              />
            ))}
          </Box>
          <Button
            startIcon={<TuneIcon />}
            onClick={() => {/* Open advanced search */}}
          >
            Advanced Search
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default GlobalSearch;
