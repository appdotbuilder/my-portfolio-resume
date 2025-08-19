import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { type CreatePortfolioProjectInput } from '../schema';
import { createPortfolioProject } from '../handlers/create_portfolio_project';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreatePortfolioProjectInput = {
  title: 'Test Portfolio Project',
  description: 'A comprehensive test project showcasing various skills',
  image_url: 'https://example.com/project-image.jpg',
  demo_url: 'https://example.com/demo',
  github_url: 'https://github.com/user/test-project',
  technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  display_order: 5,
  is_featured: true
};

// Minimal test input with required fields only
const minimalTestInput: CreatePortfolioProjectInput = {
  title: 'Minimal Project',
  description: 'A minimal test project',
  image_url: null,
  demo_url: null,
  github_url: null,
  technologies: [], // Empty technologies array
  display_order: 0, // Explicit value
  is_featured: false // Explicit value
};

describe('createPortfolioProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a portfolio project with all fields', async () => {
    const result = await createPortfolioProject(testInput);

    // Verify all fields are properly set
    expect(result.title).toEqual('Test Portfolio Project');
    expect(result.description).toEqual(testInput.description);
    expect(result.image_url).toEqual('https://example.com/project-image.jpg');
    expect(result.demo_url).toEqual('https://example.com/demo');
    expect(result.github_url).toEqual('https://github.com/user/test-project');
    expect(result.technologies).toEqual(JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL']));
    expect(result.display_order).toEqual(5);
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a portfolio project with minimal fields', async () => {
    const result = await createPortfolioProject(minimalTestInput);

    // Verify required fields
    expect(result.title).toEqual('Minimal Project');
    expect(result.description).toEqual('A minimal test project');
    expect(result.image_url).toBeNull();
    expect(result.demo_url).toBeNull();
    expect(result.github_url).toBeNull();
    expect(result.technologies).toEqual('[]'); // Empty array as JSON string
    expect(result.display_order).toEqual(0); // Default value
    expect(result.is_featured).toEqual(false); // Default value
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save portfolio project to database', async () => {
    const result = await createPortfolioProject(testInput);

    // Query database to verify record was saved
    const projects = await db.select()
      .from(portfolioProjectsTable)
      .where(eq(portfolioProjectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    const savedProject = projects[0];
    
    expect(savedProject.title).toEqual('Test Portfolio Project');
    expect(savedProject.description).toEqual(testInput.description);
    expect(savedProject.image_url).toEqual('https://example.com/project-image.jpg');
    expect(savedProject.demo_url).toEqual('https://example.com/demo');
    expect(savedProject.github_url).toEqual('https://github.com/user/test-project');
    expect(savedProject.technologies).toEqual(JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL']));
    expect(savedProject.display_order).toEqual(5);
    expect(savedProject.is_featured).toEqual(true);
    expect(savedProject.created_at).toBeInstanceOf(Date);
    expect(savedProject.updated_at).toBeInstanceOf(Date);
  });

  it('should handle technologies array conversion properly', async () => {
    const inputWithComplexTechnologies: CreatePortfolioProjectInput = {
      title: 'Tech Stack Project',
      description: 'Project with complex technology stack',
      image_url: null,
      demo_url: null,
      github_url: null,
      technologies: ['React 18', 'TypeScript 4.9', 'Next.js 13', 'TailwindCSS', 'Prisma', 'PostgreSQL 15'],
      display_order: 1,
      is_featured: false
    };

    const result = await createPortfolioProject(inputWithComplexTechnologies);
    
    // Verify technologies are properly stored as JSON string
    expect(result.technologies).toEqual(JSON.stringify(inputWithComplexTechnologies.technologies));
    
    // Verify we can parse it back to original array
    const parsedTechnologies = JSON.parse(result.technologies);
    expect(parsedTechnologies).toEqual(inputWithComplexTechnologies.technologies);
    expect(parsedTechnologies).toHaveLength(6);
    expect(parsedTechnologies).toContain('React 18');
    expect(parsedTechnologies).toContain('PostgreSQL 15');
  });

  it('should handle edge case with empty technologies', async () => {
    const inputWithEmptyTechnologies: CreatePortfolioProjectInput = {
      title: 'Simple Project',
      description: 'A project with no technologies listed',
      image_url: null,
      demo_url: null,
      github_url: null,
      technologies: [],
      display_order: 0,
      is_featured: false
    };

    const result = await createPortfolioProject(inputWithEmptyTechnologies);
    
    expect(result.technologies).toEqual('[]');
    
    // Verify empty array can be parsed back
    const parsedTechnologies = JSON.parse(result.technologies);
    expect(parsedTechnologies).toEqual([]);
    expect(parsedTechnologies).toHaveLength(0);
  });

  it('should handle special characters in project data', async () => {
    const inputWithSpecialChars: CreatePortfolioProjectInput = {
      title: 'Project with "Quotes" & Special Chars',
      description: 'A project description with\nnewlines and special characters: <>?/|\\',
      image_url: 'https://example.com/image-with-query?param=value&other=test',
      demo_url: 'https://example.com/demo?complex=url&with=params',
      github_url: 'https://github.com/user/repo-with-dashes',
      technologies: ['C++', 'C#', 'F#', 'React.js', 'Node.js', 'Express.js'],
      display_order: 999,
      is_featured: true
    };

    const result = await createPortfolioProject(inputWithSpecialChars);
    
    // Verify special characters are handled correctly
    expect(result.title).toEqual('Project with "Quotes" & Special Chars');
    expect(result.description).toContain('newlines and special characters');
    expect(result.image_url).toEqual('https://example.com/image-with-query?param=value&other=test');
    expect(result.demo_url).toEqual('https://example.com/demo?complex=url&with=params');
    
    // Verify technologies with special characters
    const parsedTechnologies = JSON.parse(result.technologies);
    expect(parsedTechnologies).toContain('C++');
    expect(parsedTechnologies).toContain('C#');
    expect(parsedTechnologies).toContain('F#');
  });
});