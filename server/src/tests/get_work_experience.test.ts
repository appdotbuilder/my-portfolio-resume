import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { workExperienceTable } from '../db/schema';
import { getWorkExperience } from '../handlers/get_work_experience';

describe('getWorkExperience', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no work experience exists', async () => {
    const result = await getWorkExperience();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should fetch single work experience entry', async () => {
    // Create test work experience
    const testExperience = {
      company: 'Tech Corp',
      title: 'Software Developer',
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31'),
      responsibilities: 'Developed web applications using React and Node.js',
      is_current: false
    };

    await db.insert(workExperienceTable)
      .values(testExperience)
      .execute();

    const result = await getWorkExperience();

    expect(result).toHaveLength(1);
    expect(result[0].company).toEqual('Tech Corp');
    expect(result[0].title).toEqual('Software Developer');
    expect(result[0].start_date).toBeInstanceOf(Date);
    expect(result[0].end_date).toBeInstanceOf(Date);
    expect(result[0].responsibilities).toEqual(testExperience.responsibilities);
    expect(result[0].is_current).toEqual(false);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should fetch multiple work experience entries ordered by start_date descending', async () => {
    // Create test work experiences with different start dates
    const experiences = [
      {
        company: 'Old Corp',
        title: 'Junior Developer',
        start_date: new Date('2021-06-01'),
        end_date: new Date('2022-12-31'),
        responsibilities: 'Maintained legacy systems',
        is_current: false
      },
      {
        company: 'Current Corp',
        title: 'Senior Developer',
        start_date: new Date('2024-01-01'),
        end_date: null,
        responsibilities: 'Lead development team',
        is_current: true
      },
      {
        company: 'Mid Corp',
        title: 'Full Stack Developer',
        start_date: new Date('2023-01-01'),
        end_date: new Date('2023-12-31'),
        responsibilities: 'Full stack development',
        is_current: false
      }
    ];

    // Insert experiences in random order
    for (const experience of experiences) {
      await db.insert(workExperienceTable)
        .values(experience)
        .execute();
    }

    const result = await getWorkExperience();

    expect(result).toHaveLength(3);
    
    // Verify ordering by start_date descending (most recent first)
    expect(result[0].company).toEqual('Current Corp'); // 2024-01-01
    expect(result[0].start_date.getFullYear()).toEqual(2024);
    expect(result[0].is_current).toEqual(true);
    expect(result[0].end_date).toBeNull();

    expect(result[1].company).toEqual('Mid Corp'); // 2023-01-01
    expect(result[1].start_date.getFullYear()).toEqual(2023);
    expect(result[1].is_current).toEqual(false);

    expect(result[2].company).toEqual('Old Corp'); // 2021-06-01
    expect(result[2].start_date.getFullYear()).toEqual(2021);
    expect(result[2].is_current).toEqual(false);
  });

  it('should handle work experience with null end_date for current positions', async () => {
    // Create current work experience with null end_date
    const currentExperience = {
      company: 'Current Startup',
      title: 'Lead Engineer',
      start_date: new Date('2023-03-15'),
      end_date: null,
      responsibilities: 'Leading the engineering team and architecting solutions',
      is_current: true
    };

    await db.insert(workExperienceTable)
      .values(currentExperience)
      .execute();

    const result = await getWorkExperience();

    expect(result).toHaveLength(1);
    expect(result[0].company).toEqual('Current Startup');
    expect(result[0].title).toEqual('Lead Engineer');
    expect(result[0].is_current).toEqual(true);
    expect(result[0].end_date).toBeNull();
    expect(result[0].start_date).toBeInstanceOf(Date);
  });

  it('should return all fields correctly formatted', async () => {
    const testExperience = {
      company: 'Test Company',
      title: 'Test Position',
      start_date: new Date('2022-05-01T00:00:00Z'),
      end_date: new Date('2023-04-30T00:00:00Z'),
      responsibilities: 'Test responsibilities with detailed description',
      is_current: false
    };

    await db.insert(workExperienceTable)
      .values(testExperience)
      .execute();

    const result = await getWorkExperience();

    expect(result).toHaveLength(1);
    
    const experience = result[0];
    
    // Verify all required fields are present and correctly typed
    expect(typeof experience.id).toBe('number');
    expect(typeof experience.company).toBe('string');
    expect(typeof experience.title).toBe('string');
    expect(experience.start_date).toBeInstanceOf(Date);
    expect(experience.end_date).toBeInstanceOf(Date);
    expect(typeof experience.responsibilities).toBe('string');
    expect(typeof experience.is_current).toBe('boolean');
    expect(experience.created_at).toBeInstanceOf(Date);
    expect(experience.updated_at).toBeInstanceOf(Date);
  });
});