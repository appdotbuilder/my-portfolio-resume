import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { personalInfoTable } from '../db/schema';
import { type UpdatePersonalInfoInput } from '../schema';
import { updatePersonalInfo } from '../handlers/update_personal_info';

// Test input with all fields
const testInput: UpdatePersonalInfoInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  github_url: 'https://github.com/johndoe',
  professional_summary: 'Experienced software developer with expertise in full-stack development.',
  photo_url: 'https://example.com/photos/john.jpg'
};

// Test input with minimal required fields
const minimalTestInput: UpdatePersonalInfoInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: null,
  linkedin_url: null,
  github_url: null,
  professional_summary: 'Software engineer passionate about clean code.',
  photo_url: null
};

describe('updatePersonalInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create new personal info when none exists', async () => {
    const result = await updatePersonalInfo(testInput);

    // Verify returned data
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone).toEqual('+1-555-123-4567');
    expect(result.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result.github_url).toEqual('https://github.com/johndoe');
    expect(result.professional_summary).toEqual('Experienced software developer with expertise in full-stack development.');
    expect(result.photo_url).toEqual('https://example.com/photos/john.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save new personal info to database', async () => {
    const result = await updatePersonalInfo(testInput);

    // Verify data was saved to database
    const records = await db.select()
      .from(personalInfoTable)
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].id).toEqual(result.id);
    expect(records[0].name).toEqual('John Doe');
    expect(records[0].email).toEqual('john.doe@example.com');
    expect(records[0].phone).toEqual('+1-555-123-4567');
    expect(records[0].professional_summary).toEqual('Experienced software developer with expertise in full-stack development.');
    expect(records[0].created_at).toBeInstanceOf(Date);
    expect(records[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update existing personal info', async () => {
    // Create initial record
    const initialResult = await updatePersonalInfo(testInput);
    const initialId = initialResult.id;
    const initialCreatedAt = initialResult.created_at;

    // Wait a moment to ensure updated_at is different
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update with new data
    const updatedInput: UpdatePersonalInfoInput = {
      name: 'John Updated Doe',
      email: 'john.updated@example.com',
      phone: '+1-555-999-8888',
      linkedin_url: 'https://linkedin.com/in/johnupdated',
      github_url: 'https://github.com/johnupdated',
      professional_summary: 'Senior software architect with 10+ years experience.',
      photo_url: 'https://example.com/photos/john-updated.jpg'
    };

    const updateResult = await updatePersonalInfo(updatedInput);

    // Verify the same record was updated
    expect(updateResult.id).toEqual(initialId);
    expect(updateResult.created_at).toEqual(initialCreatedAt);
    expect(updateResult.updated_at).not.toEqual(initialResult.updated_at);

    // Verify updated values
    expect(updateResult.name).toEqual('John Updated Doe');
    expect(updateResult.email).toEqual('john.updated@example.com');
    expect(updateResult.phone).toEqual('+1-555-999-8888');
    expect(updateResult.linkedin_url).toEqual('https://linkedin.com/in/johnupdated');
    expect(updateResult.github_url).toEqual('https://github.com/johnupdated');
    expect(updateResult.professional_summary).toEqual('Senior software architect with 10+ years experience.');
    expect(updateResult.photo_url).toEqual('https://example.com/photos/john-updated.jpg');
  });

  it('should ensure only one record exists after multiple updates', async () => {
    // Create initial record
    await updatePersonalInfo(testInput);

    // Update multiple times
    await updatePersonalInfo(minimalTestInput);
    await updatePersonalInfo(testInput);

    // Verify only one record exists
    const records = await db.select()
      .from(personalInfoTable)
      .execute();

    expect(records).toHaveLength(1);
    expect(records[0].name).toEqual('John Doe'); // Should have last update
  });

  it('should handle null values correctly', async () => {
    const result = await updatePersonalInfo(minimalTestInput);

    // Verify null values are handled properly
    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.phone).toBeNull();
    expect(result.linkedin_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.professional_summary).toEqual('Software engineer passionate about clean code.');
    expect(result.photo_url).toBeNull();
  });

  it('should update null values to non-null and vice versa', async () => {
    // Start with minimal data (nulls)
    await updatePersonalInfo(minimalTestInput);

    // Update to full data (non-nulls)
    const fullResult = await updatePersonalInfo(testInput);
    expect(fullResult.phone).toEqual('+1-555-123-4567');
    expect(fullResult.linkedin_url).toEqual('https://linkedin.com/in/johndoe');

    // Update back to minimal data (nulls)
    const minimalResult = await updatePersonalInfo(minimalTestInput);
    expect(minimalResult.phone).toBeNull();
    expect(minimalResult.linkedin_url).toBeNull();
  });

  it('should preserve timestamps correctly during updates', async () => {
    // Create initial record
    const initial = await updatePersonalInfo(testInput);
    
    // Small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update record
    const updated = await updatePersonalInfo(minimalTestInput);

    // created_at should remain the same, updated_at should change
    expect(updated.created_at).toEqual(initial.created_at);
    expect(updated.updated_at.getTime()).toBeGreaterThan(initial.updated_at.getTime());
  });
});