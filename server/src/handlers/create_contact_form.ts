import { db } from '../db';
import { contactFormTable } from '../db/schema';
import { type CreateContactFormInput, type ContactForm } from '../schema';

export const createContactForm = async (input: CreateContactFormInput): Promise<ContactForm> => {
  try {
    // Insert contact form submission record
    const result = await db.insert(contactFormTable)
      .values({
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message
      })
      .returning()
      .execute();

    // Return the created contact form submission
    const contactForm = result[0];
    return {
      ...contactForm,
      // No numeric conversions needed for this table
    };
  } catch (error) {
    console.error('Contact form submission failed:', error);
    throw error;
  }
};