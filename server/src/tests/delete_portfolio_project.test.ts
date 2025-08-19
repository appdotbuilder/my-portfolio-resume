import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { type DeleteInput, type CreatePortfolioProjectInput } from '../schema';
import { deletePortfolioProject } from '../handlers/delete_portfolio_project';
import { eq } from 'drizzle-orm';

// Test input for creating a portfolio project
const testProjectInput: CreatePortfolioProjectInput = {
  title: 'Test Project',
  description: 'A test portfolio project',
  image_url: 'https://example.com/image.jpg',
  demo_url: 'https://example.com/demo',
  github_url: 'https://github.com/user/test-project',
  technologies: ['React', 'TypeScript', 'Node.js'],
  display_order: 1,
  is_featured: true
};

describe('deletePortfolioProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing portfolio project', async () => {
    // First create a project to delete
    const createResult = await db.insert(portfolioProjectsTable)
      .values({
        title: testProjectInput.title,
        description: testProjectInput.description,
        image_url: testProjectInput.image_url,
        demo_url: testProjectInput.demo_url,
        github_url: testProjectInput.github_url,
        technologies: JSON.stringify(testProjectInput.technologies),
        display_order: testProjectInput.display_order,
        is_featured: testProjectInput.is_featured
      })
      .returning()
      .execute();

    const createdProject = createResult[0];
    const deleteInput: DeleteInput = { id: createdProject.id };

    // Delete the project
    await deletePortfolioProject(deleteInput);

    // Verify the project no longer exists
    const projects = await db.select()
      .from(portfolioProjectsTable)
      .where(eq(portfolioProjectsTable.id, createdProject.id))
      .execute();

    expect(projects).toHaveLength(0);
  });

  it('should throw error when deleting non-existent portfolio project', async () => {
    const nonExistentId = 99999;
    const deleteInput: DeleteInput = { id: nonExistentId };

    // Attempt to delete non-existent project should throw error
    await expect(deletePortfolioProject(deleteInput))
      .rejects.toThrow(/portfolio project with id 99999 not found/i);
  });

  it('should not affect other portfolio projects when deleting one', async () => {
    // Create two projects
    const project1Result = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Project 1',
        description: 'First test project',
        image_url: 'https://example.com/image1.jpg',
        demo_url: 'https://example.com/demo1',
        github_url: 'https://github.com/user/project1',
        technologies: JSON.stringify(['React', 'CSS']),
        display_order: 1,
        is_featured: false
      })
      .returning()
      .execute();

    const project2Result = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Project 2',
        description: 'Second test project',
        image_url: 'https://example.com/image2.jpg',
        demo_url: 'https://example.com/demo2',
        github_url: 'https://github.com/user/project2',
        technologies: JSON.stringify(['Vue', 'JavaScript']),
        display_order: 2,
        is_featured: true
      })
      .returning()
      .execute();

    const project1 = project1Result[0];
    const project2 = project2Result[0];

    // Delete first project
    await deletePortfolioProject({ id: project1.id });

    // Verify first project is deleted
    const deletedProjects = await db.select()
      .from(portfolioProjectsTable)
      .where(eq(portfolioProjectsTable.id, project1.id))
      .execute();

    expect(deletedProjects).toHaveLength(0);

    // Verify second project still exists
    const remainingProjects = await db.select()
      .from(portfolioProjectsTable)
      .where(eq(portfolioProjectsTable.id, project2.id))
      .execute();

    expect(remainingProjects).toHaveLength(1);
    expect(remainingProjects[0].title).toEqual('Project 2');
    expect(remainingProjects[0].description).toEqual('Second test project');
  });

  it('should handle deletion of project with minimal data', async () => {
    // Create a project with only required fields
    const minimalProjectResult = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Minimal Project',
        description: 'Project with minimal data',
        image_url: null,
        demo_url: null,
        github_url: null,
        technologies: JSON.stringify([]),
        display_order: 0,
        is_featured: false
      })
      .returning()
      .execute();

    const minimalProject = minimalProjectResult[0];

    // Delete the minimal project
    await deletePortfolioProject({ id: minimalProject.id });

    // Verify deletion
    const projects = await db.select()
      .from(portfolioProjectsTable)
      .where(eq(portfolioProjectsTable.id, minimalProject.id))
      .execute();

    expect(projects).toHaveLength(0);
  });
});