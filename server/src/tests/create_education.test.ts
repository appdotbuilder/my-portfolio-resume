import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { educationTable } from '../db/schema';
import { type CreateEducationInput } from '../schema';
import { createEducation } from '../handlers/create_education';
import { eq } from 'drizzle-orm';

// Test input with all fields including defaults
const testInput: CreateEducationInput = {
  degree: 'Bachelor of Science',
  major: 'Computer Science',
  institution: 'Test University',
  start_date: new Date('2020-09-01'),
  end_date: new Date('2024-05-15'),
  gpa: 3.8,
  is_current: false
};

// Test input for current education (no end date)
const currentEducationInput: CreateEducationInput = {
  degree: 'Master of Science',
  major: 'Software Engineering',
  institution: 'Graduate University',
  start_date: new Date('2024-09-01'),
  end_date: null,
  gpa: null,
  is_current: true
};

describe('createEducation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an education record with all fields', async () => {
    const result = await createEducation(testInput);

    // Basic field validation
    expect(result.degree).toEqual('Bachelor of Science');
    expect(result.major).toEqual('Computer Science');
    expect(result.institution).toEqual('Test University');
    expect(result.start_date).toBeInstanceOf(Date);
    expect(result.end_date).toBeInstanceOf(Date);
    expect(result.gpa).toEqual(3.8);
    expect(result.is_current).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save education record to database', async () => {
    const result = await createEducation(testInput);

    // Query using proper drizzle syntax
    const educations = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, result.id))
      .execute();

    expect(educations).toHaveLength(1);
    expect(educations[0].degree).toEqual('Bachelor of Science');
    expect(educations[0].major).toEqual('Computer Science');
    expect(educations[0].institution).toEqual('Test University');
    expect(educations[0].gpa).toEqual(3.8);
    expect(educations[0].is_current).toEqual(false);
    expect(educations[0].created_at).toBeInstanceOf(Date);
    expect(educations[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create current education record with null values', async () => {
    const result = await createEducation(currentEducationInput);

    // Basic field validation
    expect(result.degree).toEqual('Master of Science');
    expect(result.major).toEqual('Software Engineering');
    expect(result.institution).toEqual('Graduate University');
    expect(result.start_date).toBeInstanceOf(Date);
    expect(result.end_date).toBeNull();
    expect(result.gpa).toBeNull();
    expect(result.is_current).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save current education record with null values to database', async () => {
    const result = await createEducation(currentEducationInput);

    // Query using proper drizzle syntax
    const educations = await db.select()
      .from(educationTable)
      .where(eq(educationTable.id, result.id))
      .execute();

    expect(educations).toHaveLength(1);
    expect(educations[0].degree).toEqual('Master of Science');
    expect(educations[0].major).toEqual('Software Engineering');
    expect(educations[0].institution).toEqual('Graduate University');
    expect(educations[0].end_date).toBeNull();
    expect(educations[0].gpa).toBeNull();
    expect(educations[0].is_current).toEqual(true);
  });

  it('should apply default value for is_current when not provided', async () => {
    const inputWithoutIsCurrent: CreateEducationInput = {
      degree: 'Associate Degree',
      major: 'Information Technology',
      institution: 'Community College',
      start_date: new Date('2022-01-15'),
      end_date: new Date('2023-12-20'),
      gpa: 3.5,
      is_current: false // Zod default applied
    };

    const result = await createEducation(inputWithoutIsCurrent);

    expect(result.is_current).toEqual(false);
    expect(result.degree).toEqual('Associate Degree');
    expect(result.major).toEqual('Information Technology');
    expect(result.institution).toEqual('Community College');
  });

  it('should handle education with minimal required fields only', async () => {
    const minimalInput: CreateEducationInput = {
      degree: 'Certificate',
      major: 'Web Development',
      institution: 'Online Academy',
      start_date: new Date('2023-06-01'),
      end_date: null,
      gpa: null,
      is_current: false
    };

    const result = await createEducation(minimalInput);

    expect(result.degree).toEqual('Certificate');
    expect(result.major).toEqual('Web Development');
    expect(result.institution).toEqual('Online Academy');
    expect(result.start_date).toBeInstanceOf(Date);
    expect(result.end_date).toBeNull();
    expect(result.gpa).toBeNull();
    expect(result.is_current).toEqual(false);
    expect(result.id).toBeDefined();
  });
});