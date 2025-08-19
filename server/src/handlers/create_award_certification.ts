import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type CreateAwardCertificationInput, type AwardCertification } from '../schema';

export const createAwardCertification = async (input: CreateAwardCertificationInput): Promise<AwardCertification> => {
  try {
    // Insert award/certification record
    const result = await db.insert(awardsCertificationsTable)
      .values({
        title: input.title,
        issuer: input.issuer,
        date_received: input.date_received,
        description: input.description,
        type: input.type,
        expiry_date: input.expiry_date,
        credential_url: input.credential_url
      })
      .returning()
      .execute();

    const awardCertification = result[0];
    return awardCertification;
  } catch (error) {
    console.error('Award/certification creation failed:', error);
    throw error;
  }
};