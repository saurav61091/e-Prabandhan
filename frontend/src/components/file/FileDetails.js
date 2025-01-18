import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  History as HistoryIcon,
  Note as NoteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`file-tabpanel-${index}`}
    aria-labelledby={`file-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const FileDetails = ({ fileId, onClose }) => {
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [noteContent, setNoteContent] = useState('');
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fileRes, historyRes, usersRes] = await Promise.all([
          axios.get(`/api/files/${fileId}`),
          axios.get(`/api/files/${fileId}/history`),
          axios.get('/api/users')
        ]);

        setFile(fileRes.data);
        setHistory(historyRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleAddNote = async () => {
    try {
      await axios.post(`/api/files/${fileId}/notes`, {
        content: noteContent,
        type: 'note'
      });

      // Refresh file data to get new note
      const fileRes = await axios.get(`/api/files/${fileId}`);
      setFile(fileRes.data);
      setNoteContent('');
    } catch (err) {
      setError('Failed to add note');
    }
  };

  const handleMoveFile = async () => {
    try {
      await axios.post(`/api/files/${fileId}/move`, {
        toUserId: selectedUser,
        action: 'transfer'
      });

      // Refresh file data
      const fileRes = await axios.get(`/api/files/${fileId}`);
      setFile(fileRes.data);
      setMoveDialogOpen(false);
    } catch (err) {
      setError('Failed to move file');
    }
  };

  const handleToggleConfidential = async () => {
    try {
      await axios.put(`/api/files/${fileId}`, {
        isConfidential: !file.isConfidential
      });

      // Refresh file data
      const fileRes = await axios.get(`/api/files/${fileId}`);
      setFile(fileRes.data);
    } catch (err) {
      setError('Failed to update file confidentiality');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!file) return <Typography>File not found</Typography>;

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h5">{file.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {file.fileNumber}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={handleDownload} title="Download">
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handleToggleConfidential} title="Toggle Confidential">
              {file.isConfidential ? <LockIcon /> : <LockOpenIcon />}
            </IconButton>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setMoveDialogOpen(true)}
            >
              Move
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Details" />
            <Tab label="Notes" />
            <Tab label="History" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Subject</Typography>
              <Typography>{file.subject}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Description</Typography>
              <Typography>{file.description}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Created By</Typography>
              <Typography>{file.creator?.name}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Current Location</Typography>
              <Typography>{file.currentHolder?.name}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Tags</Typography>
              <Box sx={{ mt: 1 }}>
                {file.tags.map((tag, index) => (
                  <Chip key={index} label={tag} sx={{ mr: 1 }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Add a note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<NoteIcon />}
              onClick={handleAddNote}
              sx={{ mt: 1 }}
            >
              Add Note
            </Button>
          </Box>
          <List>
            {file.FileNotes?.map((note) => (
              <ListItem key={note.id} divider>
                <ListItemText
                  primary={note.content}
                  secondary={`${note.User.name} - ${format(new Date(note.createdAt), 'PPpp')}`}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {history && (
            <>
              <Typography variant="h6" gutterBottom>
                Version History
              </Typography>
              <List>
                {history.versions.map((version) => (
                  <ListItem key={version.id} divider>
                    <ListItemText
                      primary={`Version ${version.versionNumber}`}
                      secondary={`Created by ${version.creator.name} on ${format(new Date(version.createdAt), 'PPpp')}`}
                    />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Movement History
              </Typography>
              <List>
                {history.movements.map((movement) => (
                  <ListItem key={movement.id} divider>
                    <ListItemText
                      primary={`${movement.fromUser.name} → ${movement.toUser.name}`}
                      secondary={`${movement.action} - ${format(new Date(movement.createdAt), 'PPpp')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>
      </CardContent>

      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)}>
        <DialogTitle>Move File</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select User"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            sx={{ mt: 1 }}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.department}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMoveFile} variant="contained" color="primary">
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FileDetails;
