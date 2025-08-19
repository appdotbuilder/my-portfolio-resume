import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { personalInfoTable } from '../db/schema';
import { getPersonalInfo } from '../handlers/get_personal_info';

describe('getPersonalInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no personal info exists', async () => {
    const result = await getPersonalInfo();
    expect(result).toBeNull();
  });

  it('should return personal info when record exists', async () => {
    // Create a test personal info record
    const testData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      github_url: 'https://github.com/johndoe',
      professional_summary: 'Experienced software developer with expertise in full-stack development.',
      photo_url: 'https://example.com/photo.jpg'
    };

    await db.insert(personalInfoTable)
      .values(testData)
      .execute();

    const result = await getPersonalInfo();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('John Doe');
    expect(result!.email).toEqual('john.doe@example.com');
    expect(result!.phone).toEqual('+1-555-0123');
    expect(result!.linkedin_url).toEqual('https://linkedin.com/in/johndoe');
    expect(result!.github_url).toEqual('https://github.com/johndoe');
    expect(result!.professional_summary).toEqual('Experienced software developer with expertise in full-stack development.');
    expect(result!.photo_url).toEqual('https://example.com/photo.jpg');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return only the first record when multiple exist', async () => {
    // Insert first personal info record
    const firstData = {
      name: 'First Person',
      email: 'first@example.com',
      phone: null,
      linkedin_url: null,
      github_url: null,
      professional_summary: 'First professional summary.',
      photo_url: null
    };

    const firstResult = await db.insert(personalInfoTable)
      .values(firstData)
      .returning()
      .execute();

    // Insert second personal info record
    const secondData = {
      name: 'Second Person',
      email: 'second@example.com',
      phone: null,
      linkedin_url: null,
      github_url: null,
      professional_summary: 'Second professional summary.',
      photo_url: null
    };

    await db.insert(personalInfoTable)
      .values(secondData)
      .execute();

    const result = await getPersonalInfo();

    expect(result).not.toBeNull();
    // Should return the first inserted record
    expect(result!.id).toEqual(firstResult[0].id);
    expect(result!.name).toEqual('First Person');
    expect(result!.email).toEqual('first@example.com');
    expect(result!.professional_summary).toEqual('First professional summary.');
  });

  it('should handle nullable fields correctly', async () => {
    // Create record with minimal required fields (nullable fields as null)
    const minimalData = {
      name: 'Minimal User',
      email: 'minimal@example.com',
      phone: null,
      linkedin_url: null,
      github_url: null,
      professional_summary: 'Basic summary.',
      photo_url: null
    };

    await db.insert(personalInfoTable)
      .values(minimalData)
      .execute();

    const result = await getPersonalInfo();

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Minimal User');
    expect(result!.email).toEqual('minimal@example.com');
    expect(result!.phone).toBeNull();
    expect(result!.linkedin_url).toBeNull();
    expect(result!.github_url).toBeNull();
    expect(result!.professional_summary).toEqual('Basic summary.');
    expect(result!.photo_url).toBeNull();
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should verify database state after retrieval', async () => {
    const testData = {
      name: 'Database Test User',
      email: 'db.test@example.com',
      phone: '+1-555-9999',
      linkedin_url: 'https://linkedin.com/in/dbtest',
      github_url: 'https://github.com/dbtest',
      professional_summary: 'Database testing professional.',
      photo_url: 'https://example.com/dbtest.jpg'
    };

    await db.insert(personalInfoTable)
      .values(testData)
      .execute();

    const result = await getPersonalInfo();

    // Verify the handler result matches what's actually in the database
    const dbRecords = await db.select()
      .from(personalInfoTable)
      .execute();

    expect(dbRecords).toHaveLength(1);
    expect(result).toEqual(dbRecords[0]);
    expect(result!.name).toEqual(dbRecords[0].name);
    expect(result!.email).toEqual(dbRecords[0].email);
    expect(result!.created_at).toEqual(dbRecords[0].created_at);
  });
});