import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { portfolioProjectsTable } from '../db/schema';
import { getPortfolioProjects } from '../handlers/get_portfolio_projects';

describe('getPortfolioProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getPortfolioProjects();
    
    expect(result).toEqual([]);
  });

  it('should fetch all portfolio projects', async () => {
    // Create test projects
    await db.insert(portfolioProjectsTable)
      .values([
        {
          title: 'Project 1',
          description: 'First project description',
          technologies: JSON.stringify(['React', 'TypeScript']),
          display_order: 1,
          is_featured: false,
          image_url: 'https://example.com/project1.jpg',
          demo_url: 'https://project1.demo.com',
          github_url: 'https://github.com/user/project1'
        },
        {
          title: 'Project 2',
          description: 'Second project description',
          technologies: JSON.stringify(['Node.js', 'PostgreSQL']),
          display_order: 2,
          is_featured: true,
          image_url: null,
          demo_url: null,
          github_url: 'https://github.com/user/project2'
        }
      ])
      .execute();

    const result = await getPortfolioProjects();

    expect(result).toHaveLength(2);
    
    // Verify all fields are present
    result.forEach(project => {
      expect(project.id).toBeDefined();
      expect(project.title).toBeDefined();
      expect(project.description).toBeDefined();
      expect(project.technologies).toBeDefined();
      expect(typeof project.display_order).toBe('number');
      expect(typeof project.is_featured).toBe('boolean');
      expect(project.created_at).toBeInstanceOf(Date);
      expect(project.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should order projects correctly - featured first, then by display_order, then by created_at', async () => {
    // Create projects with specific timing to test ordering
    const project1 = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Regular Project 1',
        description: 'Regular project with order 1',
        technologies: JSON.stringify(['HTML', 'CSS']),
        display_order: 1,
        is_featured: false
      })
      .returning()
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const project2 = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Featured Project',
        description: 'Featured project with order 3',
        technologies: JSON.stringify(['Vue.js']),
        display_order: 3,
        is_featured: true
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const project3 = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Regular Project 2',
        description: 'Regular project with order 2',
        technologies: JSON.stringify(['JavaScript']),
        display_order: 2,
        is_featured: false
      })
      .returning()
      .execute();

    const result = await getPortfolioProjects();

    expect(result).toHaveLength(3);
    
    // Featured project should be first despite higher display_order
    expect(result[0].title).toBe('Featured Project');
    expect(result[0].is_featured).toBe(true);
    
    // Regular projects should follow by display_order
    expect(result[1].title).toBe('Regular Project 1');
    expect(result[1].display_order).toBe(1);
    
    expect(result[2].title).toBe('Regular Project 2');
    expect(result[2].display_order).toBe(2);
  });

  it('should handle projects with same display_order by created_at descending', async () => {
    // Create projects with same display_order but different creation times
    const project1 = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Older Project',
        description: 'Project created first',
        technologies: JSON.stringify(['Python']),
        display_order: 1,
        is_featured: false
      })
      .returning()
      .execute();

    // Wait to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const project2 = await db.insert(portfolioProjectsTable)
      .values({
        title: 'Newer Project',
        description: 'Project created second',
        technologies: JSON.stringify(['Go']),
        display_order: 1,
        is_featured: false
      })
      .returning()
      .execute();

    const result = await getPortfolioProjects();

    expect(result).toHaveLength(2);
    
    // Newer project should come first (created_at descending)
    expect(result[0].title).toBe('Newer Project');
    expect(result[1].title).toBe('Older Project');
  });

  it('should handle projects with nullable fields correctly', async () => {
    await db.insert(portfolioProjectsTable)
      .values({
        title: 'Minimal Project',
        description: 'Project with minimal data',
        technologies: JSON.stringify(['Minimal']),
        display_order: 0,
        is_featured: false,
        image_url: null,
        demo_url: null,
        github_url: null
      })
      .execute();

    const result = await getPortfolioProjects();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Minimal Project');
    expect(result[0].image_url).toBeNull();
    expect(result[0].demo_url).toBeNull();
    expect(result[0].github_url).toBeNull();
  });

  it('should preserve technologies as JSON string', async () => {
    const technologies = ['React', 'TypeScript', 'Tailwind CSS'];
    
    await db.insert(portfolioProjectsTable)
      .values({
        title: 'Tech Stack Project',
        description: 'Project with multiple technologies',
        technologies: JSON.stringify(technologies),
        display_order: 1,
        is_featured: false
      })
      .execute();

    const result = await getPortfolioProjects();

    expect(result).toHaveLength(1);
    expect(result[0].technologies).toBe(JSON.stringify(technologies));
    
    // Verify that technologies can be parsed back to array
    const parsedTechnologies = JSON.parse(result[0].technologies);
    expect(parsedTechnologies).toEqual(technologies);
  });

  it('should handle multiple featured projects correctly', async () => {
    // Create multiple featured projects with different display orders
    await db.insert(portfolioProjectsTable)
      .values([
        {
          title: 'Featured Project A',
          description: 'First featured project',
          technologies: JSON.stringify(['React']),
          display_order: 3,
          is_featured: true
        },
        {
          title: 'Featured Project B',
          description: 'Second featured project',
          technologies: JSON.stringify(['Vue.js']),
          display_order: 1,
          is_featured: true
        },
        {
          title: 'Regular Project',
          description: 'Non-featured project',
          technologies: JSON.stringify(['HTML']),
          display_order: 2,
          is_featured: false
        }
      ])
      .execute();

    const result = await getPortfolioProjects();

    expect(result).toHaveLength(3);
    
    // Featured projects should be first two
    expect(result[0].is_featured).toBe(true);
    expect(result[1].is_featured).toBe(true);
    expect(result[2].is_featured).toBe(false);
    
    // Among featured projects, should be ordered by display_order
    expect(result[0].title).toBe('Featured Project B'); // display_order: 1
    expect(result[1].title).toBe('Featured Project A'); // display_order: 3
    expect(result[2].title).toBe('Regular Project'); // not featured
  });
});