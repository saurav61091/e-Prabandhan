import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import NoteSheet from './NoteSheet';
import SignatureDialog from './SignatureDialog';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const NotesheetContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [signatureDialogOpen, setSignatureDialogOpen] = React.useState(false);
  const [currentSigner, setCurrentSigner] = React.useState(null);
  const [alert, setAlert] = React.useState({ open: false, message: '', severity: 'success' });
  
  // Get notesheet data from Redux store
  const {
    notesheet,
    loading,
    error,
    currentUser,
    dopConfig,
    fppConfig
  } = useSelector(state => ({
    notesheet: state.notesheets.current,
    loading: state.notesheets.loading,
    error: state.notesheets.error,
    currentUser: state.auth.user,
    dopConfig: state.config.dop,
    fppConfig: state.config.fpp
  }));

  // Calculate required approvers based on DOP and FPP
  const getRequiredApprovers = React.useCallback(() => {
    const amount = notesheet?.amount || 0;
    const department = notesheet?.department;
    const category = notesheet?.category;
    
    // Get DOP level based on amount and department
    const dopLevel = dopConfig?.levels?.find(level => 
      amount >= level.minAmount && 
      amount <= level.maxAmount &&
      level.departments.includes(department)
    );

    // Get FPP requirements based on amount and category
    const fppRequirement = fppConfig?.requirements?.find(req =>
      amount >= req.minAmount &&
      amount <= req.maxAmount &&
      req.categories.includes(category)
    );

    // Combine and deduplicate approvers
    const requiredApprovers = new Set([
      ...(dopLevel?.approvers || []),
      ...(fppRequirement?.approvers || [])
    ]);

    return Array.from(requiredApprovers).map(role => ({
      role,
      dopLevel: dopLevel?.level,
      fppCategory: fppRequirement?.category,
      required: true
    }));
  }, [notesheet, dopConfig, fppConfig]);

  React.useEffect(() => {
    if (id) {
      // Fetch notesheet data
      // dispatch(fetchNotesheet(id));
    }
  }, [id]);

  const handleSign = (signerType) => {
    // Check if user has permission to sign
    const canSign = checkSigningPermission(signerType);
    
    if (!canSign) {
      setAlert({
        open: true,
        message: 'You do not have permission to sign here',
        severity: 'error'
      });
      return;
    }

    setCurrentSigner(signerType);
    setSignatureDialogOpen(true);
  };

  const handleSignatureSave = async (signatureData) => {
    try {
      // await dispatch(signNotesheet({
      //   notesheetId: id,
      //   signerType: currentSigner,
      //   signature: signatureData,
      //   timestamp: new Date().toISOString()
      // })).unwrap();

      setAlert({
        open: true,
        message: 'Signature added successfully',
        severity: 'success'
      });
    } catch (err) {
      setAlert({
        open: true,
        message: 'Failed to add signature',
        severity: 'error'
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('notesheet-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`notesheet-${id}.pdf`);

      setAlert({
        open: true,
        message: 'PDF downloaded successfully',
        severity: 'success'
      });
    } catch (err) {
      setAlert({
        open: true,
        message: 'Failed to download PDF',
        severity: 'error'
      });
    }
  };

  const checkSigningPermission = (signerType) => {
    const requiredApprovers = getRequiredApprovers();
    
    // Basic role checks
    if (signerType === 'initiatedBy') {
      return currentUser.role === 'initiator';
    }
    
    if (signerType === 'checker') {
      return currentUser.role === 'checker';
    }

    // For approvers, check both role and level
    if (signerType.startsWith('approver-')) {
      const index = parseInt(signerType.split('-')[1]);
      const approver = requiredApprovers[index];
      
      return currentUser.role === approver.role && 
             currentUser.dopLevel >= approver.dopLevel;
    }

    return false;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const requiredApprovers = getRequiredApprovers();

  return (
    <Box>
      <Box id="notesheet-content">
        <NoteSheet
          logo={notesheet?.organizationLogo}
          date={notesheet?.date}
          refNo={notesheet?.refNo}
          content={notesheet?.content}
          initiatedBy={notesheet?.initiatedBy}
          checker={notesheet?.checker}
          approvers={requiredApprovers}
          dopLevel={notesheet?.dopLevel}
          amount={notesheet?.amount}
          onSign={handleSign}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </Box>

      <SignatureDialog
        open={signatureDialogOpen}
        onClose={() => setSignatureDialogOpen(false)}
        onSave={handleSignatureSave}
        title={`Sign as ${currentSigner}`}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotesheetContainer;
