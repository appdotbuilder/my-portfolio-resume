import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { type DeleteInput, type CreateWorkExperienceInput } from '../schema';
import { deleteWorkExperience } from '../handlers/delete_work_experience';
import { eq } from 'drizzle-orm';

// Test input for creating work experience
const testWorkExperience: CreateWorkExperienceInput = {
  company: 'Test Company',
  title: 'Software Engineer',
  start_date: new Date('2020-01-01'),
  end_date: new Date('2022-12-31'),
  responsibilities: 'Developed web applications and maintained databases',
  is_current: false
};

describe('deleteWorkExperience', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a work experience entry successfully', async () => {
    // First create a work experience entry to delete
    const createdResult = await db.insert(workExperienceTable)
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

    const workExperienceId = createdResult[0].id;

    // Delete the work experience
    const deleteInput: DeleteInput = { id: workExperienceId };
    await deleteWorkExperience(deleteInput);

    // Verify the work experience was deleted
    const remainingEntries = await db.select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.id, workExperienceId))
      .execute();

    expect(remainingEntries).toHaveLength(0);
  });

  it('should verify work experience is removed from database', async () => {
    // Create multiple work experience entries
    const entry1 = await db.insert(workExperienceTable)
      .values({
        company: 'Company 1',
        title: 'Developer',
        start_date: new Date('2020-01-01'),
        end_date: new Date('2021-01-01'),
        responsibilities: 'Development work',
        is_current: false
      })
      .returning()
      .execute();

    const entry2 = await db.insert(workExperienceTable)
      .values({
        company: 'Company 2',
        title: 'Senior Developer',
        start_date: new Date('2021-01-01'),
        end_date: null,
        responsibilities: 'Senior development work',
        is_current: true
      })
      .returning()
      .execute();

    // Delete the first entry
    await deleteWorkExperience({ id: entry1[0].id });

    // Verify only the second entry remains
    const allEntries = await db.select()
      .from(workExperienceTable)
      .execute();

    expect(allEntries).toHaveLength(1);
    expect(allEntries[0].id).toEqual(entry2[0].id);
    expect(allEntries[0].company).toEqual('Company 2');
  });

  it('should throw error when trying to delete non-existent work experience', async () => {
    // Try to delete a work experience that doesn't exist
    const nonExistentId = 99999;
    const deleteInput: DeleteInput = { id: nonExistentId };

    await expect(deleteWorkExperience(deleteInput))
      .rejects.toThrow(/Work experience with ID 99999 not found/i);
  });

  it('should handle deletion when work experience table is empty', async () => {
    // Ensure table is empty
    const allEntries = await db.select()
      .from(workExperienceTable)
      .execute();
    expect(allEntries).toHaveLength(0);

    // Try to delete from empty table
    const deleteInput: DeleteInput = { id: 1 };

    await expect(deleteWorkExperience(deleteInput))
      .rejects.toThrow(/Work experience with ID 1 not found/i);
  });

  it('should successfully delete current work experience', async () => {
    // Create a current work experience (end_date is null)
    const currentWork = await db.insert(workExperienceTable)
      .values({
        company: 'Current Company',
        title: 'Current Position',
        start_date: new Date('2023-01-01'),
        end_date: null,
        responsibilities: 'Current job responsibilities',
        is_current: true
      })
      .returning()
      .execute();

    // Delete the current work experience
    await deleteWorkExperience({ id: currentWork[0].id });

    // Verify it was deleted
    const remainingEntries = await db.select()
      .from(workExperienceTable)
      .where(eq(workExperienceTable.id, currentWork[0].id))
      .execute();

    expect(remainingEntries).toHaveLength(0);
  });
});