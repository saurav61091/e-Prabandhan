import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Avatar,
  Button,
  TextField,
  Stack
} from '@mui/material';
import QRCode from 'qrcode.react';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';
import { generateSignatureId } from '../../utils/signatureUtils';

const SignatureBox = styled(Box)(({ theme }) => ({
  minHeight: 100,
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const SignatureName = styled(Typography)(({ theme }) => ({
  fontFamily: 'Pacifico, cursive',
  fontSize: '1.5rem',
  color: theme.palette.primary.main
}));

const SignatureDetails = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(1)
}));

const SignatureComponent = ({ signature, name, designation, timestamp, signatureId }) => (
  <Box>
    <SignatureName>
      {name}
    </SignatureName>
    <SignatureDetails>
      <Typography variant="body2">
        {name}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {designation}
      </Typography>
      <Typography variant="caption" display="block">
        {format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss')}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        ID: {signatureId}
      </Typography>
    </SignatureDetails>
  </Box>
);

const PageHeader = ({ logo, date, refNo }) => (
  <Grid container spacing={2} alignItems="flex-start" mb={4}>
    <Grid item xs={4}>
      {logo ? (
        <img src={logo} alt="Organization Logo" style={{ maxHeight: 80 }} />
      ) : (
        <Typography variant="h4">LOGO</Typography>
      )}
    </Grid>
    <Grid item xs={4} />
    <Grid item xs={4}>
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <QRCode 
          value={JSON.stringify({
            refNo,
            date,
            timestamp: new Date().toISOString()
          })}
          size={80}
          level="H"
          includeMargin
        />
        <Typography variant="body2" mt={1}>
          Date: {format(new Date(date), 'dd/MM/yyyy')}
        </Typography>
        <Typography variant="body2">
          Ref No: {refNo}
        </Typography>
      </Box>
    </Grid>
  </Grid>
);

const PageFooter = ({ pageNumber, totalPages }) => (
  <Box
    position="absolute"
    bottom={20}
    left={0}
    right={0}
    display="flex"
    justifyContent="center"
    alignItems="center"
    p={2}
  >
    <Typography variant="body2">
      Page {pageNumber} of {totalPages}
    </Typography>
  </Box>
);

const NoteSheet = ({
  logo,
  date,
  refNo,
  content,
  initiatedBy,
  checker,
  approvers = [], // Dynamic list of approvers based on DOP/FPP
  dopLevel, // Delegation of Power level
  amount, // Transaction/Project amount for FPP
  onSign,
  onPrint,
  onDownload
}) => {
  // Split content into pages (approximately 800 characters per page)
  const pageSize = 800;
  const contentPages = React.useMemo(() => {
    const pages = [];
    let currentPage = '';
    const words = content.split(' ');
    
    words.forEach(word => {
      if ((currentPage + ' ' + word).length > pageSize) {
        pages.push(currentPage.trim());
        currentPage = word;
      } else {
        currentPage += (currentPage ? ' ' : '') + word;
      }
    });
    
    if (currentPage) {
      pages.push(currentPage.trim());
    }
    
    return pages;
  }, [content]);

  const totalPages = contentPages.length;

  return (
    <Stack spacing={4}>
      {contentPages.map((pageContent, pageIndex) => (
        <Paper 
          key={pageIndex}
          elevation={0}
          sx={{
            width: '210mm', // A4 width
            minHeight: '297mm', // A4 height
            padding: 4,
            margin: 'auto',
            backgroundColor: '#fff',
            position: 'relative',
            pageBreakAfter: 'always'
          }}
        >
          <PageHeader
            logo={logo}
            date={date}
            refNo={refNo}
          />

          {/* Page Content */}
          <Box mb={4} minHeight={pageIndex === totalPages - 1 ? '30vh' : '75vh'}>
            <TextField
              fullWidth
              multiline
              variant="outlined"
              value={pageContent}
              InputProps={{
                readOnly: true,
                sx: {
                  backgroundColor: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
            />
          </Box>

          {/* Signatures Section - Only on the last page */}
          {pageIndex === totalPages - 1 && (
            <Box mt={4} mb={8}>
              {/* Initiated By */}
              <Box mb={4}>
                <Typography variant="subtitle2" gutterBottom>
                  {initiatedBy?.designation}
                </Typography>
                <SignatureBox onClick={() => onSign('initiatedBy')}>
                  {initiatedBy?.signature ? (
                    <SignatureComponent
                      signature={initiatedBy.signature}
                      name={initiatedBy.name}
                      designation={initiatedBy.designation}
                      timestamp={initiatedBy.timestamp}
                      signatureId={initiatedBy.signatureId}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      Click to sign
                    </Typography>
                  )}
                </SignatureBox>
              </Box>

              {/* Checker */}
              <Box mb={4}>
                <Typography variant="subtitle2" gutterBottom>
                  {checker?.designation}
                </Typography>
                <SignatureBox onClick={() => onSign('checker')}>
                  {checker?.signature ? (
                    <SignatureComponent
                      signature={checker.signature}
                      name={checker.name}
                      designation={checker.designation}
                      timestamp={checker.timestamp}
                      signatureId={checker.signatureId}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      Click to sign
                    </Typography>
                  )}
                </SignatureBox>
              </Box>

              {/* Dynamic Approvers based on DOP/FPP */}
              {approvers.map((approver, index) => (
                <Box key={index} mb={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    {approver.designation}
                  </Typography>
                  <SignatureBox onClick={() => onSign(`approver-${index}`)}>
                    {approver?.signature ? (
                      <SignatureComponent
                        signature={approver.signature}
                        name={approver.name}
                        designation={approver.designation}
                        timestamp={approver.timestamp}
                        signatureId={approver.signatureId}
                      />
                    ) : (
                      <Typography color="text.secondary">
                        Click to sign
                      </Typography>
                    )}
                  </SignatureBox>
                </Box>
              ))}
            </Box>
          )}

          <PageFooter 
            pageNumber={pageIndex + 1} 
            totalPages={totalPages} 
          />
        </Paper>
      ))}

      {/* Action Buttons */}
      <Box 
        position="fixed" 
        bottom={0} 
        right={0} 
        p={2} 
        bgcolor="background.paper"
        boxShadow={2}
      >
        <Button 
          variant="contained" 
          onClick={onPrint}
          sx={{ mr: 1 }}
        >
          Print
        </Button>
        <Button 
          variant="outlined"
          onClick={onDownload}
        >
          Download PDF
        </Button>
      </Box>
    </Stack>
  );
};

export default NoteSheet;
