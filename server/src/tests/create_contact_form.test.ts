import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactFormTable } from '../db/schema';
import { type CreateContactFormInput } from '../schema';
import { createContactForm } from '../handlers/create_contact_form';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateContactFormInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  subject: 'Inquiry about services',
  message: 'Hello, I would like to know more about your services.'
};

// Test input without optional subject
const testInputNoSubject: CreateContactFormInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  subject: null,
  message: 'This is a message without a subject.'
};

describe('createContactForm', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact form submission with all fields', async () => {
    const result = await createContactForm(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.subject).toEqual('Inquiry about services');
    expect(result.message).toEqual('Hello, I would like to know more about your services.');
    expect(result.id).toBeDefined();
    expect(result.submitted_at).toBeInstanceOf(Date);
  });

  it('should create a contact form submission without subject', async () => {
    const result = await createContactForm(testInputNoSubject);

    // Basic field validation
    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.subject).toBeNull();
    expect(result.message).toEqual('This is a message without a subject.');
    expect(result.id).toBeDefined();
    expect(result.submitted_at).toBeInstanceOf(Date);
  });

  it('should save contact form submission to database', async () => {
    const result = await createContactForm(testInput);

    // Query using proper drizzle syntax
    const submissions = await db.select()
      .from(contactFormTable)
      .where(eq(contactFormTable.id, result.id))
      .execute();

    expect(submissions).toHaveLength(1);
    expect(submissions[0].name).toEqual('John Doe');
    expect(submissions[0].email).toEqual('john.doe@example.com');
    expect(submissions[0].subject).toEqual('Inquiry about services');
    expect(submissions[0].message).toEqual('Hello, I would like to know more about your services.');
    expect(submissions[0].submitted_at).toBeInstanceOf(Date);
  });

  it('should handle multiple contact form submissions', async () => {
    // Create first submission
    const result1 = await createContactForm(testInput);
    
    // Create second submission
    const result2 = await createContactForm(testInputNoSubject);

    // Verify both submissions exist in database
    const allSubmissions = await db.select()
      .from(contactFormTable)
      .execute();

    expect(allSubmissions).toHaveLength(2);
    
    // Verify both submissions have different IDs
    expect(result1.id).not.toEqual(result2.id);
    
    // Verify both submissions are in the database
    const names = allSubmissions.map(s => s.name).sort();
    expect(names).toEqual(['Jane Smith', 'John Doe']);
  });

  it('should automatically set submission timestamp', async () => {
    const beforeSubmission = new Date();
    
    const result = await createContactForm(testInput);
    
    const afterSubmission = new Date();

    // Verify timestamp is within reasonable range
    expect(result.submitted_at).toBeInstanceOf(Date);
    expect(result.submitted_at.getTime()).toBeGreaterThanOrEqual(beforeSubmission.getTime());
    expect(result.submitted_at.getTime()).toBeLessThanOrEqual(afterSubmission.getTime());
  });
});