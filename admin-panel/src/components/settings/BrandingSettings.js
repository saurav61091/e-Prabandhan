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
  Avatar,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const PreviewCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
}));

const BrandingSettings = () => {
  const theme = useTheme();
  const [logo, setLogo] = React.useState(null);
  const [favicon, setFavicon] = React.useState(null);
  const [primaryColor, setPrimaryColor] = React.useState('#1976d2');
  const [secondaryColor, setSecondaryColor] = React.useState('#dc004e');
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [activeColor, setActiveColor] = React.useState('primary');

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFavicon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (color) => {
    if (activeColor === 'primary') {
      setPrimaryColor(color.hex);
    } else {
      setSecondaryColor(color.hex);
    }
  };

  const handleSave = async () => {
    try {
      // Save branding settings to backend
      const formData = new FormData();
      formData.append('logo', logo);
      formData.append('favicon', favicon);
      formData.append('primaryColor', primaryColor);
      formData.append('secondaryColor', secondaryColor);

      // await api.post('/settings/branding', formData);

      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Branding Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Logo & Favicon */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Logo & Favicon
              </Typography>
              <Stack spacing={4}>
                {/* Logo Upload */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Organization Logo
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={logo}
                      alt="Logo"
                      sx={{ width: 100, height: 100 }}
                      variant="rounded"
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<UploadIcon />}
                      >
                        Upload Logo
                        <VisuallyHiddenInput
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                        />
                      </Button>
                      {logo && (
                        <IconButton
                          color="error"
                          onClick={() => setLogo(null)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                </Box>

                <Divider />

                {/* Favicon Upload */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Favicon
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={favicon}
                      alt="Favicon"
                      sx={{ width: 48, height: 48 }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<UploadIcon />}
                      >
                        Upload Favicon
                        <VisuallyHiddenInput
                          type="file"
                          accept="image/x-icon,image/png"
                          onChange={handleFaviconChange}
                        />
                      </Button>
                      {favicon && (
                        <IconButton
                          color="error"
                          onClick={() => setFavicon(null)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Color Theme */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Color Theme
              </Typography>
              <Stack spacing={3}>
                {/* Primary Color */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Primary Color
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: primaryColor,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      onClick={() => {
                        setActiveColor('primary');
                        setShowColorPicker(true);
                      }}
                    />
                    <Typography>{primaryColor}</Typography>
                  </Box>
                </Box>

                {/* Secondary Color */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Secondary Color
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: secondaryColor,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      onClick={() => {
                        setActiveColor('secondary');
                        setShowColorPicker(true);
                      }}
                    />
                    <Typography>{secondaryColor}</Typography>
                  </Box>
                </Box>

                {/* Color Picker Popover */}
                {showColorPicker && (
                  <Box
                    sx={{
                      position: 'absolute',
                      zIndex: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                      }}
                      onClick={() => setShowColorPicker(false)}
                    />
                    <SketchPicker
                      color={activeColor === 'primary' ? primaryColor : secondaryColor}
                      onChange={handleColorChange}
                    />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview */}
        <Grid item xs={12}>
          <PreviewCard>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: 600,
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  src={logo}
                  alt="Logo"
                  sx={{ width: 48, height: 48 }}
                  variant="rounded"
                />
                <Typography variant="h5" sx={{ color: primaryColor }}>
                  Your Organization Name
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: primaryColor }}
                >
                  Primary Button
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: secondaryColor }}
                >
                  Secondary Button
                </Button>
              </Stack>
            </Box>
          </PreviewCard>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrandingSettings;
