import * as Yup from 'yup';

export const departmentSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  code: Yup.string()
    .matches(/^[A-Z0-9-]+$/, 'Code must contain only uppercase letters, numbers, and hyphens')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be less than 20 characters')
    .required('Code is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  parentDepartment: Yup.string()
    .nullable(),
  head: Yup.string()
    .required('Department head is required'),
  location: Yup.string()
    .max(200, 'Location must be less than 200 characters'),
  contact: Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Invalid phone number')
      .nullable(),
    address: Yup.string()
      .max(500, 'Address must be less than 500 characters')
  })
});

export const departmentUpdateSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  head: Yup.string(),
  location: Yup.string()
    .max(200, 'Location must be less than 200 characters'),
  contact: Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address'),
    phone: Yup.string()
      .matches(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'Invalid phone number')
      .nullable(),
    address: Yup.string()
      .max(500, 'Address must be less than 500 characters')
  })
});

export const departmentMergeSchema = Yup.object().shape({
  sourceDepartment: Yup.string()
    .required('Source department is required'),
  targetDepartment: Yup.string()
    .required('Target department is required')
    .notOneOf([Yup.ref('sourceDepartment')], 'Source and target departments must be different'),
  transferEmployees: Yup.boolean()
    .required('Employee transfer preference is required'),
  transferDocuments: Yup.boolean()
    .required('Document transfer preference is required'),
  transferWorkflows: Yup.boolean()
    .required('Workflow transfer preference is required'),
  effectiveDate: Yup.date()
    .min(new Date(), 'Effective date must be in the future')
    .required('Effective date is required'),
  reason: Yup.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters')
    .required('Reason is required')
});
