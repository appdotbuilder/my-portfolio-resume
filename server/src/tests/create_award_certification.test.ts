import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type CreateAwardCertificationInput } from '../schema';
import { createAwardCertification } from '../handlers/create_award_certification';
import { eq } from 'drizzle-orm';

// Test input for certification
const testCertificationInput: CreateAwardCertificationInput = {
  title: 'AWS Solutions Architect',
  issuer: 'Amazon Web Services',
  date_received: new Date('2024-01-15'),
  description: 'Professional certification in AWS cloud architecture',
  type: 'certification',
  expiry_date: new Date('2027-01-15'),
  credential_url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/'
};

// Test input for award
const testAwardInput: CreateAwardCertificationInput = {
  title: 'Employee of the Year',
  issuer: 'Tech Company Inc.',
  date_received: new Date('2023-12-31'),
  description: 'Awarded for outstanding performance and leadership',
  type: 'award',
  expiry_date: null,
  credential_url: null
};

describe('createAwardCertification', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a certification', async () => {
    const result = await createAwardCertification(testCertificationInput);

    // Basic field validation
    expect(result.title).toEqual('AWS Solutions Architect');
    expect(result.issuer).toEqual('Amazon Web Services');
    expect(result.date_received).toEqual(new Date('2024-01-15'));
    expect(result.description).toEqual('Professional certification in AWS cloud architecture');
    expect(result.type).toEqual('certification');
    expect(result.expiry_date).toEqual(new Date('2027-01-15'));
    expect(result.credential_url).toEqual('https://aws.amazon.com/certification/certified-solutions-architect-associate/');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an award with null values', async () => {
    const result = await createAwardCertification(testAwardInput);

    // Basic field validation
    expect(result.title).toEqual('Employee of the Year');
    expect(result.issuer).toEqual('Tech Company Inc.');
    expect(result.date_received).toEqual(new Date('2023-12-31'));
    expect(result.description).toEqual('Awarded for outstanding performance and leadership');
    expect(result.type).toEqual('award');
    expect(result.expiry_date).toBeNull();
    expect(result.credential_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save award/certification to database', async () => {
    const result = await createAwardCertification(testCertificationInput);

    // Query the database to verify the record was saved
    const records = await db.select()
      .from(awardsCertificationsTable)
      .where(eq(awardsCertificationsTable.id, result.id))
      .execute();

    expect(records).toHaveLength(1);
    const record = records[0];
    expect(record.title).toEqual('AWS Solutions Architect');
    expect(record.issuer).toEqual('Amazon Web Services');
    expect(record.date_received).toEqual(new Date('2024-01-15'));
    expect(record.description).toEqual('Professional certification in AWS cloud architecture');
    expect(record.type).toEqual('certification');
    expect(record.expiry_date).toEqual(new Date('2027-01-15'));
    expect(record.credential_url).toEqual('https://aws.amazon.com/certification/certified-solutions-architect-associate/');
    expect(record.created_at).toBeInstanceOf(Date);
    expect(record.updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple awards/certifications', async () => {
    const certification = await createAwardCertification(testCertificationInput);
    const award = await createAwardCertification(testAwardInput);

    // Verify both records exist in database
    const records = await db.select()
      .from(awardsCertificationsTable)
      .execute();

    expect(records).toHaveLength(2);
    
    // Find each record by ID
    const certRecord = records.find(r => r.id === certification.id);
    const awardRecord = records.find(r => r.id === award.id);

    expect(certRecord).toBeDefined();
    expect(certRecord!.type).toEqual('certification');
    expect(certRecord!.expiry_date).toEqual(new Date('2027-01-15'));

    expect(awardRecord).toBeDefined();
    expect(awardRecord!.type).toEqual('award');
    expect(awardRecord!.expiry_date).toBeNull();
  });

  it('should handle minimal required fields', async () => {
    const minimalInput: CreateAwardCertificationInput = {
      title: 'Basic Award',
      issuer: 'Test Organization',
      date_received: new Date('2024-02-01'),
      description: null,
      type: 'award',
      expiry_date: null,
      credential_url: null
    };

    const result = await createAwardCertification(minimalInput);

    expect(result.title).toEqual('Basic Award');
    expect(result.issuer).toEqual('Test Organization');
    expect(result.type).toEqual('award');
    expect(result.description).toBeNull();
    expect(result.expiry_date).toBeNull();
    expect(result.credential_url).toBeNull();
    expect(result.id).toBeDefined();
  });
});