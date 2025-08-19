import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type DeleteInput, type CreateSkillInput } from '../schema';
import { deleteSkill } from '../handlers/delete_skill';
import { eq } from 'drizzle-orm';

// Create a test skill first
const createTestSkill = async (skillData: CreateSkillInput) => {
  const result = await db.insert(skillsTable)
    .values({
      name: skillData.name,
      category: skillData.category,
      proficiency_level: skillData.proficiency_level
    })
    .returning()
    .execute();

  return result[0];
};

describe('deleteSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing skill', async () => {
    // Create a test skill first
    const testSkillInput: CreateSkillInput = {
      name: 'JavaScript',
      category: 'technical',
      proficiency_level: 'advanced'
    };

    const createdSkill = await createTestSkill(testSkillInput);

    // Delete the skill
    const deleteInput: DeleteInput = {
      id: createdSkill.id
    };

    await deleteSkill(deleteInput);

    // Verify skill was deleted
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, createdSkill.id))
      .execute();

    expect(skills).toHaveLength(0);
  });

  it('should throw error when skill does not exist', async () => {
    const deleteInput: DeleteInput = {
      id: 999 // Non-existent ID
    };

    await expect(deleteSkill(deleteInput)).rejects.toThrow(/Skill with ID 999 not found/i);
  });

  it('should not affect other skills when deleting one skill', async () => {
    // Create multiple test skills
    const skill1Input: CreateSkillInput = {
      name: 'Python',
      category: 'technical',
      proficiency_level: 'expert'
    };

    const skill2Input: CreateSkillInput = {
      name: 'Communication',
      category: 'soft',
      proficiency_level: 'advanced'
    };

    const skill3Input: CreateSkillInput = {
      name: 'TypeScript',
      category: 'technical',
      proficiency_level: 'intermediate'
    };

    const createdSkill1 = await createTestSkill(skill1Input);
    const createdSkill2 = await createTestSkill(skill2Input);
    const createdSkill3 = await createTestSkill(skill3Input);

    // Delete only the second skill
    const deleteInput: DeleteInput = {
      id: createdSkill2.id
    };

    await deleteSkill(deleteInput);

    // Verify only the targeted skill was deleted
    const remainingSkills = await db.select()
      .from(skillsTable)
      .execute();

    expect(remainingSkills).toHaveLength(2);

    // Verify the correct skills remain
    const skillIds = remainingSkills.map(skill => skill.id);
    expect(skillIds).toContain(createdSkill1.id);
    expect(skillIds).toContain(createdSkill3.id);
    expect(skillIds).not.toContain(createdSkill2.id);

    // Verify the remaining skills have correct data
    const skill1 = remainingSkills.find(s => s.id === createdSkill1.id);
    const skill3 = remainingSkills.find(s => s.id === createdSkill3.id);

    expect(skill1?.name).toEqual('Python');
    expect(skill1?.category).toEqual('technical');
    expect(skill1?.proficiency_level).toEqual('expert');

    expect(skill3?.name).toEqual('TypeScript');
    expect(skill3?.category).toEqual('technical');
    expect(skill3?.proficiency_level).toEqual('intermediate');
  });

  it('should handle skill with null proficiency level', async () => {
    // Create a skill with null proficiency level
    const skillInput: CreateSkillInput = {
      name: 'Leadership',
      category: 'soft',
      proficiency_level: null
    };

    const createdSkill = await createTestSkill(skillInput);

    // Delete the skill
    const deleteInput: DeleteInput = {
      id: createdSkill.id
    };

    await deleteSkill(deleteInput);

    // Verify skill was deleted
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, createdSkill.id))
      .execute();

    expect(skills).toHaveLength(0);
  });
});