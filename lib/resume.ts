// Living Resume System - Auto-updates from site content

export interface ResumeData {
  personal: {
    name: string;
    title: string;
    email: string;
    website: string;
    location?: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string[];
    technologies?: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    githubUrl?: string;
    featured: boolean;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    ai: string[];
  };
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    year: string;
  }>;
  lastUpdated: string;
}

// Default resume data - will be enhanced with auto-updates from site
export const defaultResumeData: ResumeData = {
  personal: {
    name: "Mony Dragon",
    title: "AI-First Developer & Architect",
    email: "monydragon@hotmail.com",
    website: "https://monydragon.com",
    summary: "Experienced software developer transitioning to AI-first workflows. Passionate about architecture, modern web technologies, and creating intelligent, scalable systems."
  },
  experience: [
    {
      title: "Software Developer",
      company: "Various Projects",
      startDate: "2020",
      current: true,
      description: [
        "Developing modern web applications using TypeScript, React, and Next.js",
        "Building scalable architectures with focus on AI integration",
        "Creating interactive experiences and web games"
      ],
      technologies: ["TypeScript", "JavaScript", "C#", ".NET", "Next.js", "React"]
    }
  ],
  projects: [],
  skills: {
    languages: ["TypeScript", "JavaScript", "C#", "Python"],
    frameworks: ["Next.js", "React", ".NET", "Node.js"],
    tools: ["Git", "MongoDB", "PostgreSQL", "Docker"],
    ai: ["AI Integration Patterns", "LLM APIs", "Vector Databases"]
  },
  education: [],
  lastUpdated: "2025-01-27T00:00:00.000Z"
};

// Generate PDF-ready resume text
export function generateResumeText(data: ResumeData): string {
  let resume = `\n${data.personal.name.toUpperCase()}\n`;
  resume += `${data.personal.title}\n\n`;
  resume += `Email: ${data.personal.email}\n`;
  resume += `Website: ${data.personal.website}\n`;
  if (data.personal.location) {
    resume += `Location: ${data.personal.location}\n`;
  }
  resume += `\n${'='.repeat(60)}\n\n`;
  
  resume += `SUMMARY\n`;
  resume += `${'-'.repeat(60)}\n`;
  resume += `${data.personal.summary}\n\n`;
  
  resume += `EXPERIENCE\n`;
  resume += `${'-'.repeat(60)}\n`;
  data.experience.forEach(exp => {
    resume += `\n${exp.title} | ${exp.company}`;
    if (exp.location) resume += ` | ${exp.location}`;
    resume += `\n${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'Present'}\n`;
    exp.description.forEach(desc => {
      resume += `• ${desc}\n`;
    });
    if (exp.technologies && exp.technologies.length > 0) {
      resume += `Technologies: ${exp.technologies.join(', ')}\n`;
    }
    resume += `\n`;
  });
  
  resume += `PROJECTS\n`;
  resume += `${'-'.repeat(60)}\n`;
  data.projects.forEach(project => {
    resume += `\n${project.name}\n`;
    resume += `${project.description}\n`;
    resume += `Technologies: ${project.technologies.join(', ')}\n`;
    if (project.url) resume += `Live: ${project.url}\n`;
    if (project.githubUrl) resume += `GitHub: ${project.githubUrl}\n`;
    resume += `\n`;
  });
  
  resume += `SKILLS\n`;
  resume += `${'-'.repeat(60)}\n`;
  resume += `Languages: ${data.skills.languages.join(', ')}\n`;
  resume += `Frameworks: ${data.skills.frameworks.join(', ')}\n`;
  resume += `Tools: ${data.skills.tools.join(', ')}\n`;
  resume += `AI & ML: ${data.skills.ai.join(', ')}\n\n`;
  
  if (data.education.length > 0) {
    resume += `EDUCATION\n`;
    resume += `${'-'.repeat(60)}\n`;
    data.education.forEach(edu => {
      resume += `\n${edu.degree}\n`;
      resume += `${edu.institution}`;
      if (edu.location) resume += ` | ${edu.location}`;
      resume += `\n${edu.year}\n`;
    });
  }
  
  resume += `\n${'='.repeat(60)}\n`;
  resume += `Last Updated: ${new Date(data.lastUpdated).toLocaleDateString()}\n`;
  
  return resume;
}

// Update resume from site data (projects, etc.)
export function updateResumeFromSite(
  currentResume: ResumeData,
  siteData: {
    projects?: Array<{
      title: string;
      description: string;
      technologies: string[];
      githubUrl?: string;
      liveUrl?: string;
      featured: boolean;
    }>;
    experience?: ResumeData['experience'];
  }
): ResumeData {
  const updated = { ...currentResume };
  
  // Update projects from site
  if (siteData.projects) {
    updated.projects = siteData.projects.map(proj => ({
      name: proj.title,
      description: proj.description,
      technologies: proj.technologies,
      url: proj.liveUrl,
      githubUrl: proj.githubUrl,
      featured: proj.featured
    }));
  }
  
  // Update experience if provided
  if (siteData.experience) {
    updated.experience = siteData.experience;
  }
  
  // Update last updated timestamp
  updated.lastUpdated = new Date().toISOString();
  
  return updated;
}

