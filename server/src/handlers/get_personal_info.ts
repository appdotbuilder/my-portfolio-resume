import { db } from '../db';
import { personalInfoTable } from '../db/schema';
import { type PersonalInfo } from '../schema';

export const getPersonalInfo = async (): Promise<PersonalInfo | null> => {
  try {
    // Fetch the first personal info record (there should only be one)
    const results = await db.select()
      .from(personalInfoTable)
      .limit(1)
      .execute();

    // Return null if no record exists
    if (results.length === 0) {
      return null;
    }

    // Return the first (and should be only) personal info record
    return results[0];
  } catch (error) {
    console.error('Failed to fetch personal info:', error);
    throw error;
  }
};