import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  Code as CodeIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';

const TEMPLATE_VARIABLES = {
  user: ['{{user.name}}', '{{user.email}}', '{{user.designation}}'],
  document: ['{{document.title}}', '{{document.number}}', '{{document.url}}'],
  organization: ['{{org.name}}', '{{org.logo}}', '{{org.address}}'],
  workflow: ['{{workflow.status}}', '{{workflow.nextApprover}}', '{{workflow.dueDate}}'],
};

const DEFAULT_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{org.name}}',
    body: `<h2>Welcome to {{org.name}}</h2>
<p>Dear {{user.name}},</p>
<p>Welcome to our document management system. Your account has been created successfully.</p>
<p>Your login credentials:</p>
<ul>
  <li>Email: {{user.email}}</li>
  <li>Password: (sent separately)</li>
</ul>
<p>Best regards,<br>{{org.name}} Team</p>`,
    variables: ['user.name', 'user.email', 'org.name'],
  },
  {
    id: 'document_approval',
    name: 'Document Approval Request',
    subject: 'Document Approval Required: {{document.title}}',
    body: `<h2>Document Approval Required</h2>
<p>Dear {{user.name}},</p>
<p>A new document requires your approval:</p>
<ul>
  <li>Document: {{document.title}}</li>
  <li>Reference: {{document.number}}</li>
  <li>Due Date: {{workflow.dueDate}}</li>
</ul>
<p>Please click <a href="{{document.url}}">here</a> to review the document.</p>
<p>Best regards,<br>{{org.name}} Team</p>`,
    variables: [
      'user.name',
      'document.title',
      'document.number',
      'document.url',
      'workflow.dueDate',
      'org.name',
    ],
  },
];

const EmailTemplateSettings = () => {
  const [templates, setTemplates] = React.useState(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleAddTemplate = () => {
    setSelectedTemplate({
      id: '',
      name: '',
      subject: '',
      body: '',
      variables: [],
    });
    setOpenDialog(true);
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setOpenDialog(true);
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    try {
      // Save template to backend
      if (selectedTemplate.id) {
        setTemplates(
          templates.map((t) =>
            t.id === selectedTemplate.id ? selectedTemplate : t
          )
        );
      } else {
        const newTemplate = {
          ...selectedTemplate,
          id: Date.now().toString(),
        };
        setTemplates([...templates, newTemplate]);
      }
      setOpenDialog(false);
    } catch (error) {
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setPreviewMode(true);
    setOpenDialog(true);
  };

  const renderVariableChips = (variables) => {
    return variables.map((variable) => (
      <Chip
        key={variable}
        label={`{{${variable}}}`}
        size="small"
        sx={{ m: 0.5 }}
      />
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Email Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTemplate}
        >
          Add Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Template List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <List>
                {templates.map((template) => (
                  <ListItem
                    key={template.id}
                    divider
                  >
                    <ListItemText
                      primary={template.name}
                      secondary={template.subject}
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Preview">
                          <IconButton
                            edge="end"
                            onClick={() => handlePreview(template)}
                          >
                            <PreviewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            edge="end"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Variables Reference */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Variables
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => (
                  <Grid item xs={12} sm={6} key={category}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {category.charAt(0).toUpperCase() + category.slice(1)} Variables
                        </Typography>
                        <Box>
                          {variables.map((variable) => (
                            <Chip
                              key={variable}
                              label={variable}
                              size="small"
                              sx={{ m: 0.5 }}
                              onClick={() => {
                                if (selectedTemplate) {
                                  // Insert variable at cursor position
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Template Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewMode
            ? 'Preview Template'
            : selectedTemplate?.id
            ? 'Edit Template'
            : 'Add Template'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {!previewMode && (
              <>
                <TextField
                  label="Template Name"
                  value={selectedTemplate?.name || ''}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      name: e.target.value,
                    })
                  }
                  fullWidth
                />

                <TextField
                  label="Email Subject"
                  value={selectedTemplate?.subject || ''}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      subject: e.target.value,
                    })
                  }
                  fullWidth
                />
              </>
            )}

            <Editor
              apiKey="your-tinymce-api-key"
              value={selectedTemplate?.body || ''}
              init={{
                height: 500,
                menubar: !previewMode,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount',
                ],
                toolbar: previewMode
                  ? false
                  : 'undo redo | formatselect | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help',
                content_style: `
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    padding: 20px;
                  }
                `,
              }}
              disabled={previewMode}
              onEditorChange={(content) =>
                setSelectedTemplate({
                  ...selectedTemplate,
                  body: content,
                })
              }
            />

            {!previewMode && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Used Variables
                </Typography>
                {renderVariableChips(selectedTemplate?.variables || [])}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Close
          </Button>
          {!previewMode && (
            <LoadingButton
              loading={loading}
              variant="contained"
              onClick={handleSaveTemplate}
              disabled={
                !selectedTemplate?.name ||
                !selectedTemplate?.subject ||
                !selectedTemplate?.body
              }
            >
              Save Template
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplateSettings;
