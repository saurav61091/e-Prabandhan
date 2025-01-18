import fs from 'fs';
import path from 'path';

const SIGNATURE_RECORD_FILE = path.join(process.cwd(), 'data', 'signature_records.txt');
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const generateSignatureId = () => {
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return id;
};

export const recordSignature = async (signatureData) => {
  const {
    signatureId,
    timestamp,
    documentNumber,
    userId,
    userName,
    userDesignation,
    documentType
  } = signatureData;

  // Get the last S.No from the file
  const fileContent = await fs.promises.readFile(SIGNATURE_RECORD_FILE, 'utf8');
  const lines = fileContent.split('\n');
  const lastLine = lines[lines.length - 1];
  const lastSNo = parseInt(lastLine.split('|')[0]) || 0;

  // Create new record
  const newRecord = [
    lastSNo + 1,
    signatureId,
    format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss'),
    documentNumber,
    userId,
    userName,
    userDesignation,
    documentType
  ].join('|');

  // Append to file
  await fs.promises.appendFile(SIGNATURE_RECORD_FILE, '\n' + newRecord);

  return signatureId;
};

export const verifySignature = async (signatureId) => {
  const fileContent = await fs.promises.readFile(SIGNATURE_RECORD_FILE, 'utf8');
  const lines = fileContent.split('\n');
  
  // Skip header line
  const record = lines.slice(1).find(line => line.split('|')[1] === signatureId);
  
  if (!record) {
    return null;
  }

  const [
    sNo,
    id,
    dateTime,
    documentNumber,
    userId,
    userName,
    userDesignation,
    documentType
  ] = record.split('|');

  return {
    sNo,
    signatureId: id,
    dateTime,
    documentNumber,
    userId,
    userName,
    userDesignation,
    documentType
  };
};
