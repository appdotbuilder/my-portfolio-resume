import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContactForm } from '@/components/ContactForm';
import { MobileNav } from '@/components/MobileNav';
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  ExternalLink, 
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Briefcase,
  User,
  FolderOpen,
  MessageSquare
} from 'lucide-react';
// Using type-only imports for better TypeScript compliance
import type { 
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  AwardCertification,
  PortfolioProject 
} from '../../server/src/schema';

function App() {
  // State management with proper typing
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [awards, setAwards] = useState<AwardCertification[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on component mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        personalInfoResult,
        workExperienceResult,
        educationResult,
        skillsResult,
        awardsResult,
        projectsResult
      ] = await Promise.all([
        trpc.getPersonalInfo.query(),
        trpc.getWorkExperience.query(),
        trpc.getEducation.query(),
        trpc.getSkills.query(),
        trpc.getAwardsCertifications.query(),
        trpc.getPortfolioProjects.query()
      ]);

      setPersonalInfo(personalInfoResult);
      setWorkExperience(workExperienceResult);
      setEducation(educationResult);
      setSkills(skillsResult);
      setAwards(awardsResult);
      setProjects(projectsResult);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Scroll-based active section detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'resume', 'portfolio', 'contact'];
      const scrollPosition = window.scrollY + 100; // Offset for header

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: User },
    { id: 'resume', label: 'Resume', icon: Briefcase },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
    { id: 'contact', label: 'Contact', icon: MessageSquare }
  ];

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Present';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Portfolio</h2>
          <p className="text-gray-600">Preparing your professional showcase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {personalInfo?.name || 'Professional Portfolio'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <MobileNav 
                navItems={navItems} 
                activeSection={activeSection} 
                onNavigate={scrollToSection} 
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Home/About Section */}
        <section id="home" className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              <div className="animate-fade-in">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 shadow-xl ring-4 ring-white/50">
                  <AvatarImage 
                    src={personalInfo?.photo_url || ''} 
                    alt={personalInfo?.name || 'Profile'} 
                  />
                  <AvatarFallback className="text-3xl md:text-4xl bg-blue-100 text-blue-700">
                    {personalInfo?.name?.split(' ').map(n => n[0]).join('') || '👨‍💻'}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  {personalInfo?.name || 'Your Professional Name'}
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                  {personalInfo?.professional_summary || 
                   '👋 Welcome to my professional portfolio. I\'m passionate about creating innovative solutions and delivering exceptional results.'}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Mail className="w-5 h-5" />
                  Get In Touch
                </button>
                
                {personalInfo?.linkedin_url && (
                  <a
                    href={personalInfo.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                )}

                {personalInfo?.github_url && (
                  <a
                    href={personalInfo.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                )}
              </div>
              
              {/* Scroll indicator */}
              <div className="mt-16 animate-bounce">
                <button
                  onClick={() => scrollToSection('resume')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Scroll to resume section"
                >
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section id="resume" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Resume
              </h2>
              <p className="text-xl text-gray-600">
                My professional journey and qualifications
              </p>
            </div>

            {/* Contact Information */}
            {personalInfo && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${personalInfo.email}`} className="text-blue-600 hover:underline">
                        {personalInfo.email}
                      </a>
                    </div>
                    
                    {personalInfo.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${personalInfo.phone}`} className="text-blue-600 hover:underline">
                          {personalInfo.phone}
                        </a>
                      </div>
                    )}

                    {personalInfo.linkedin_url && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-gray-500" />
                        <a 
                          href={personalInfo.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}

                    {personalInfo.github_url && (
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-gray-500" />
                        <a 
                          href={personalInfo.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          GitHub Profile
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Work Experience */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Work Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workExperience.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">No work experience data available</p>
                        <p className="text-gray-400 text-sm">Work history will be displayed here once added to the database.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {workExperience.map((work: WorkExperience) => (
                          <div key={work.id} className="border-l-2 border-blue-200 pl-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{work.title}</h3>
                                <p className="text-blue-600 font-medium">{work.company}</p>
                              </div>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(work.start_date)} - {formatDate(work.end_date)}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {work.responsibilities}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {skills.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🛠️</span>
                        </div>
                        <p className="text-gray-500 mb-1">No skills data available</p>
                        <p className="text-gray-400 text-sm">Technical and soft skills will be displayed here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {['technical', 'soft'].map((category) => {
                          const categorySkills = skills.filter((skill: Skill) => skill.category === category);
                          if (categorySkills.length === 0) return null;
                          
                          return (
                            <div key={category}>
                              <h4 className="font-medium text-gray-900 mb-2 capitalize">
                                {category} Skills
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {categorySkills.map((skill: Skill) => (
                                  <Badge key={skill.id} variant="secondary">
                                    {skill.name}
                                    {skill.proficiency_level && (
                                      <span className="ml-1 text-xs opacity-75">
                                        ({skill.proficiency_level})
                                      </span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Education & Awards */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {education.length === 0 ? (
                      <div className="text-center py-8">
                        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">No education data available</p>
                        <p className="text-gray-400 text-sm">Educational background will be displayed here once added.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {education.map((edu: Education) => (
                          <div key={edu.id} className="border-l-2 border-green-200 pl-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{edu.degree}</h3>
                                <p className="text-green-600 font-medium">{edu.major}</p>
                                <p className="text-gray-600 text-sm">{edu.institution}</p>
                              </div>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                              </Badge>
                            </div>
                            {edu.gpa && (
                              <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Awards & Certifications */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Awards & Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {awards.length === 0 ? (
                      <div className="text-center py-6">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">No awards or certifications available</p>
                        <p className="text-gray-400 text-sm">Professional achievements will be displayed here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {awards.map((award: AwardCertification) => (
                          <div key={award.id} className="border-l-2 border-yellow-200 pl-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{award.title}</h3>
                                <p className="text-yellow-600 font-medium">{award.issuer}</p>
                                {award.description && (
                                  <p className="text-gray-600 text-sm mt-1">{award.description}</p>
                                )}
                              </div>
                              <Badge 
                                variant={award.type === 'award' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {award.type}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{formatDate(award.date_received)}</span>
                              {award.credential_url && (
                                <a
                                  href={award.credential_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Credential
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Portfolio
              </h2>
              <p className="text-xl text-gray-600">
                Showcasing my recent projects and work
              </p>
            </div>

            {projects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No portfolio projects available</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Projects will be displayed here once they are added to the database.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project: PortfolioProject) => (
                  <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                          <FolderOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {project.is_featured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {project.technologies && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(project.technologies).map((tech: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        {project.demo_url && (
                          <Button asChild variant="default" size="sm">
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                        
                        {project.github_url && (
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1"
                            >
                              <Github className="w-3 h-3" />
                              Code
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get In Touch
              </h2>
              <p className="text-xl text-gray-600">
                I'd love to hear from you. Send me a message!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  {personalInfo?.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a 
                          href={`mailto:${personalInfo.email}`}
                          className="text-gray-900 hover:text-blue-600"
                        >
                          {personalInfo.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {personalInfo?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a 
                          href={`tel:${personalInfo.phone}`}
                          className="text-gray-900 hover:text-green-600"
                        >
                          {personalInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {personalInfo?.linkedin_url && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Linkedin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">LinkedIn</p>
                        <a 
                          href={personalInfo.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-blue-600"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    </div>
                  )}

                  {personalInfo?.github_url && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Github className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">GitHub</p>
                        <a 
                          href={personalInfo.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 hover:text-gray-700"
                        >
                          GitHub Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Send a Message
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {personalInfo?.name || 'Professional Portfolio'}. 
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;