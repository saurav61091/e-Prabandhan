import * as Yup from 'yup';

export const workflowSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  steps: Yup.array()
    .of(
      Yup.object().shape({
        order: Yup.number()
          .min(1, 'Order must be at least 1')
          .required('Order is required'),
        approver: Yup.string()
          .required('Approver is required'),
        deadline: Yup.number()
          .min(1, 'Deadline must be at least 1 hour')
          .max(720, 'Deadline must be less than 30 days')
          .required('Deadline is required'),
        notifyBefore: Yup.number()
          .min(1, 'Notification time must be at least 1 hour')
          .max(Yup.ref('deadline'), 'Notification time must be less than deadline'),
        requiredDocuments: Yup.array()
          .of(Yup.string()),
        instructions: Yup.string()
          .max(1000, 'Instructions must be less than 1000 characters')
      })
    )
    .min(1, 'At least one step is required')
    .required('Steps are required')
});

export const workflowUpdateSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
  steps: Yup.array()
    .of(
      Yup.object().shape({
        order: Yup.number()
          .min(1, 'Order must be at least 1'),
        approver: Yup.string(),
        deadline: Yup.number()
          .min(1, 'Deadline must be at least 1 hour')
          .max(720, 'Deadline must be less than 30 days'),
        notifyBefore: Yup.number()
          .min(1, 'Notification time must be at least 1 hour')
          .max(Yup.ref('deadline'), 'Notification time must be less than deadline'),
        requiredDocuments: Yup.array()
          .of(Yup.string()),
        instructions: Yup.string()
          .max(1000, 'Instructions must be less than 1000 characters')
      })
    )
});

export const workflowApprovalSchema = Yup.object().shape({
  decision: Yup.string()
    .oneOf(['approve', 'reject'], 'Invalid decision')
    .required('Decision is required'),
  comments: Yup.string()
    .when('decision', {
      is: 'reject',
      then: Yup.string().required('Comments are required for rejection')
    })
    .max(1000, 'Comments must be less than 1000 characters'),
  attachments: Yup.array()
    .of(
      Yup.mixed()
        .test('fileSize', 'File size is too large', (value) => {
          if (!value) return true;
          return value.size <= 10 * 1024 * 1024; // 10MB
        })
    )
});

export const workflowFilterSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(['active', 'completed', 'cancelled']),
  department: Yup.string(),
  creator: Yup.string(),
  dateRange: Yup.object().shape({
    start: Yup.date(),
    end: Yup.date()
      .min(Yup.ref('start'), 'End date must be after start date')
  })
});
