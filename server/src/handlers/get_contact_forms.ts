import { db } from '../db';
import { contactFormTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type ContactForm } from '../schema';

export const getContactForms = async (): Promise<ContactForm[]> => {
  try {
    // Fetch all contact form submissions ordered by submitted_at descending (most recent first)
    const results = await db.select()
      .from(contactFormTable)
      .orderBy(desc(contactFormTable.submitted_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get contact forms:', error);
    throw error;
  }
};