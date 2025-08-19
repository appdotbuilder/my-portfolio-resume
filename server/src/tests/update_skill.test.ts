import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type UpdateSkillInput, type CreateSkillInput } from '../schema';
import { updateSkill } from '../handlers/update_skill';
import { eq } from 'drizzle-orm';

// Test helper to create a skill
const createTestSkill = async (skillData: CreateSkillInput) => {
  const result = await db.insert(skillsTable)
    .values({
      name: skillData.name,
      category: skillData.category,
      proficiency_level: skillData.proficiency_level,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning()
    .execute();
  return result[0];
};

describe('updateSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a skill with all fields', async () => {
    // Create initial skill
    const initialSkill = await createTestSkill({
      name: 'JavaScript',
      category: 'technical',
      proficiency_level: 'intermediate'
    });

    const updateInput: UpdateSkillInput = {
      id: initialSkill.id,
      name: 'TypeScript',
      category: 'technical',
      proficiency_level: 'advanced'
    };

    const result = await updateSkill(updateInput);

    expect(result.id).toEqual(initialSkill.id);
    expect(result.name).toEqual('TypeScript');
    expect(result.category).toEqual('technical');
    expect(result.proficiency_level).toEqual('advanced');
    expect(result.created_at).toEqual(initialSkill.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > initialSkill.updated_at).toBe(true);
  });

  it('should update only specified fields', async () => {
    // Create initial skill
    const initialSkill = await createTestSkill({
      name: 'Python',
      category: 'technical',
      proficiency_level: 'beginner'
    });

    const updateInput: UpdateSkillInput = {
      id: initialSkill.id,
      proficiency_level: 'expert'
    };

    const result = await updateSkill(updateInput);

    expect(result.id).toEqual(initialSkill.id);
    expect(result.name).toEqual('Python'); // Should remain unchanged
    expect(result.category).toEqual('technical'); // Should remain unchanged
    expect(result.proficiency_level).toEqual('expert'); // Should be updated
    expect(result.created_at).toEqual(initialSkill.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > initialSkill.updated_at).toBe(true);
  });

  it('should update skill category', async () => {
    // Create initial skill
    const initialSkill = await createTestSkill({
      name: 'Communication',
      category: 'soft',
      proficiency_level: 'intermediate'
    });

    const updateInput: UpdateSkillInput = {
      id: initialSkill.id,
      category: 'technical'
    };

    const result = await updateSkill(updateInput);

    expect(result.name).toEqual('Communication');
    expect(result.category).toEqual('technical');
    expect(result.proficiency_level).toEqual('intermediate');
  });

  it('should update proficiency_level to null', async () => {
    // Create initial skill
    const initialSkill = await createTestSkill({
      name: 'Leadership',
      category: 'soft',
      proficiency_level: 'advanced'
    });

    const updateInput: UpdateSkillInput = {
      id: initialSkill.id,
      proficiency_level: null
    };

    const result = await updateSkill(updateInput);

    expect(result.name).toEqual('Leadership');
    expect(result.category).toEqual('soft');
    expect(result.proficiency_level).toBeNull();
  });

  it('should persist changes in database', async () => {
    // Create initial skill
    const initialSkill = await createTestSkill({
      name: 'React',
      category: 'technical',
      proficiency_level: 'intermediate'
    });

    const updateInput: UpdateSkillInput = {
      id: initialSkill.id,
      name: 'React.js',
      proficiency_level: 'advanced'
    };

    await updateSkill(updateInput);

    // Verify changes persisted in database
    const skillsFromDb = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, initialSkill.id))
      .execute();

    expect(skillsFromDb).toHaveLength(1);
    expect(skillsFromDb[0].name).toEqual('React.js');
    expect(skillsFromDb[0].category).toEqual('technical');
    expect(skillsFromDb[0].proficiency_level).toEqual('advanced');
    expect(skillsFromDb[0].updated_at).toBeInstanceOf(Date);
    expect(skillsFromDb[0].updated_at > initialSkill.updated_at).toBe(true);
  });

  it('should throw error when skill does not exist', async () => {
    const updateInput: UpdateSkillInput = {
      id: 99999,
      name: 'Non-existent Skill'
    };

    expect(updateSkill(updateInput)).rejects.toThrow(/skill with id 99999 not found/i);
  });

  it('should handle all proficiency levels', async () => {
    const proficiencyLevels: Array<'beginner' | 'intermediate' | 'advanced' | 'expert'> = [
      'beginner',
      'intermediate', 
      'advanced',
      'expert'
    ];

    // Create initial skill
    const initialSkill = await createTestSkill({
      name: 'Node.js',
      category: 'technical',
      proficiency_level: 'beginner'
    });

    for (const level of proficiencyLevels) {
      const updateInput: UpdateSkillInput = {
        id: initialSkill.id,
        proficiency_level: level
      };

      const result = await updateSkill(updateInput);
      expect(result.proficiency_level).toEqual(level);
    }
  });

  it('should handle all skill categories', async () => {
    const categories: Array<'technical' | 'soft'> = ['technical', 'soft'];

    // Create initial skill
    const initialSkill = await createTestSkill({
      name: 'Problem Solving',
      category: 'technical',
      proficiency_level: 'intermediate'
    });

    for (const category of categories) {
      const updateInput: UpdateSkillInput = {
        id: initialSkill.id,
        category: category
      };

      const result = await updateSkill(updateInput);
      expect(result.category).toEqual(category);
    }
  });
});