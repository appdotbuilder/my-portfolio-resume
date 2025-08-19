import { serial, text, pgTable, timestamp, boolean, integer, real, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const skillCategoryEnum = pgEnum('skill_category', ['technical', 'soft']);
export const proficiencyLevelEnum = pgEnum('proficiency_level', ['beginner', 'intermediate', 'advanced', 'expert']);
export const awardCertificationTypeEnum = pgEnum('award_certification_type', ['award', 'certification']);

// Personal information table
export const personalInfoTable = pgTable('personal_info', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'), // Nullable by default
  linkedin_url: text('linkedin_url'),
  github_url: text('github_url'),
  professional_summary: text('professional_summary').notNull(),
  photo_url: text('photo_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Work experience table
export const workExperienceTable = pgTable('work_experience', {
  id: serial('id').primaryKey(),
  company: text('company').notNull(),
  title: text('title').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date'), // Nullable for current positions
  responsibilities: text('responsibilities').notNull(),
  is_current: boolean('is_current').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Education table
export const educationTable = pgTable('education', {
  id: serial('id').primaryKey(),
  degree: text('degree').notNull(),
  major: text('major').notNull(),
  institution: text('institution').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date'), // Nullable for current studies
  gpa: real('gpa'), // Nullable, use real for decimal numbers
  is_current: boolean('is_current').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Skills table
export const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: skillCategoryEnum('category').notNull(),
  proficiency_level: proficiencyLevelEnum('proficiency_level'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Awards and certifications table
export const awardsCertificationsTable = pgTable('awards_certifications', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  issuer: text('issuer').notNull(),
  date_received: timestamp('date_received').notNull(),
  description: text('description'), // Nullable
  type: awardCertificationTypeEnum('type').notNull(),
  expiry_date: timestamp('expiry_date'), // Nullable
  credential_url: text('credential_url'), // Nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Portfolio projects table
export const portfolioProjectsTable = pgTable('portfolio_projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url'), // Nullable placeholder for project image
  demo_url: text('demo_url'), // Nullable link to live demo
  github_url: text('github_url'), // Nullable link to GitHub repository
  technologies: text('technologies').notNull(), // JSON string of technologies array
  display_order: integer('display_order').default(0).notNull(),
  is_featured: boolean('is_featured').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Contact form submissions table
export const contactFormTable = pgTable('contact_form', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'), // Nullable
  message: text('message').notNull(),
  submitted_at: timestamp('submitted_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type PersonalInfo = typeof personalInfoTable.$inferSelect;
export type NewPersonalInfo = typeof personalInfoTable.$inferInsert;

export type WorkExperience = typeof workExperienceTable.$inferSelect;
export type NewWorkExperience = typeof workExperienceTable.$inferInsert;

export type Education = typeof educationTable.$inferSelect;
export type NewEducation = typeof educationTable.$inferInsert;

export type Skill = typeof skillsTable.$inferSelect;
export type NewSkill = typeof skillsTable.$inferInsert;

export type AwardCertification = typeof awardsCertificationsTable.$inferSelect;
export type NewAwardCertification = typeof awardsCertificationsTable.$inferInsert;

export type PortfolioProject = typeof portfolioProjectsTable.$inferSelect;
export type NewPortfolioProject = typeof portfolioProjectsTable.$inferInsert;

export type ContactForm = typeof contactFormTable.$inferSelect;
export type NewContactForm = typeof contactFormTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  personalInfo: personalInfoTable,
  workExperience: workExperienceTable,
  education: educationTable,
  skills: skillsTable,
  awardsCertifications: awardsCertificationsTable,
  portfolioProjects: portfolioProjectsTable,
  contactForm: contactFormTable,
};