import { z } from 'zod';

// Personal information schema
export const personalInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  linkedin_url: z.string().url().nullable(),
  github_url: z.string().url().nullable(),
  professional_summary: z.string(),
  photo_url: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// Input schema for creating/updating personal info
export const updatePersonalInfoInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  linkedin_url: z.string().url().nullable(),
  github_url: z.string().url().nullable(),
  professional_summary: z.string(),
  photo_url: z.string().url().nullable()
});

export type UpdatePersonalInfoInput = z.infer<typeof updatePersonalInfoInputSchema>;

// Work experience schema
export const workExperienceSchema = z.object({
  id: z.number(),
  company: z.string(),
  title: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  responsibilities: z.string(),
  is_current: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type WorkExperience = z.infer<typeof workExperienceSchema>;

// Input schema for creating work experience
export const createWorkExperienceInputSchema = z.object({
  company: z.string(),
  title: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  responsibilities: z.string(),
  is_current: z.boolean().default(false)
});

export type CreateWorkExperienceInput = z.infer<typeof createWorkExperienceInputSchema>;

// Input schema for updating work experience
export const updateWorkExperienceInputSchema = z.object({
  id: z.number(),
  company: z.string().optional(),
  title: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().nullable().optional(),
  responsibilities: z.string().optional(),
  is_current: z.boolean().optional()
});

export type UpdateWorkExperienceInput = z.infer<typeof updateWorkExperienceInputSchema>;

// Education schema
export const educationSchema = z.object({
  id: z.number(),
  degree: z.string(),
  major: z.string(),
  institution: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  gpa: z.number().nullable(),
  is_current: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Education = z.infer<typeof educationSchema>;

// Input schema for creating education
export const createEducationInputSchema = z.object({
  degree: z.string(),
  major: z.string(),
  institution: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  gpa: z.number().nullable(),
  is_current: z.boolean().default(false)
});

export type CreateEducationInput = z.infer<typeof createEducationInputSchema>;

// Input schema for updating education
export const updateEducationInputSchema = z.object({
  id: z.number(),
  degree: z.string().optional(),
  major: z.string().optional(),
  institution: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().nullable().optional(),
  gpa: z.number().nullable().optional(),
  is_current: z.boolean().optional()
});

export type UpdateEducationInput = z.infer<typeof updateEducationInputSchema>;

// Skills schema
export const skillSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.enum(['technical', 'soft']),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Skill = z.infer<typeof skillSchema>;

// Input schema for creating skills
export const createSkillInputSchema = z.object({
  name: z.string(),
  category: z.enum(['technical', 'soft']),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).nullable()
});

export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;

// Input schema for updating skills
export const updateSkillInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  category: z.enum(['technical', 'soft']).optional(),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).nullable().optional()
});

export type UpdateSkillInput = z.infer<typeof updateSkillInputSchema>;

// Awards and certifications schema
export const awardCertificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  issuer: z.string(),
  date_received: z.coerce.date(),
  description: z.string().nullable(),
  type: z.enum(['award', 'certification']),
  expiry_date: z.coerce.date().nullable(),
  credential_url: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type AwardCertification = z.infer<typeof awardCertificationSchema>;

// Input schema for creating awards/certifications
export const createAwardCertificationInputSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  date_received: z.coerce.date(),
  description: z.string().nullable(),
  type: z.enum(['award', 'certification']),
  expiry_date: z.coerce.date().nullable(),
  credential_url: z.string().url().nullable()
});

export type CreateAwardCertificationInput = z.infer<typeof createAwardCertificationInputSchema>;

// Input schema for updating awards/certifications
export const updateAwardCertificationInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  issuer: z.string().optional(),
  date_received: z.coerce.date().optional(),
  description: z.string().nullable().optional(),
  type: z.enum(['award', 'certification']).optional(),
  expiry_date: z.coerce.date().nullable().optional(),
  credential_url: z.string().url().nullable().optional()
});

export type UpdateAwardCertificationInput = z.infer<typeof updateAwardCertificationInputSchema>;

// Portfolio projects schema
export const portfolioProjectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image_url: z.string().url().nullable(),
  demo_url: z.string().url().nullable(),
  github_url: z.string().url().nullable(),
  technologies: z.string(), // JSON string of technologies array
  display_order: z.number().int(),
  is_featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type PortfolioProject = z.infer<typeof portfolioProjectSchema>;

// Input schema for creating portfolio projects
export const createPortfolioProjectInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  image_url: z.string().url().nullable(),
  demo_url: z.string().url().nullable(),
  github_url: z.string().url().nullable(),
  technologies: z.array(z.string()).default([]), // Will be converted to JSON string
  display_order: z.number().int().optional(),
  is_featured: z.boolean().default(false)
});

export type CreatePortfolioProjectInput = z.infer<typeof createPortfolioProjectInputSchema>;

// Input schema for updating portfolio projects
export const updatePortfolioProjectInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url().nullable().optional(),
  demo_url: z.string().url().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  technologies: z.array(z.string()).optional(), // Will be converted to JSON string
  display_order: z.number().int().optional(),
  is_featured: z.boolean().optional()
});

export type UpdatePortfolioProjectInput = z.infer<typeof updatePortfolioProjectInputSchema>;

// Contact form submission schema
export const contactFormSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  subject: z.string().nullable(),
  message: z.string(),
  submitted_at: z.coerce.date()
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// Input schema for contact form submission
export const createContactFormInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string().nullable(),
  message: z.string()
});

export type CreateContactFormInput = z.infer<typeof createContactFormInputSchema>;

// Delete input schema (for entities with ID)
export const deleteInputSchema = z.object({
  id: z.number()
});

export type DeleteInput = z.infer<typeof deleteInputSchema>;