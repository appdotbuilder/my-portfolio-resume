import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { createSkill } from '../handlers/create_skill';
import { eq } from 'drizzle-orm';

// Test inputs for different skill types
const technicalSkillInput: CreateSkillInput = {
  name: 'TypeScript',
  category: 'technical',
  proficiency_level: 'advanced'
};

const softSkillInput: CreateSkillInput = {
  name: 'Leadership',
  category: 'soft',
  proficiency_level: 'intermediate'
};

const skillWithoutProficiencyInput: CreateSkillInput = {
  name: 'Project Management',
  category: 'soft',
  proficiency_level: null
};

describe('createSkill', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a technical skill with proficiency level', async () => {
    const result = await createSkill(technicalSkillInput);

    // Basic field validation
    expect(result.name).toEqual('TypeScript');
    expect(result.category).toEqual('technical');
    expect(result.proficiency_level).toEqual('advanced');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a soft skill with proficiency level', async () => {
    const result = await createSkill(softSkillInput);

    expect(result.name).toEqual('Leadership');
    expect(result.category).toEqual('soft');
    expect(result.proficiency_level).toEqual('intermediate');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a skill without proficiency level', async () => {
    const result = await createSkill(skillWithoutProficiencyInput);

    expect(result.name).toEqual('Project Management');
    expect(result.category).toEqual('soft');
    expect(result.proficiency_level).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save skill to database', async () => {
    const result = await createSkill(technicalSkillInput);

    // Query using proper drizzle syntax
    const skills = await db.select()
      .from(skillsTable)
      .where(eq(skillsTable.id, result.id))
      .execute();

    expect(skills).toHaveLength(1);
    expect(skills[0].name).toEqual('TypeScript');
    expect(skills[0].category).toEqual('technical');
    expect(skills[0].proficiency_level).toEqual('advanced');
    expect(skills[0].created_at).toBeInstanceOf(Date);
    expect(skills[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple skills successfully', async () => {
    const skill1 = await createSkill(technicalSkillInput);
    const skill2 = await createSkill(softSkillInput);
    const skill3 = await createSkill(skillWithoutProficiencyInput);

    // Verify all skills were created with different IDs
    expect(skill1.id).not.toEqual(skill2.id);
    expect(skill2.id).not.toEqual(skill3.id);
    expect(skill1.id).not.toEqual(skill3.id);

    // Verify all skills exist in database
    const allSkills = await db.select()
      .from(skillsTable)
      .execute();

    expect(allSkills).toHaveLength(3);
    
    const skillNames = allSkills.map(skill => skill.name);
    expect(skillNames).toContain('TypeScript');
    expect(skillNames).toContain('Leadership');
    expect(skillNames).toContain('Project Management');
  });

  it('should handle all valid proficiency levels', async () => {
    const beginnerSkill = await createSkill({
      name: 'Python',
      category: 'technical',
      proficiency_level: 'beginner'
    });

    const expertSkill = await createSkill({
      name: 'JavaScript',
      category: 'technical',
      proficiency_level: 'expert'
    });

    expect(beginnerSkill.proficiency_level).toEqual('beginner');
    expect(expertSkill.proficiency_level).toEqual('expert');

    // Verify in database
    const savedSkills = await db.select()
      .from(skillsTable)
      .execute();

    const proficiencyLevels = savedSkills.map(skill => skill.proficiency_level);
    expect(proficiencyLevels).toContain('beginner');
    expect(proficiencyLevels).toContain('expert');
  });

  it('should set created_at and updated_at timestamps', async () => {
    const beforeCreate = new Date();
    const result = await createSkill(technicalSkillInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });
});