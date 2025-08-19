import { db } from '../db';
import { awardsCertificationsTable } from '../db/schema';
import { type UpdateAwardCertificationInput, type AwardCertification } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAwardCertification = async (input: UpdateAwardCertificationInput): Promise<AwardCertification> => {
  try {
    // Build update object with only provided fields using bracket notation
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData['title'] = input.title;
    }
    if (input.issuer !== undefined) {
      updateData['issuer'] = input.issuer;
    }
    if (input.date_received !== undefined) {
      updateData['date_received'] = input.date_received;
    }
    if (input.description !== undefined) {
      updateData['description'] = input.description;
    }
    if (input.type !== undefined) {
      updateData['type'] = input.type;
    }
    if (input.expiry_date !== undefined) {
      updateData['expiry_date'] = input.expiry_date;
    }
    if (input.credential_url !== undefined) {
      updateData['credential_url'] = input.credential_url;
    }

    // Update the record
    const result = await db.update(awardsCertificationsTable)
      .set(updateData)
      .where(eq(awardsCertificationsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Award/Certification with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Award/Certification update failed:', error);
    throw error;
  }
};