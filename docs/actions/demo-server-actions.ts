'use server';

import { makeServerAction } from 'nexting';
import { z } from 'zod';
import { DEMO_USERS, DEMO_MESSAGES } from '../constants/demo-data';

// Simple server action without validation
export const getServerTimeAction = makeServerAction(async () => {
  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    timestamp: new Date().toISOString(),
    message: DEMO_MESSAGES.SUCCESS,
  };
});

// Server action with validation
export const createUserAction = makeServerAction(async (props) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate user creation
  const newUser = {
    id: Date.now().toString(),
    name: props.name,
    email: props.email,
    createdAt: new Date().toISOString(),
  };
  
  return newUser;
}, {
  validationSchema: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
  }),
});

// Server action that can throw errors
export const validateNumberAction = makeServerAction(async (props) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (props.number < 0) {
    throw new Error('Number must be positive');
  }
  
  if (props.number > 100) {
    throw new Error('Number must be less than or equal to 100');
  }
  
  return {
    number: props.number,
    squared: props.number * props.number,
    isEven: props.number % 2 === 0,
  };
}, {
  validationSchema: z.object({
    number: z.number().min(0).max(100),
  }),
});

// Server action with complex validation
export const searchUsersAction = makeServerAction(async (props) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const filteredUsers = DEMO_USERS.filter(user => 
    user.name.toLowerCase().includes(props.query.toLowerCase()) ||
    user.email.toLowerCase().includes(props.query.toLowerCase())
  );
  
  return {
    query: props.query,
    results: filteredUsers,
    total: filteredUsers.length,
  };
}, {
  validationSchema: z.object({
    query: z.string().min(1, 'Search query is required'),
    limit: z.number().optional().default(10),
  }),
});

 