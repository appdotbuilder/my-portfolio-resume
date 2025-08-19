import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type UpdateAwardCertificationInput, type CreateAwardCertificationInput } from '../schema';
import { updateAwardCertification } from '../handlers/update_award_certification';
import { eq } from 'drizzle-orm';

// Helper function to create test award/certification
const createTestAwardCertification = async (data: CreateAwardCertificationInput) => {
  const result = await db.insert(awardsCertificationsTable)
    .values({
      title: data.title,
      issuer: data.issuer,
      date_received: data.date_received,
      description: data.description,
      type: data.type,
      expiry_date: data.expiry_date,
      credential_url: data.credential_url
    })
    .returning()
    .execute();
  
  return result[0];
};

// Test input data
const baseAwardData: CreateAwardCertificationInput = {
  title: 'Best Developer Award',
  issuer: 'Tech Company Inc',
  date_received: new Date('2023-01-15'),
  description: 'Award for outstanding development work',
  type: 'award' as const,
  expiry_date: null,
  credential_url: 'https://example.com/award'
};

const baseCertData: CreateAwardCertificationInput = {
  title: 'AWS Solutions Architect',
  issuer: 'Amazon Web Services',
  date_received: new Date('2023-06-01'),
  description: 'Professional cloud architecture certification',
  type: 'certification' as const,
  expiry_date: new Date('2026-06-01'),
  credential_url: 'https://aws.amazon.com/certification/verify'
};

describe('updateAwardCertification', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of an award', async () => {
    // Create initial award
    const created = await createTestAwardCertification(baseAwardData);

    // Update all fields
    const updateInput: UpdateAwardCertificationInput = {
      id: created.id,
      title: 'Excellence in Innovation Award',
      issuer: 'Innovation Council',
      date_received: new Date('2023-12-01'),
      description: 'Updated award description',
      type: 'award' as const,
      expiry_date: new Date('2030-12-01'),
      credential_url: 'https://innovation.com/awards'
    };

    const result = await updateAwardCertification(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(created.id);
    expect(result.title).toEqual('Excellence in Innovation Award');
    expect(result.issuer).toEqual('Innovation Council');
    expect(result.date_received).toEqual(new Date('2023-12-01'));
    expect(result.description).toEqual('Updated award description');
    expect(result.type).toEqual('award');
    expect(result.expiry_date).toEqual(new Date('2030-12-01'));
    expect(result.credential_url).toEqual('https://innovation.com/awards');
    expect(result.created_at).toEqual(created.created_at);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should update certification from award to certification type', async () => {
    // Create initial award
    const created = await createTestAwardCertification(baseAwardData);

    // Update to certification type
    const updateInput: UpdateAwardCertificationInput = {
      id: created.id,
      title: 'Professional Developer Certification',
      type: 'certification' as const,
      expiry_date: new Date('2026-01-15')
    };

    const result = await updateAwardCertification(updateInput);

    // Verify type change and partial update
    expect(result.type).toEqual('certification');
    expect(result.title).toEqual('Professional Developer Certification');
    expect(result.expiry_date).toEqual(new Date('2026-01-15'));
    
    // Other fields should remain unchanged
    expect(result.issuer).toEqual(baseAwardData.issuer);
    expect(result.description).toEqual(baseAwardData.description);
    expect(result.credential_url).toEqual(baseAwardData.credential_url);
  });

  it('should update only specific fields when provided', async () => {
    // Create initial certification
    const created = await createTestAwardCertification(baseCertData);

    // Update only title and expiry date
    const updateInput: UpdateAwardCertificationInput = {
      id: created.id,
      title: 'AWS Solutions Architect - Professional',
      expiry_date: new Date('2027-06-01')
    };

    const result = await updateAwardCertification(updateInput);

    // Verify only specified fields were updated
    expect(result.title).toEqual('AWS Solutions Architect - Professional');
    expect(result.expiry_date).toEqual(new Date('2027-06-01'));
    
    // Other fields should remain unchanged
    expect(result.issuer).toEqual(baseCertData.issuer);
    expect(result.date_received).toEqual(baseCertData.date_received);
    expect(result.description).toEqual(baseCertData.description);
    expect(result.type).toEqual('certification');
    expect(result.credential_url).toEqual(baseCertData.credential_url);
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should update nullable fields to null', async () => {
    // Create initial award with all fields
    const created = await createTestAwardCertification(baseAwardData);

    // Update nullable fields to null
    const updateInput: UpdateAwardCertificationInput = {
      id: created.id,
      description: null,
      expiry_date: null,
      credential_url: null
    };

    const result = await updateAwardCertification(updateInput);

    // Verify nullable fields are set to null
    expect(result.description).toBeNull();
    expect(result.expiry_date).toBeNull();
    expect(result.credential_url).toBeNull();
    
    // Other fields should remain unchanged
    expect(result.title).toEqual(baseAwardData.title);
    expect(result.issuer).toEqual(baseAwardData.issuer);
    expect(result.type).toEqual(baseAwardData.type);
  });

  it('should update the record in database', async () => {
    // Create initial award
    const created = await createTestAwardCertification(baseAwardData);

    // Update the award
    const updateInput: UpdateAwardCertificationInput = {
      id: created.id,
      title: 'Updated Award Title',
      issuer: 'New Issuer Organization'
    };

    await updateAwardCertification(updateInput);

    // Verify database record was updated
    const dbRecord = await db.select()
      .from(awardsCertificationsTable)
      .where(eq(awardsCertificationsTable.id, created.id))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].title).toEqual('Updated Award Title');
    expect(dbRecord[0].issuer).toEqual('New Issuer Organization');
    expect(dbRecord[0].updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
  });

  it('should throw error for non-existent award/certification', async () => {
    const updateInput: UpdateAwardCertificationInput = {
      id: 99999,
      title: 'Non-existent Award'
    };

    await expect(updateAwardCertification(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle updates with only updated_at change', async () => {
    // Create initial award
    const created = await createTestAwardCertification(baseAwardData);

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1));

    // Update with minimal input (only ID provided)
    const updateInput: UpdateAwardCertificationInput = {
      id: created.id
    };

    const result = await updateAwardCertification(updateInput);

    // Verify updated_at was changed even with no field updates
    expect(result.updated_at.getTime()).toBeGreaterThan(created.updated_at.getTime());
    
    // All other fields should remain the same
    expect(result.title).toEqual(created.title);
    expect(result.issuer).toEqual(created.issuer);
    expect(result.date_received).toEqual(created.date_received);
    expect(result.description).toEqual(created.description);
    expect(result.type).toEqual(created.type);
    expect(result.expiry_date).toEqual(created.expiry_date);
    expect(result.credential_url).toEqual(created.credential_url);
    expect(result.created_at).toEqual(created.created_at);
  });

  it('should handle date field updates correctly', async () => {
    // Create initial certification
    const created = await createTestAwardCertification(baseCertData);

    // Update date fields
    const newDateReceived = new Date('2023-08-15');
    const newExpiryDate = new Date('2028-08-15');
    
    const updateInput: UpdateAwardCertificationInput = {
      id: created.id,
      date_received: newDateReceived,
      expiry_date: newExpiryDate
    };

    const result = await updateAwardCertification(updateInput);

    // Verify date updates
    expect(result.date_received).toEqual(newDateReceived);
    expect(result.expiry_date).toEqual(newExpiryDate);
    expect(result.date_received).toBeInstanceOf(Date);
    expect(result.expiry_date).toBeInstanceOf(Date);
  });
});