import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { type CreateWorkExperienceInput, type UpdateWorkExperienceInput } from '../schema';
import { updateWorkExperience } from '../handlers/update_work_experience';
import { eq } from 'drizzle-orm';

// Test data for creating initial work experience
const testWorkExperience: CreateWorkExperienceInput = {
  company: 'Test Company',
  title: 'Software Engineer',
  start_date: new Date('2022-01-01'),
  end_date: new Date('2023-01-01'),
  responsibilities: 'Developed applications',
  is_current: false
};

const createTestWorkExperience = async () => {
  const result = await db.insert(workExperienceTable)
    .values({
      company: testWorkExperience.company,
      title: testWorkExperience.title,
      start_date: testWorkExperience.start_date,
      end_date: testWorkExperience.end_date,
      responsibilities: testWorkExperience.responsibilities,
      is_current: testWorkExperience.is_current
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateWorkExperience', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update specific fields of work experience', async () => {
    const originalRecord = await createTestWorkExperience();
    
    const updateInput: UpdateWorkExperienceInput = {
      id: originalRecord.id,
      company: 'Updated Company',
      title: 'Senior Software Engineer',
      responsibilities: 'Led development teams'
    };

    const result = await updateWorkExperience(updateInput);

    // Updated fields should reflect new values
    expect(result.company).toEqual('Updated Company');
    expect(result.title).toEqual('Senior Software Engineer');
    expect(result.responsibilities).toEqual('Led development teams');
    
    // Non-updated fields should remain the same
    expect(result.start_date).toEqual(originalRecord.start_date);
    expect(result.end_date).toEqual(originalRecord.end_date);
    expect(result.is_current).toEqual(originalRecord.is_current);
    
    // Timestamps should be handled correctly
    expect(result.created_at).toEqual(originalRecord.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalRecord.updated_at.getTime());
  });

  it('should update date fields correctly', async () => {
    const originalRecord = await createTestWorkExperience();
    
    const newStartDate = new Date('2021-06-01');
    const newEndDate = new Date('2024-01-01');
    
    const updateInput: UpdateWorkExperienceInput = {
      id: originalRecord.id,
      start_date: newStartDate,
      end_date: newEndDate,
      is_current: true
    };

    const result = await updateWorkExperience(updateInput);

    expect(result.start_date).toEqual(newStartDate);
    expect(result.end_date).toEqual(newEndDate);
    expect(result.is_current).toEqual(true);
    
    // Other fields should remain unchanged
    expect(result.company).toEqual(originalRecord.company);
    expect(result.title).toEqual(originalRecord.title);
    expect(result.responsibilities).toEqual(originalRecord.responsibilities);
  });

  it('should handle nullable fields correctly', async () => {
    const originalRecord = await createTestWorkExperience();
    
    const updateInput: UpdateWorkExperienceInput = {
      id: originalRecord.id,
      end_date: null, // Setting to null
      is_current: true
    };

    const result = await updateWorkExperience(updateInput);

    expect(result.end_date).toBeNull();
    expect(result.is_current).toEqual(true);
    
    // Other fields should remain unchanged
    expect(result.company).toEqual(originalRecord.company);
    expect(result.title).toEqual(originalRecord.title);
    expect(result.start_date).toEqual(originalRecord.start_date);
    expect(result.responsibilities).toEqual(originalRecord.responsibilities);
  });

  it('should save updated work experience to database', async () => {
    const originalRecord = await createTestWorkExperience();
    
    const updateInput: UpdateWorkExperienceInput = {
      id: originalRecord.id,
      company: 'Database Updated Company',
      title: 'Lead Developer'
    };

    await updateWorkExperience(updateInput);

    // Verify changes persisted in database
    const savedRecords = await db.select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.id, originalRecord.id))
      .execute();

    expect(savedRecords).toHaveLength(1);
    const savedRecord = savedRecords[0];
    
    expect(savedRecord.company).toEqual('Database Updated Company');
    expect(savedRecord.title).toEqual('Lead Developer');
    expect(savedRecord.start_date).toEqual(originalRecord.start_date);
    expect(savedRecord.responsibilities).toEqual(originalRecord.responsibilities);
    expect(savedRecord.is_current).toEqual(originalRecord.is_current);
    expect(savedRecord.updated_at).toBeInstanceOf(Date);
    expect(savedRecord.updated_at.getTime()).toBeGreaterThan(originalRecord.updated_at.getTime());
  });

  it('should throw error for non-existent work experience ID', async () => {
    const nonExistentId = 99999;
    
    const updateInput: UpdateWorkExperienceInput = {
      id: nonExistentId,
      company: 'Some Company'
    };

    await expect(updateWorkExperience(updateInput)).rejects.toThrow(/Work experience with ID 99999 not found/i);
  });

  it('should handle partial updates with only one field', async () => {
    const originalRecord = await createTestWorkExperience();
    
    const updateInput: UpdateWorkExperienceInput = {
      id: originalRecord.id,
      is_current: true
    };

    const result = await updateWorkExperience(updateInput);

    // Only is_current should be updated
    expect(result.is_current).toEqual(true);
    
    // All other fields should remain unchanged
    expect(result.company).toEqual(originalRecord.company);
    expect(result.title).toEqual(originalRecord.title);
    expect(result.start_date).toEqual(originalRecord.start_date);
    expect(result.end_date).toEqual(originalRecord.end_date);
    expect(result.responsibilities).toEqual(originalRecord.responsibilities);
    expect(result.created_at).toEqual(originalRecord.created_at);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalRecord.updated_at.getTime());
  });

  it('should update work experience with all fields changed', async () => {
    const originalRecord = await createTestWorkExperience();
    
    const updateInput: UpdateWorkExperienceInput = {
      id: originalRecord.id,
      company: 'Completely New Company',
      title: 'Principal Engineer',
      start_date: new Date('2020-01-01'),
      end_date: null,
      responsibilities: 'Architectural decisions and team leadership',
      is_current: true
    };

    const result = await updateWorkExperience(updateInput);

    expect(result.company).toEqual('Completely New Company');
    expect(result.title).toEqual('Principal Engineer');
    expect(result.start_date).toEqual(new Date('2020-01-01'));
    expect(result.end_date).toBeNull();
    expect(result.responsibilities).toEqual('Architectural decisions and team leadership');
    expect(result.is_current).toEqual(true);
    expect(result.id).toEqual(originalRecord.id);
    expect(result.created_at).toEqual(originalRecord.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalRecord.updated_at.getTime());
  });
});