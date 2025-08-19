import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { skillsTable } from '../db/schema';
import { type CreateSkillInput } from '../schema';
import { getSkills } from '../handlers/get_skills';

describe('getSkills', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no skills exist', async () => {
    const result = await getSkills();

    expect(result).toEqual([]);
  });

  it('should fetch all skills from database', async () => {
    // Create test skills
    const testSkills = [
      {
        name: 'JavaScript',
        category: 'technical' as const,
        proficiency_level: 'advanced' as const
      },
      {
        name: 'Communication',
        category: 'soft' as const,
        proficiency_level: 'expert' as const
      },
      {
        name: 'Python',
        category: 'technical' as const,
        proficiency_level: 'intermediate' as const
      }
    ];

    // Insert test data
    await db.insert(skillsTable)
      .values(testSkills)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(3);
    
    // Verify basic structure
    result.forEach(skill => {
      expect(skill.id).toBeDefined();
      expect(skill.name).toBeDefined();
      expect(skill.category).toBeDefined();
      expect(skill.created_at).toBeInstanceOf(Date);
      expect(skill.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should order skills by category (technical first) then by name', async () => {
    // Create test skills with mixed categories and names
    const testSkills = [
      {
        name: 'Teamwork',
        category: 'soft' as const,
        proficiency_level: 'expert' as const
      },
      {
        name: 'TypeScript',
        category: 'technical' as const,
        proficiency_level: 'advanced' as const
      },
      {
        name: 'Communication',
        category: 'soft' as const,
        proficiency_level: 'expert' as const
      },
      {
        name: 'JavaScript',
        category: 'technical' as const,
        proficiency_level: 'advanced' as const
      },
      {
        name: 'Problem Solving',
        category: 'soft' as const,
        proficiency_level: 'advanced' as const
      },
      {
        name: 'React',
        category: 'technical' as const,
        proficiency_level: 'intermediate' as const
      }
    ];

    // Insert test data
    await db.insert(skillsTable)
      .values(testSkills)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(6);

    // Verify ordering: technical skills first (alphabetically), then soft skills (alphabetically)
    const expectedOrder = [
      'JavaScript', // technical
      'React',      // technical
      'TypeScript', // technical
      'Communication', // soft
      'Problem Solving', // soft
      'Teamwork'    // soft
    ];

    result.forEach((skill, index) => {
      expect(skill.name).toEqual(expectedOrder[index]);
    });

    // Verify category grouping
    const technicalSkills = result.filter(skill => skill.category === 'technical');
    const softSkills = result.filter(skill => skill.category === 'soft');
    
    expect(technicalSkills).toHaveLength(3);
    expect(softSkills).toHaveLength(3);

    // Technical skills should come first
    expect(result[0].category).toEqual('technical');
    expect(result[1].category).toEqual('technical');
    expect(result[2].category).toEqual('technical');
    expect(result[3].category).toEqual('soft');
    expect(result[4].category).toEqual('soft');
    expect(result[5].category).toEqual('soft');
  });

  it('should handle skills with null proficiency levels', async () => {
    // Create skills with null proficiency levels
    const testSkills = [
      {
        name: 'Node.js',
        category: 'technical' as const,
        proficiency_level: null
      },
      {
        name: 'Leadership',
        category: 'soft' as const,
        proficiency_level: null
      }
    ];

    // Insert test data
    await db.insert(skillsTable)
      .values(testSkills)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(2);
    
    // Verify null proficiency levels are handled correctly
    result.forEach(skill => {
      expect(skill.proficiency_level).toBeNull();
    });
  });

  it('should handle mixed proficiency levels correctly', async () => {
    // Create skills with different proficiency levels including null
    const testSkills = [
      {
        name: 'Vue.js',
        category: 'technical' as const,
        proficiency_level: 'beginner' as const
      },
      {
        name: 'Angular',
        category: 'technical' as const,
        proficiency_level: 'intermediate' as const
      },
      {
        name: 'React Native',
        category: 'technical' as const,
        proficiency_level: 'advanced' as const
      },
      {
        name: 'Docker',
        category: 'technical' as const,
        proficiency_level: 'expert' as const
      },
      {
        name: 'AWS',
        category: 'technical' as const,
        proficiency_level: null
      }
    ];

    // Insert test data
    await db.insert(skillsTable)
      .values(testSkills)
      .execute();

    const result = await getSkills();

    expect(result).toHaveLength(5);

    // Verify all proficiency levels are preserved
    const proficiencyLevels = result.map(skill => skill.proficiency_level);
    expect(proficiencyLevels).toContain('beginner');
    expect(proficiencyLevels).toContain('intermediate');
    expect(proficiencyLevels).toContain('advanced');
    expect(proficiencyLevels).toContain('expert');
    expect(proficiencyLevels).toContain(null);
  });
});