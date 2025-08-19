import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { educationTable } from '../db/schema';
import { type UpdateEducationInput, type CreateEducationInput } from '../schema';
import { updateEducation } from '../handlers/update_education';
import { eq } from 'drizzle-orm';

// Test data for creating initial education record
const testEducationData: CreateEducationInput = {
  degree: 'Bachelor of Science',
  major: 'Computer Science',
  institution: 'Tech University',
  start_date: new Date('2018-09-01'),
  end_date: new Date('2022-05-15'),
  gpa: 3.8,
  is_current: false
};

describe('updateEducation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let educationId: number;

  beforeEach(async () => {
    // Create initial education record for testing
    const result = await db
      .insert(educationTable)
      .values({
        ...testEducationData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();
    
    educationId = result[0].id;
  });

  it('should update education record with all fields', async () => {
    const updateInput: UpdateEducationInput = {
      id: educationId,
      degree: 'Master of Science',
      major: 'Software Engineering',
      institution: 'Advanced Tech University',
      start_date: new Date('2022-09-01'),
      end_date: new Date('2024-05-15'),
      gpa: 3.9,
      is_current: false
    };

    const result = await updateEducation(updateInput);

    expect(result.id).toBe(educationId);
    expect(result.degree).toBe('Master of Science');
    expect(result.major).toBe('Software Engineering');
    expect(result.institution).toBe('Advanced Tech University');
    expect(result.start_date).toEqual(new Date('2022-09-01'));
    expect(result.end_date).toEqual(new Date('2024-05-15'));
    expect(result.gpa).toBe(3.9);
    expect(result.is_current).toBe(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const updateInput: UpdateEducationInput = {
      id: educationId,
      degree: 'Master of Computer Science',
      gpa: 3.95
    };

    const result = await updateEducation(updateInput);

    // Updated fields
    expect(result.degree).toBe('Master of Computer Science');
    expect(result.gpa).toBe(3.95);
    
    // Unchanged fields should retain original values
    expect(result.major).toBe(testEducationData.major);
    expect(result.institution).toBe(testEducationData.institution);
    expect(result.start_date).toEqual(testEducationData.start_date);
    expect(result.end_date).toEqual(testEducationData.end_date);
    expect(result.is_current).toBe(testEducationData.is_current);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const updateInput: UpdateEducationInput = {
      id: educationId,
      end_date: null,
      gpa: null,
      is_current: true
    };

    const result = await updateEducation(updateInput);

    expect(result.end_date).toBe(null);
    expect(result.gpa).toBe(null);
    expect(result.is_current).toBe(true);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    const updateInput: UpdateEducationInput = {
      id: educationId,
      degree: 'Ph.D. in Computer Science',
      major: 'Artificial Intelligence',
      is_current: true
    };

    await updateEducation(updateInput);

    // Verify changes were persisted
    const educationRecords = await db
      .select()
      .from(educationTable)
      .where(eq(educationTable.id, educationId))
      .execute();

    expect(educationRecords).toHaveLength(1);
    expect(educationRecords[0].degree).toBe('Ph.D. in Computer Science');
    expect(educationRecords[0].major).toBe('Artificial Intelligence');
    expect(educationRecords[0].is_current).toBe(true);
    expect(educationRecords[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update timestamp', async () => {
    const originalRecord = await db
      .select()
      .from(educationTable)
      .where(eq(educationTable.id, educationId))
      .execute();

    const originalUpdatedAt = originalRecord[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateEducationInput = {
      id: educationId,
      degree: 'Updated Degree'
    };

    const result = await updateEducation(updateInput);

    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error for non-existent education record', async () => {
    const updateInput: UpdateEducationInput = {
      id: 99999,
      degree: 'Non-existent Record'
    };

    await expect(updateEducation(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle current education status update', async () => {
    const updateInput: UpdateEducationInput = {
      id: educationId,
      is_current: true,
      end_date: null
    };

    const result = await updateEducation(updateInput);

    expect(result.is_current).toBe(true);
    expect(result.end_date).toBe(null);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle date field updates correctly', async () => {
    const newStartDate = new Date('2020-01-15');
    const newEndDate = new Date('2024-12-20');

    const updateInput: UpdateEducationInput = {
      id: educationId,
      start_date: newStartDate,
      end_date: newEndDate
    };

    const result = await updateEducation(updateInput);

    expect(result.start_date).toEqual(newStartDate);
    expect(result.end_date).toEqual(newEndDate);
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});