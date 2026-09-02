'use client';

/**
 * @fileOverview Specialized Firestore error protocols.
 */

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;
  
  constructor(context: SecurityRuleContext) {
    super(`Firestore Permission Error: The request to ${context.path} was denied.`);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // Ensure the stack trace is captured correctly
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
