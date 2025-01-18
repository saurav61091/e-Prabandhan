import * as yup from 'yup';

export const notificationPreferencesSchema = yup.object().shape({
  emailNotifications: yup.boolean().required('Email notifications preference is required'),
  pushNotifications: yup.boolean().required('Push notifications preference is required'),
  smsNotifications: yup.boolean().required('SMS notifications preference is required'),
  notifyOnNewDocument: yup.boolean().required('New document notification preference is required'),
  notifyOnApproval: yup.boolean().required('Approval notification preference is required'),
  notifyOnRejection: yup.boolean().required('Rejection notification preference is required'),
  notifyOnComment: yup.boolean().required('Comment notification preference is required'),
  notifyOnMention: yup.boolean().required('Mention notification preference is required'),
  notifyOnDeadline: yup.boolean().required('Deadline notification preference is required'),
  emailFrequency: yup.string().oneOf(['immediate', 'daily', 'weekly'], 'Invalid email frequency').required('Email frequency is required'),
  pushFrequency: yup.string().oneOf(['immediate', 'daily', 'weekly'], 'Invalid push frequency').required('Push frequency is required'),
  smsFrequency: yup.string().oneOf(['immediate', 'daily', 'weekly'], 'Invalid SMS frequency').required('SMS frequency is required'),
});

export const notificationSettingsSchema = yup.object().shape({
  preferences: notificationPreferencesSchema,
  blacklistedUsers: yup.array().of(
    yup.string().required('User ID is required')
  ),
  blacklistedDocumentTypes: yup.array().of(
    yup.string().required('Document type is required')
  ),
  quietHours: yup.object().shape({
    enabled: yup.boolean().required('Quiet hours enabled preference is required'),
    startTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').required('Start time is required'),
    endTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').required('End time is required'),
  }),
  customFilters: yup.array().of(
    yup.object().shape({
      field: yup.string().required('Filter field is required'),
      operator: yup.string().oneOf(['equals', 'contains', 'startsWith', 'endsWith'], 'Invalid operator').required('Filter operator is required'),
      value: yup.string().required('Filter value is required'),
    })
  ),
});
