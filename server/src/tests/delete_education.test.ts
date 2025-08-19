import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { educationTable } from '../db/schema';
import { type DeleteInput, type CreateEducationInput } from '../schema';
import { deleteEducation } from '../handlers/delete_education';
import { eq } from 'drizzle-orm';

// Test data for creating education entries
const testEducationInput: CreateEducationInput = {
  degree: 'Bachelor of Science',
  major: 'Computer Science',
  institution: 'Test University',
  start_date: new Date('2018-08-01'),
  end_date: new Date('2022-05-15'),
  gpa: 3.8,
  is_current: false
};

describe('deleteEducation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing education entry', async () => {
    // Create an education entry first
    const created = await db.insert(educationTable)
      .values({
        degree: testEducationInput.degree,
        major: testEducationInput.major,
        institution: testEducationInput.institution,
        start_date: testEducationInput.start_date,
        end_date: testEducationInput.end_date,
        gpa: testEducationInput.gpa,
        is_current: testEducationInput.is_current
      })
      .returning()
      .execute();

    const educationId = created[0].id;

    // Verify it exists before deletion
    const beforeDelete = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, educationId))
      .execute();
    expect(beforeDelete).toHaveLength(1);

    // Delete the education entry
    const deleteInput: DeleteInput = { id: educationId };
    await deleteEducation(deleteInput);

    // Verify it's been deleted
    const afterDelete = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, educationId))
      .execute();
    expect(afterDelete).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent education entry', async () => {
    // Try to delete an education entry that doesn't exist
    const deleteInput: DeleteInput = { id: 999999 };
    
    // Should not throw an error
    await expect(deleteEducation(deleteInput)).resolves.toBeUndefined();
  });

  it('should delete correct entry when multiple education entries exist', async () => {
    // Create multiple education entries
    const education1 = await db.insert(educationTable)
      .values({
        degree: 'Bachelor of Science',
        major: 'Computer Science',
        institution: 'University A',
        start_date: new Date('2018-08-01'),
        end_date: new Date('2022-05-15'),
        gpa: 3.8,
        is_current: false
      })
      .returning()
      .execute();

    const education2 = await db.insert(educationTable)
      .values({
        degree: 'Master of Science',
        major: 'Software Engineering',
        institution: 'University B',
        start_date: new Date('2022-08-01'),
        end_date: null,
        gpa: null,
        is_current: true
      })
      .returning()
      .execute();

    const education1Id = education1[0].id;
    const education2Id = education2[0].id;

    // Delete the first education entry
    const deleteInput: DeleteInput = { id: education1Id };
    await deleteEducation(deleteInput);

    // Verify first entry is deleted
    const education1Check = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, education1Id))
      .execute();
    expect(education1Check).toHaveLength(0);

    // Verify second entry still exists
    const education2Check = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, education2Id))
      .execute();
    expect(education2Check).toHaveLength(1);
    expect(education2Check[0].degree).toEqual('Master of Science');
  });

  it('should handle deletion of current education entry', async () => {
    // Create a current education entry (is_current = true, end_date = null)
    const created = await db.insert(educationTable)
      .values({
        degree: 'PhD',
        major: 'Computer Science',
        institution: 'Research University',
        start_date: new Date('2023-08-01'),
        end_date: null,
        gpa: null,
        is_current: true
      })
      .returning()
      .execute();

    const educationId = created[0].id;

    // Delete the current education entry
    const deleteInput: DeleteInput = { id: educationId };
    await deleteEducation(deleteInput);

    // Verify it's been deleted
    const afterDelete = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, educationId))
      .execute();
    expect(afterDelete).toHaveLength(0);
  });
});