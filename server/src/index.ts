import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  updatePersonalInfoInputSchema,
  createWorkExperienceInputSchema,
  updateWorkExperienceInputSchema,
  deleteInputSchema,
  createEducationInputSchema,
  updateEducationInputSchema,
  createSkillInputSchema,
  updateSkillInputSchema,
  createAwardCertificationInputSchema,
  updateAwardCertificationInputSchema,
  createPortfolioProjectInputSchema,
  updatePortfolioProjectInputSchema,
  createContactFormInputSchema
} from './schema';

// Import handlers
import { getPersonalInfo } from './handlers/get_personal_info';
import { updatePersonalInfo } from './handlers/update_personal_info';
import { getWorkExperience } from './handlers/get_work_experience';
import { createWorkExperience } from './handlers/create_work_experience';
import { updateWorkExperience } from './handlers/update_work_experience';
import { deleteWorkExperience } from './handlers/delete_work_experience';
import { getEducation } from './handlers/get_education';
import { createEducation } from './handlers/create_education';
import { updateEducation } from './handlers/update_education';
import { deleteEducation } from './handlers/delete_education';
import { getSkills } from './handlers/get_skills';
import { createSkill } from './handlers/create_skill';
import { updateSkill } from './handlers/update_skill';
import { deleteSkill } from './handlers/delete_skill';
import { getAwardsCertifications } from './handlers/get_awards_certifications';
import { createAwardCertification } from './handlers/create_award_certification';
import { updateAwardCertification } from './handlers/update_award_certification';
import { deleteAwardCertification } from './handlers/delete_award_certification';
import { getPortfolioProjects } from './handlers/get_portfolio_projects';
import { createPortfolioProject } from './handlers/create_portfolio_project';
import { updatePortfolioProject } from './handlers/update_portfolio_project';
import { deletePortfolioProject } from './handlers/delete_portfolio_project';
import { getContactForms } from './handlers/get_contact_forms';
import { createContactForm } from './handlers/create_contact_form';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Personal Information routes
  getPersonalInfo: publicProcedure
    .query(() => getPersonalInfo()),
  updatePersonalInfo: publicProcedure
    .input(updatePersonalInfoInputSchema)
    .mutation(({ input }) => updatePersonalInfo(input)),

  // Work Experience routes
  getWorkExperience: publicProcedure
    .query(() => getWorkExperience()),
  createWorkExperience: publicProcedure
    .input(createWorkExperienceInputSchema)
    .mutation(({ input }) => createWorkExperience(input)),
  updateWorkExperience: publicProcedure
    .input(updateWorkExperienceInputSchema)
    .mutation(({ input }) => updateWorkExperience(input)),
  deleteWorkExperience: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteWorkExperience(input)),

  // Education routes
  getEducation: publicProcedure
    .query(() => getEducation()),
  createEducation: publicProcedure
    .input(createEducationInputSchema)
    .mutation(({ input }) => createEducation(input)),
  updateEducation: publicProcedure
    .input(updateEducationInputSchema)
    .mutation(({ input }) => updateEducation(input)),
  deleteEducation: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteEducation(input)),

  // Skills routes
  getSkills: publicProcedure
    .query(() => getSkills()),
  createSkill: publicProcedure
    .input(createSkillInputSchema)
    .mutation(({ input }) => createSkill(input)),
  updateSkill: publicProcedure
    .input(updateSkillInputSchema)
    .mutation(({ input }) => updateSkill(input)),
  deleteSkill: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteSkill(input)),

  // Awards and Certifications routes
  getAwardsCertifications: publicProcedure
    .query(() => getAwardsCertifications()),
  createAwardCertification: publicProcedure
    .input(createAwardCertificationInputSchema)
    .mutation(({ input }) => createAwardCertification(input)),
  updateAwardCertification: publicProcedure
    .input(updateAwardCertificationInputSchema)
    .mutation(({ input }) => updateAwardCertification(input)),
  deleteAwardCertification: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deleteAwardCertification(input)),

  // Portfolio Projects routes
  getPortfolioProjects: publicProcedure
    .query(() => getPortfolioProjects()),
  createPortfolioProject: publicProcedure
    .input(createPortfolioProjectInputSchema)
    .mutation(({ input }) => createPortfolioProject(input)),
  updatePortfolioProject: publicProcedure
    .input(updatePortfolioProjectInputSchema)
    .mutation(({ input }) => updatePortfolioProject(input)),
  deletePortfolioProject: publicProcedure
    .input(deleteInputSchema)
    .mutation(({ input }) => deletePortfolioProject(input)),

  // Contact Form routes
  getContactForms: publicProcedure
    .query(() => getContactForms()),
  createContactForm: publicProcedure
    .input(createContactFormInputSchema)
    .mutation(({ input }) => createContactForm(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();