import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteAwardCertification = async (input: DeleteInput): Promise<void> => {
  try {
    // Delete the award/certification record
    await db.delete(awardsCertificationsTable)
      .where(eq(awardsCertificationsTable.id, input.id))
      .execute();
  } catch (error) {
    console.error('Award certification deletion failed:', error);
    throw error;
  }
};