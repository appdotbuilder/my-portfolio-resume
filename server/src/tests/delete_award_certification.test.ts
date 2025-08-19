import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { deleteAwardCertification } from '../handlers/delete_award_certification';
import { eq } from 'drizzle-orm';

describe('deleteAwardCertification', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an award certification by ID', async () => {
    // Create test award certification first
    const testRecord = await db.insert(awardsCertificationsTable)
      .values({
        title: 'Test Award',
        issuer: 'Test Organization',
        date_received: new Date('2023-06-15'),
        description: 'A test award for testing purposes',
        type: 'award',
        expiry_date: null,
        credential_url: 'https://example.com/credential'
      })
      .returning()
      .execute();

    const recordId = testRecord[0].id;

    // Verify record exists before deletion
    const beforeDelete = await db.select()
      .from(awardsCertificationsTable)
      .where(eq(awardsCertificationsTable.id, recordId))
      .execute();

    expect(beforeDelete).toHaveLength(1);

    // Delete the record
    const deleteInput: DeleteInput = { id: recordId };
    await deleteAwardCertification(deleteInput);

    // Verify record is deleted
    const afterDelete = await db.select()
      .from(awardsCertificationsTable)
      .where(eq(awardsCertificationsTable.id, recordId))
      .execute();

    expect(afterDelete).toHaveLength(0);
  });

  it('should delete a certification by ID', async () => {
    // Create test certification
    const testRecord = await db.insert(awardsCertificationsTable)
      .values({
        title: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        date_received: new Date('2023-03-01'),
        description: 'Cloud architecture certification',
        type: 'certification',
        expiry_date: new Date('2026-03-01'),
        credential_url: 'https://aws.amazon.com/verification'
      })
      .returning()
      .execute();

    const recordId = testRecord[0].id;

    // Delete the certification
    const deleteInput: DeleteInput = { id: recordId };
    await deleteAwardCertification(deleteInput);

    // Verify certification is deleted
    const result = await db.select()
      .from(awardsCertificationsTable)
      .where(eq(awardsCertificationsTable.id, recordId))
      .execute();

    expect(result).toHaveLength(0);
  });

  it('should handle deletion of non-existent record gracefully', async () => {
    // Try to delete a record that doesn't exist
    const deleteInput: DeleteInput = { id: 999999 };
    
    // Should not throw an error
    await expect(deleteAwardCertification(deleteInput)).resolves.toBeUndefined();
  });

  it('should not affect other records when deleting one', async () => {
    // Create multiple test records
    const records = await db.insert(awardsCertificationsTable)
      .values([
        {
          title: 'First Award',
          issuer: 'First Organization',
          date_received: new Date('2023-01-01'),
          description: 'First award description',
          type: 'award',
          expiry_date: null,
          credential_url: null
        },
        {
          title: 'Second Certification',
          issuer: 'Second Organization',
          date_received: new Date('2023-02-01'),
          description: 'Second certification description',
          type: 'certification',
          expiry_date: new Date('2026-02-01'),
          credential_url: 'https://example.com/cert2'
        },
        {
          title: 'Third Award',
          issuer: 'Third Organization',
          date_received: new Date('2023-03-01'),
          description: null,
          type: 'award',
          expiry_date: null,
          credential_url: null
        }
      ])
      .returning()
      .execute();

    // Delete the middle record
    const deleteInput: DeleteInput = { id: records[1].id };
    await deleteAwardCertification(deleteInput);

    // Verify only the targeted record is deleted
    const remainingRecords = await db.select()
      .from(awardsCertificationsTable)
      .execute();

    expect(remainingRecords).toHaveLength(2);
    
    // Verify the correct records remain
    const remainingIds = remainingRecords.map(record => record.id);
    expect(remainingIds).toContain(records[0].id);
    expect(remainingIds).toContain(records[2].id);
    expect(remainingIds).not.toContain(records[1].id);
    
    // Verify the remaining records' content
    expect(remainingRecords.some(r => r.title === 'First Award')).toBe(true);
    expect(remainingRecords.some(r => r.title === 'Third Award')).toBe(true);
    expect(remainingRecords.some(r => r.title === 'Second Certification')).toBe(false);
  });

  it('should delete records with minimal required fields', async () => {
    // Create record with only required fields
    const testRecord = await db.insert(awardsCertificationsTable)
      .values({
        title: 'Minimal Award',
        issuer: 'Minimal Issuer',
        date_received: new Date('2023-05-01'),
        description: null,
        type: 'award',
        expiry_date: null,
        credential_url: null
      })
      .returning()
      .execute();

    const recordId = testRecord[0].id;

    // Delete the record
    const deleteInput: DeleteInput = { id: recordId };
    await deleteAwardCertification(deleteInput);

    // Verify record is deleted
    const result = await db.select()
      .from(awardsCertificationsTable)
      .where(eq(awardsCertificationsTable.id, recordId))
      .execute();

    expect(result).toHaveLength(0);
  });
});