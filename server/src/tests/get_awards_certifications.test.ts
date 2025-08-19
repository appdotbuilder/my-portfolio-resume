import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type CreateAwardCertificationInput } from '../schema';
import { getAwardsCertifications } from '../handlers/get_awards_certifications';

describe('getAwardsCertifications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no awards/certifications exist', async () => {
    const results = await getAwardsCertifications();
    expect(results).toEqual([]);
  });

  it('should return all awards and certifications', async () => {
    // Create test data
    const testAward: CreateAwardCertificationInput = {
      title: 'Employee of the Year',
      issuer: 'Acme Corp',
      date_received: new Date('2023-12-01'),
      description: 'Outstanding performance award',
      type: 'award' as const,
      expiry_date: null,
      credential_url: null
    };

    const testCertification: CreateAwardCertificationInput = {
      title: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date_received: new Date('2023-06-15'),
      description: 'Professional cloud architecture certification',
      type: 'certification' as const,
      expiry_date: new Date('2026-06-15'),
      credential_url: 'https://aws.amazon.com/verification/123456'
    };

    // Insert test data
    await db.insert(awardsCertificationsTable).values([
      {
        ...testAward,
        description: testAward.description,
        expiry_date: testAward.expiry_date,
        credential_url: testAward.credential_url
      },
      {
        ...testCertification,
        description: testCertification.description,
        expiry_date: testCertification.expiry_date,
        credential_url: testCertification.credential_url
      }
    ]).execute();

    const results = await getAwardsCertifications();

    expect(results).toHaveLength(2);
    
    // Verify all required fields are present
    results.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.issuer).toBeDefined();
      expect(item.date_received).toBeInstanceOf(Date);
      expect(item.type).toMatch(/^(award|certification)$/);
      expect(item.created_at).toBeInstanceOf(Date);
      expect(item.updated_at).toBeInstanceOf(Date);
    });

    // Find specific items
    const award = results.find(item => item.type === 'award');
    const certification = results.find(item => item.type === 'certification');

    expect(award).toBeDefined();
    expect(award!.title).toEqual('Employee of the Year');
    expect(award!.issuer).toEqual('Acme Corp');
    expect(award!.description).toEqual('Outstanding performance award');
    expect(award!.expiry_date).toBeNull();
    expect(award!.credential_url).toBeNull();

    expect(certification).toBeDefined();
    expect(certification!.title).toEqual('AWS Solutions Architect');
    expect(certification!.issuer).toEqual('Amazon Web Services');
    expect(certification!.description).toEqual('Professional cloud architecture certification');
    expect(certification!.expiry_date).toBeInstanceOf(Date);
    expect(certification!.credential_url).toEqual('https://aws.amazon.com/verification/123456');
  });

  it('should return results ordered by date_received descending', async () => {
    // Create test data with different dates
    const testItems = [
      {
        title: 'Oldest Award',
        issuer: 'Company A',
        date_received: new Date('2020-01-01'),
        description: null,
        type: 'award' as const,
        expiry_date: null,
        credential_url: null
      },
      {
        title: 'Middle Certification',
        issuer: 'Company B',
        date_received: new Date('2022-06-01'),
        description: null,
        type: 'certification' as const,
        expiry_date: null,
        credential_url: null
      },
      {
        title: 'Newest Award',
        issuer: 'Company C',
        date_received: new Date('2024-01-01'),
        description: null,
        type: 'award' as const,
        expiry_date: null,
        credential_url: null
      }
    ];

    // Insert test data
    await db.insert(awardsCertificationsTable).values(testItems).execute();

    const results = await getAwardsCertifications();

    expect(results).toHaveLength(3);
    
    // Verify descending order by date_received
    expect(results[0].title).toEqual('Newest Award');
    expect(results[0].date_received.getFullYear()).toEqual(2024);
    
    expect(results[1].title).toEqual('Middle Certification');
    expect(results[1].date_received.getFullYear()).toEqual(2022);
    
    expect(results[2].title).toEqual('Oldest Award');
    expect(results[2].date_received.getFullYear()).toEqual(2020);

    // Verify the ordering is strictly descending
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].date_received >= results[i + 1].date_received).toBe(true);
    }
  });

  it('should handle items with same date_received', async () => {
    const sameDate = new Date('2023-01-01');
    
    const testItems = [
      {
        title: 'First Item',
        issuer: 'Company A',
        date_received: sameDate,
        description: null,
        type: 'award' as const,
        expiry_date: null,
        credential_url: null
      },
      {
        title: 'Second Item',
        issuer: 'Company B',
        date_received: sameDate,
        description: null,
        type: 'certification' as const,
        expiry_date: null,
        credential_url: null
      }
    ];

    await db.insert(awardsCertificationsTable).values(testItems).execute();

    const results = await getAwardsCertifications();

    expect(results).toHaveLength(2);
    
    // Both should have the same date
    expect(results[0].date_received.getTime()).toEqual(sameDate.getTime());
    expect(results[1].date_received.getTime()).toEqual(sameDate.getTime());
    
    // Verify we get both items
    const titles = results.map(item => item.title).sort();
    expect(titles).toEqual(['First Item', 'Second Item']);
  });

  it('should handle nullable fields correctly', async () => {
    const testItem = {
      title: 'Test Award',
      issuer: 'Test Issuer',
      date_received: new Date('2023-01-01'),
      description: null,
      type: 'award' as const,
      expiry_date: null,
      credential_url: null
    };

    await db.insert(awardsCertificationsTable).values([testItem]).execute();

    const results = await getAwardsCertifications();

    expect(results).toHaveLength(1);
    expect(results[0].description).toBeNull();
    expect(results[0].expiry_date).toBeNull();
    expect(results[0].credential_url).toBeNull();
  });
});