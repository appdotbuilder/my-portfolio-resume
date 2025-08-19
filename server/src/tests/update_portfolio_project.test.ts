import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { type UpdatePortfolioProjectInput, type CreatePortfolioProjectInput } from '../schema';
import { updatePortfolioProject } from '../handlers/update_portfolio_project';
import { eq } from 'drizzle-orm';

// Helper function to create a test portfolio project
const createTestProject = async (overrides: Partial<CreatePortfolioProjectInput> = {}) => {
  const defaultProject = {
    title: 'Test Project',
    description: 'A test portfolio project',
    image_url: 'https://example.com/image.jpg',
    demo_url: 'https://example.com/demo',
    github_url: 'https://github.com/user/project',
    technologies: ['React', 'TypeScript', 'Node.js'],
    display_order: 1,
    is_featured: false
  };

  const projectData = { ...defaultProject, ...overrides };
  
  const result = await db.insert(portfolioProjectsTable)
    .values({
      title: projectData.title,
      description: projectData.description,
      image_url: projectData.image_url,
      demo_url: projectData.demo_url,
      github_url: projectData.github_url,
      technologies: JSON.stringify(projectData.technologies),
      display_order: projectData.display_order,
      is_featured: projectData.is_featured
    })
    .returning()
    .execute();

  return result[0];
};

describe('updatePortfolioProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a portfolio project', async () => {
    // Create initial project
    const initialProject = await createTestProject();

    const updateInput: UpdatePortfolioProjectInput = {
      id: initialProject.id,
      title: 'Updated Project Title',
      description: 'Updated project description',
      image_url: 'https://example.com/new-image.jpg',
      demo_url: 'https://example.com/new-demo',
      github_url: 'https://github.com/user/updated-project',
      technologies: ['Vue.js', 'Python', 'PostgreSQL'],
      display_order: 5,
      is_featured: true
    };

    const result = await updatePortfolioProject(updateInput);

    // Verify all fields were updated
    expect(result.id).toEqual(initialProject.id);
    expect(result.title).toEqual('Updated Project Title');
    expect(result.description).toEqual('Updated project description');
    expect(result.image_url).toEqual('https://example.com/new-image.jpg');
    expect(result.demo_url).toEqual('https://example.com/new-demo');
    expect(result.github_url).toEqual('https://github.com/user/updated-project');
    expect(result.technologies).toEqual('["Vue.js","Python","PostgreSQL"]');
    expect(result.display_order).toEqual(5);
    expect(result.is_featured).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(initialProject.updated_at.getTime());
  });

  it('should update only specified fields', async () => {
    // Create initial project
    const initialProject = await createTestProject({
      title: 'Original Title',
      description: 'Original description',
      display_order: 2
    });

    const updateInput: UpdatePortfolioProjectInput = {
      id: initialProject.id,
      title: 'Updated Title Only',
      is_featured: true
    };

    const result = await updatePortfolioProject(updateInput);

    // Verify only specified fields were updated
    expect(result.title).toEqual('Updated Title Only');
    expect(result.is_featured).toEqual(true);
    // Other fields should remain unchanged
    expect(result.description).toEqual('Original description');
    expect(result.display_order).toEqual(2);
    expect(result.image_url).toEqual('https://example.com/image.jpg');
  });

  it('should handle nullable fields correctly', async () => {
    // Create initial project with non-null optional fields
    const initialProject = await createTestProject({
      image_url: 'https://example.com/original.jpg',
      demo_url: 'https://example.com/original-demo',
      github_url: 'https://github.com/user/original'
    });

    const updateInput: UpdatePortfolioProjectInput = {
      id: initialProject.id,
      image_url: null,
      demo_url: null,
      github_url: null
    };

    const result = await updatePortfolioProject(updateInput);

    // Verify nullable fields were set to null
    expect(result.image_url).toBeNull();
    expect(result.demo_url).toBeNull();
    expect(result.github_url).toBeNull();
  });

  it('should handle empty technologies array', async () => {
    // Create initial project
    const initialProject = await createTestProject({
      technologies: ['React', 'TypeScript']
    });

    const updateInput: UpdatePortfolioProjectInput = {
      id: initialProject.id,
      technologies: []
    };

    const result = await updatePortfolioProject(updateInput);

    expect(result.technologies).toEqual('[]');
  });

  it('should save updated project to database', async () => {
    // Create initial project
    const initialProject = await createTestProject();

    const updateInput: UpdatePortfolioProjectInput = {
      id: initialProject.id,
      title: 'Database Update Test',
      display_order: 10
    };

    await updatePortfolioProject(updateInput);

    // Verify the update was persisted to database
    const projects = await db.select()
      .from(portfolioProjectsTable)
      .where(eq(portfolioProjectsTable.id, initialProject.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].title).toEqual('Database Update Test');
    expect(projects[0].display_order).toEqual(10);
  });

  it('should throw error when portfolio project does not exist', async () => {
    const updateInput: UpdatePortfolioProjectInput = {
      id: 99999, // Non-existent ID
      title: 'Should Fail'
    };

    await expect(updatePortfolioProject(updateInput)).rejects.toThrow(/Portfolio project with id 99999 not found/i);
  });

  it('should update display order correctly', async () => {
    // Create initial project
    const initialProject = await createTestProject({
      display_order: 1
    });

    const updateInput: UpdatePortfolioProjectInput = {
      id: initialProject.id,
      display_order: 0
    };

    const result = await updatePortfolioProject(updateInput);

    expect(result.display_order).toEqual(0);
  });

  it('should handle complex technologies array', async () => {
    // Create initial project
    const initialProject = await createTestProject();

    const complexTechnologies = [
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'PostgreSQL',
      'Docker',
      'AWS'
    ];

    const updateInput: UpdatePortfolioProjectInput = {
      id: initialProject.id,
      technologies: complexTechnologies
    };

    const result = await updatePortfolioProject(updateInput);

    expect(result.technologies).toEqual(JSON.stringify(complexTechnologies));
  });
});