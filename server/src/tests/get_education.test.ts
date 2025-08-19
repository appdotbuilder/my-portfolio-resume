import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { educationTable } from '../db/schema';
import { type CreateEducationInput } from '../schema';
import { getEducation } from '../handlers/get_education';

const testEducation1: CreateEducationInput = {
  degree: 'Bachelor of Science',
  major: 'Computer Science',
  institution: 'University of Technology',
  start_date: new Date('2020-09-01'),
  end_date: new Date('2024-05-15'),
  gpa: 3.85,
  is_current: false
};

const testEducation2: CreateEducationInput = {
  degree: 'Master of Science',
  major: 'Software Engineering',
  institution: 'Graduate Institute',
  start_date: new Date('2024-09-01'),
  end_date: null,
  gpa: null,
  is_current: true
};

const testEducation3: CreateEducationInput = {
  degree: 'High School Diploma',
  major: 'General Studies',
  institution: 'Central High School',
  start_date: new Date('2016-09-01'),
  end_date: new Date('2020-06-15'),
  gpa: 3.95,
  is_current: false
};

describe('getEducation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no education entries exist', async () => {
    const result = await getEducation();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all education entries ordered by start_date descending', async () => {
    // Create test education entries
    await db.insert(educationTable)
      .values([
        testEducation1,
        testEducation2,
        testEducation3
      ])
      .execute();

    const result = await getEducation();

    expect(result).toHaveLength(3);
    
    // Verify ordering by start_date (most recent first)
    expect(result[0].degree).toEqual('Master of Science');
    expect(result[0].start_date).toEqual(new Date('2024-09-01'));
    expect(result[1].degree).toEqual('Bachelor of Science');
    expect(result[1].start_date).toEqual(new Date('2020-09-01'));
    expect(result[2].degree).toEqual('High School Diploma');
    expect(result[2].start_date).toEqual(new Date('2016-09-01'));
  });

  it('should return complete education data with all fields', async () => {
    await db.insert(educationTable)
      .values(testEducation1)
      .execute();

    const result = await getEducation();

    expect(result).toHaveLength(1);
    const education = result[0];

    // Verify all fields are present
    expect(education.id).toBeDefined();
    expect(education.degree).toEqual('Bachelor of Science');
    expect(education.major).toEqual('Computer Science');
    expect(education.institution).toEqual('University of Technology');
    expect(education.start_date).toEqual(new Date('2020-09-01'));
    expect(education.end_date).toEqual(new Date('2024-05-15'));
    expect(education.gpa).toEqual(3.85);
    expect(typeof education.gpa).toBe('number');
    expect(education.is_current).toBe(false);
    expect(education.created_at).toBeInstanceOf(Date);
    expect(education.updated_at).toBeInstanceOf(Date);
  });

  it('should handle education entries with null values correctly', async () => {
    await db.insert(educationTable)
      .values(testEducation2)
      .execute();

    const result = await getEducation();

    expect(result).toHaveLength(1);
    const education = result[0];

    expect(education.degree).toEqual('Master of Science');
    expect(education.end_date).toBeNull();
    expect(education.gpa).toBeNull();
    expect(education.is_current).toBe(true);
  });

  it('should handle multiple education entries with mixed data types', async () => {
    // Create entries with different GPA values including null
    await db.insert(educationTable)
      .values([
        testEducation1, // has GPA: 3.85
        testEducation2, // has GPA: null
        testEducation3  // has GPA: 3.95
      ])
      .execute();

    const result = await getEducation();

    expect(result).toHaveLength(3);
    
    // Verify GPA handling
    const mastersDegree = result.find(e => e.degree === 'Master of Science');
    const bachelorsDegree = result.find(e => e.degree === 'Bachelor of Science');
    const highSchool = result.find(e => e.degree === 'High School Diploma');

    expect(mastersDegree?.gpa).toBeNull();
    expect(bachelorsDegree?.gpa).toEqual(3.85);
    expect(typeof bachelorsDegree?.gpa).toBe('number');
    expect(highSchool?.gpa).toEqual(3.95);
    expect(typeof highSchool?.gpa).toBe('number');
  });

  it('should maintain data integrity for current vs completed education', async () => {
    await db.insert(educationTable)
      .values([testEducation1, testEducation2])
      .execute();

    const result = await getEducation();

    const current = result.find(e => e.is_current === true);
    const completed = result.find(e => e.is_current === false);

    expect(current?.degree).toEqual('Master of Science');
    expect(current?.end_date).toBeNull();
    expect(current?.is_current).toBe(true);

    expect(completed?.degree).toEqual('Bachelor of Science');
    expect(completed?.end_date).toEqual(new Date('2024-05-15'));
    expect(completed?.is_current).toBe(false);
  });
});