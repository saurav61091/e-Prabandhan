import * as Yup from 'yup';

// Common validation rules
const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
const phoneRegExp = /^(\+?\d{1,3}[- ]?)?\d{10}$/;

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

export const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .matches(
      passwordRules,
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  department: Yup.string()
    .required('Department is required'),
  phone: Yup.string()
    .matches(phoneRegExp, 'Phone number is not valid')
    .nullable()
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
});

export const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .matches(
      passwordRules,
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .matches(
      passwordRules,
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    )
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});
