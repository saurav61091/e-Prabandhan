import * as Yup from 'yup';

const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const documentSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  department: Yup.string()
    .required('Department is required'),
  tags: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),
  file: Yup.mixed()
    .required('File is required')
    .test('fileSize', 'File size is too large', (value) => {
      if (!value) return true;
      return value.size <= MAX_FILE_SIZE;
    })
    .test('fileType', 'Unsupported file type', (value) => {
      if (!value) return true;
      return SUPPORTED_FILE_TYPES.includes(value.type);
    })
});

export const documentUpdateSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  department: Yup.string(),
  tags: Yup.array()
    .of(Yup.string())
    .max(10, 'Maximum 10 tags allowed'),
  version: Yup.string()
    .matches(/^\d+\.\d+\.\d+$/, 'Invalid version format')
});

export const documentSearchSchema = Yup.object().shape({
  query: Yup.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be less than 100 characters'),
  department: Yup.string(),
  status: Yup.string()
    .oneOf(['draft', 'pending', 'approved', 'rejected']),
  dateFrom: Yup.date()
    .max(Yup.ref('dateTo'), 'Start date must be before end date'),
  dateTo: Yup.date()
    .min(Yup.ref('dateFrom'), 'End date must be after start date')
});

export const documentFilterSchema = Yup.object().shape({
  departments: Yup.array()
    .of(Yup.string()),
  statuses: Yup.array()
    .of(Yup.string()
      .oneOf(['draft', 'pending', 'approved', 'rejected'])),
  tags: Yup.array()
    .of(Yup.string()),
  dateRange: Yup.object().shape({
    start: Yup.date(),
    end: Yup.date()
      .min(Yup.ref('start'), 'End date must be after start date')
  })
});
