export const DEMO_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
] as const;

export const DEMO_MESSAGES = {
  SUCCESS: 'Operation completed successfully!',
  LOADING: 'Processing request...',
  ERROR: 'Something went wrong. Please try again.',
} as const;

export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: 'Minimum length is 3 characters',
} as const;

export default DEMO_USERS; 