import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type AwardCertification } from '../schema';
import { desc } from 'drizzle-orm';

export const getAwardsCertifications = async (): Promise<AwardCertification[]> => {
  try {
    const results = await db.select()
      .from(awardsCertificationsTable)
      .orderBy(desc(awardsCertificationsTable.date_received))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch awards and certifications:', error);
    throw error;
  }
};