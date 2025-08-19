import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { type CreateWorkExperienceInput } from '../schema';
import { createWorkExperience } from '../handlers/create_work_experience';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateWorkExperienceInput = {
  company: 'Tech Corp',
  title: 'Software Engineer',
  start_date: new Date('2023-01-15'),
  end_date: new Date('2024-01-15'),
  responsibilities: 'Developed web applications using React and Node.js',
  is_current: false
};

// Test input for current position (no end date)
const currentPositionInput: CreateWorkExperienceInput = {
  company: 'Current Company',
  title: 'Senior Developer',
  start_date: new Date('2024-02-01'),
  end_date: null,
  responsibilities: 'Leading development of microservices architecture',
  is_current: true
};

describe('createWorkExperience', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a work experience entry', async () => {
    const result = await createWorkExperience(testInput);

    // Verify all fields are set correctly
    expect(result.company).toEqual('Tech Corp');
    expect(result.title).toEqual('Software Engineer');
    expect(result.start_date).toEqual(new Date('2023-01-15'));
    expect(result.end_date).toEqual(new Date('2024-01-15'));
    expect(result.responsibilities).toEqual('Developed web applications using React and Node.js');
    expect(result.is_current).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save work experience to database', async () => {
    const result = await createWorkExperience(testInput);

    // Query the database to verify persistence
    const workExperiences = await db.select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.id, result.id))
      .execute();

    expect(workExperiences).toHaveLength(1);
    expect(workExperiences[0].company).toEqual('Tech Corp');
    expect(workExperiences[0].title).toEqual('Software Engineer');
    expect(workExperiences[0].start_date).toEqual(new Date('2023-01-15'));
    expect(workExperiences[0].end_date).toEqual(new Date('2024-01-15'));
    expect(workExperiences[0].responsibilities).toEqual('Developed web applications using React and Node.js');
    expect(workExperiences[0].is_current).toEqual(false);
    expect(workExperiences[0].created_at).toBeInstanceOf(Date);
    expect(workExperiences[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create current position with null end_date', async () => {
    const result = await createWorkExperience(currentPositionInput);

    // Verify current position fields
    expect(result.company).toEqual('Current Company');
    expect(result.title).toEqual('Senior Developer');
    expect(result.start_date).toEqual(new Date('2024-02-01'));
    expect(result.end_date).toBeNull();
    expect(result.responsibilities).toEqual('Leading development of microservices architecture');
    expect(result.is_current).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle default is_current value', async () => {
    // Create input without explicit is_current value (should default to false)
    const inputWithoutIsCurrent = {
      company: 'Default Company',
      title: 'Developer',
      start_date: new Date('2023-06-01'),
      end_date: new Date('2023-12-01'),
      responsibilities: 'Various development tasks'
    };

    const result = await createWorkExperience(inputWithoutIsCurrent as CreateWorkExperienceInput);

    expect(result.is_current).toEqual(false);
  });

  it('should create multiple work experience entries', async () => {
    // Create first work experience
    const result1 = await createWorkExperience(testInput);
    
    // Create second work experience
    const result2 = await createWorkExperience(currentPositionInput);

    // Verify both entries have different IDs
    expect(result1.id).not.toEqual(result2.id);

    // Query all work experiences from database
    const allWorkExperiences = await db.select()
      .from(workExperienceTable)
      .execute();

    expect(allWorkExperiences).toHaveLength(2);
    
    // Verify both entries exist in database
    const companies = allWorkExperiences.map(we => we.company);
    expect(companies).toContain('Tech Corp');
    expect(companies).toContain('Current Company');
  });

  it('should handle date objects correctly', async () => {
    const specificDateInput: CreateWorkExperienceInput = {
      company: 'Date Test Company',
      title: 'Test Position',
      start_date: new Date('2022-03-15T10:30:00.000Z'),
      end_date: new Date('2023-03-15T10:30:00.000Z'),
      responsibilities: 'Testing date handling',
      is_current: false
    };

    const result = await createWorkExperience(specificDateInput);

    // Verify dates are preserved correctly
    expect(result.start_date).toEqual(new Date('2022-03-15T10:30:00.000Z'));
    expect(result.end_date).toEqual(new Date('2023-03-15T10:30:00.000Z'));

    // Query database to verify date persistence
    const dbRecord = await db.select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.id, result.id))
      .execute();

    expect(dbRecord[0].start_date).toEqual(new Date('2022-03-15T10:30:00.000Z'));
    expect(dbRecord[0].end_date).toEqual(new Date('2023-03-15T10:30:00.000Z'));
  });
});