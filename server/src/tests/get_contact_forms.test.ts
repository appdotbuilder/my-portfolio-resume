import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactFormTable } from '../db/schema';
import { type CreateContactFormInput } from '../schema';
import { getContactForms } from '../handlers/get_contact_forms';

// Test contact form inputs
const testContactForm1: CreateContactFormInput = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject 1',
  message: 'Test message content 1'
};

const testContactForm2: CreateContactFormInput = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  subject: null, // Testing nullable subject
  message: 'Test message content 2'
};

const testContactForm3: CreateContactFormInput = {
  name: 'Bob Johnson',
  email: 'bob@example.com',
  subject: 'Test Subject 3',
  message: 'Test message content 3'
};

describe('getContactForms', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no contact forms exist', async () => {
    const result = await getContactForms();
    
    expect(result).toEqual([]);
  });

  it('should return all contact forms', async () => {
    // Create test contact forms
    await db.insert(contactFormTable).values([
      testContactForm1,
      testContactForm2,
      testContactForm3
    ]).execute();

    const result = await getContactForms();

    expect(result).toHaveLength(3);
    
    // Verify all forms are returned with correct data
    const names = result.map(form => form.name);
    expect(names).toContain('John Doe');
    expect(names).toContain('Jane Smith');
    expect(names).toContain('Bob Johnson');

    // Verify all required fields are present
    result.forEach(form => {
      expect(form.id).toBeDefined();
      expect(form.name).toBeDefined();
      expect(form.email).toBeDefined();
      expect(form.message).toBeDefined();
      expect(form.submitted_at).toBeInstanceOf(Date);
    });
  });

  it('should order contact forms by submitted_at descending (most recent first)', async () => {
    // Create contact forms with specific timestamps
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Insert forms with different timestamps (oldest first)
    await db.insert(contactFormTable).values({
      ...testContactForm1,
      submitted_at: twoHoursAgo
    }).execute();

    await db.insert(contactFormTable).values({
      ...testContactForm2,
      submitted_at: oneHourAgo
    }).execute();

    await db.insert(contactFormTable).values({
      ...testContactForm3,
      submitted_at: now
    }).execute();

    const result = await getContactForms();

    expect(result).toHaveLength(3);
    
    // Verify ordering - most recent first
    expect(result[0].name).toEqual('Bob Johnson'); // Most recent
    expect(result[1].name).toEqual('Jane Smith');  // Middle
    expect(result[2].name).toEqual('John Doe');    // Oldest

    // Verify timestamps are in descending order
    expect(result[0].submitted_at >= result[1].submitted_at).toBe(true);
    expect(result[1].submitted_at >= result[2].submitted_at).toBe(true);
  });

  it('should handle nullable subject field correctly', async () => {
    // Create contact form with null subject
    await db.insert(contactFormTable).values({
      name: 'Test User',
      email: 'test@example.com',
      subject: null,
      message: 'Test message'
    }).execute();

    const result = await getContactForms();

    expect(result).toHaveLength(1);
    expect(result[0].subject).toBeNull();
    expect(result[0].name).toEqual('Test User');
    expect(result[0].email).toEqual('test@example.com');
    expect(result[0].message).toEqual('Test message');
  });

  it('should return contact forms with all expected fields', async () => {
    await db.insert(contactFormTable).values(testContactForm1).execute();

    const result = await getContactForms();

    expect(result).toHaveLength(1);
    const form = result[0];

    // Verify all schema fields are present
    expect(typeof form.id).toBe('number');
    expect(typeof form.name).toBe('string');
    expect(typeof form.email).toBe('string');
    expect(typeof form.message).toBe('string');
    expect(form.submitted_at).toBeInstanceOf(Date);
    
    // Subject can be string or null
    expect(form.subject === null || typeof form.subject === 'string').toBe(true);

    // Verify specific values
    expect(form.name).toEqual('John Doe');
    expect(form.email).toEqual('john@example.com');
    expect(form.subject).toEqual('Test Subject 1');
    expect(form.message).toEqual('Test message content 1');
  });

  it('should handle large number of contact forms efficiently', async () => {
    // Create multiple contact forms
    const forms = Array.from({ length: 10 }, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      subject: `Subject ${i + 1}`,
      message: `Message content ${i + 1}`
    }));

    await db.insert(contactFormTable).values(forms).execute();

    const result = await getContactForms();

    expect(result).toHaveLength(10);
    
    // Verify all forms are returned
    const names = result.map(form => form.name);
    for (let i = 1; i <= 10; i++) {
      expect(names).toContain(`User ${i}`);
    }

    // Verify ordering is maintained (most recent first)
    const timestamps = result.map(form => form.submitted_at.getTime());
    const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sortedTimestamps);
  });
});