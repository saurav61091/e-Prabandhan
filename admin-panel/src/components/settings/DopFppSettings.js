import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const DopFppSettings = () => {
  const [dopRules, setDopRules] = React.useState([]);
  const [fppRules, setFppRules] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogType, setDialogType] = React.useState('dop'); // 'dop' or 'fpp'
  const [currentRule, setCurrentRule] = React.useState(null);

  const departments = [
    'Finance',
    'HR',
    'IT',
    'Legal',
    'Operations',
  ];

  const categories = [
    'Capital Expenditure',
    'Operational Expenditure',
    'Human Resources',
    'IT Equipment',
    'Travel',
    'Training',
  ];

  const roles = [
    'Director',
    'Manager',
    'Supervisor',
    'Team Lead',
    'Employee',
  ];

  const handleAddRule = (type) => {
    setDialogType(type);
    setCurrentRule({
      id: Date.now(),
      name: '',
      minAmount: 0,
      maxAmount: 0,
      departments: [],
      categories: [],
      approvers: [],
      level: 1,
    });
    setOpenDialog(true);
  };

  const handleEditRule = (rule, type) => {
    setDialogType(type);
    setCurrentRule(rule);
    setOpenDialog(true);
  };

  const handleDeleteRule = (ruleId, type) => {
    if (type === 'dop') {
      setDopRules(dopRules.filter((r) => r.id !== ruleId));
    } else {
      setFppRules(fppRules.filter((r) => r.id !== ruleId));
    }
  };

  const handleSaveRule = () => {
    if (dialogType === 'dop') {
      if (currentRule.id) {
        setDopRules(
          dopRules.map((r) =>
            r.id === currentRule.id ? currentRule : r
          )
        );
      } else {
        setDopRules([...dopRules, currentRule]);
      }
    } else {
      if (currentRule.id) {
        setFppRules(
          fppRules.map((r) =>
            r.id === currentRule.id ? currentRule : r
          )
        );
      } else {
        setFppRules([...fppRules, currentRule]);
      }
    }
    setOpenDialog(false);
  };

  const dopColumns = [
    { field: 'name', headerName: 'Rule Name', flex: 1 },
    {
      field: 'minAmount',
      headerName: 'Min Amount',
      type: 'number',
      width: 130,
      valueFormatter: (params) =>
        params.value.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        }),
    },
    {
      field: 'maxAmount',
      headerName: 'Max Amount',
      type: 'number',
      width: 130,
      valueFormatter: (params) =>
        params.value.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        }),
    },
    {
      field: 'departments',
      headerName: 'Departments',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((dept) => (
            <Chip key={dept} label={dept} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 100,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleEditRule(params.row, 'dop')}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteRule(params.row.id, 'dop')}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const fppColumns = [
    { field: 'name', headerName: 'Rule Name', flex: 1 },
    {
      field: 'minAmount',
      headerName: 'Min Amount',
      type: 'number',
      width: 130,
      valueFormatter: (params) =>
        params.value.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        }),
    },
    {
      field: 'maxAmount',
      headerName: 'Max Amount',
      type: 'number',
      width: 130,
      valueFormatter: (params) =>
        params.value.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        }),
    },
    {
      field: 'categories',
      headerName: 'Categories',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((cat) => (
            <Chip key={cat} label={cat} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'approvers',
      headerName: 'Approvers',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleEditRule(params.row, 'fpp')}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteRule(params.row.id, 'fpp')}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        DOP & FPP Settings
      </Typography>

      {/* DOP Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Delegation of Power (DOP)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddRule('dop')}
            >
              Add DOP Rule
            </Button>
          </Box>

          <DataGrid
            rows={dopRules}
            columns={dopColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
            disableSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* FPP Section */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Financial Power Policy (FPP)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddRule('fpp')}
            >
              Add FPP Rule
            </Button>
          </Box>

          <DataGrid
            rows={fppRules}
            columns={fppColumns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            autoHeight
            disableSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Rule Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentRule?.id
            ? `Edit ${dialogType.toUpperCase()} Rule`
            : `Add ${dialogType.toUpperCase()} Rule`}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Rule Name"
              fullWidth
              value={currentRule?.name || ''}
              onChange={(e) =>
                setCurrentRule({ ...currentRule, name: e.target.value })
              }
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Minimum Amount"
                  type="number"
                  fullWidth
                  value={currentRule?.minAmount || ''}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      minAmount: Number(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Maximum Amount"
                  type="number"
                  fullWidth
                  value={currentRule?.maxAmount || ''}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      maxAmount: Number(e.target.value),
                    })
                  }
                />
              </Grid>
            </Grid>

            {dialogType === 'dop' ? (
              <>
                <Autocomplete
                  multiple
                  options={departments}
                  value={currentRule?.departments || []}
                  onChange={(_, newValue) =>
                    setCurrentRule({ ...currentRule, departments: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Departments" />
                  )}
                />
                <TextField
                  label="Level"
                  type="number"
                  fullWidth
                  value={currentRule?.level || ''}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      level: Number(e.target.value),
                    })
                  }
                />
              </>
            ) : (
              <>
                <Autocomplete
                  multiple
                  options={categories}
                  value={currentRule?.categories || []}
                  onChange={(_, newValue) =>
                    setCurrentRule({ ...currentRule, categories: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Categories" />
                  )}
                />
                <Autocomplete
                  multiple
                  options={roles}
                  value={currentRule?.approvers || []}
                  onChange={(_, newValue) =>
                    setCurrentRule({ ...currentRule, approvers: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Approvers" />
                  )}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRule}
            disabled={
              !currentRule?.name ||
              currentRule?.minAmount === undefined ||
              currentRule?.maxAmount === undefined ||
              (dialogType === 'dop'
                ? !currentRule?.departments?.length || !currentRule?.level
                : !currentRule?.categories?.length || !currentRule?.approvers?.length)
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DopFppSettings;
