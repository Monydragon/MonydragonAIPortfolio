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
      title: "Software Engineering Director",
      company: "Dragon Lens Studios Inc.",
      startDate: "Mar 2014",
      current: true,
      description: [
        "Developed and designed Pixel Engine for Unity - an engine to redefine how Unity projects are created",
        "Created various systems for the engine with cross-platform support",
        "Designed the engine to be extensible and modular",
        "Developed and designed TBS - 2D Turn-based Battle System asset released on Unity Asset Store",
        "Created abilities, items, monsters, equipment and stats systems",
        "Designed modular architecture for battle system creation",
        "Developed and published multiple games (Lost Dreams, Luminous, The Afterlife, Oceans Call) for game jams",
        "Created core systems including Dialogue, Movement, Inventory, Items, and Puzzles",
        "Published and ported games to various platforms including Android and Web",
        "Collaborated with artists, composers, and developers using GitHub for version control"
      ],
      technologies: ["Jetbrains Rider", "C#", "Unity", "VS 2022", "GitHub"]
    },
    {
      title: "Software Developer / IT Support Specialist",
      company: "ProHome LLC",
      startDate: "Apr 2023",
      current: true,
      description: [
        "Developed and maintained ProHomeLive web application and Android/IOS application",
        "Added functionality to the web application",
        "Fixed bugs and maintained codebase",
        "Supported various clients and employees with IT technical support"
      ],
      technologies: ["C#", "Git", "DevOps", "Blazor", "Dot Net MAUI", "SendGrid", "Twilio", "Telerik"]
    },
    {
      title: "DevOps Engineer",
      company: "Lockheed Martin",
      startDate: "Nov 2022",
      endDate: "Feb 2023",
      current: false,
      description: [
        "Maintained and configured CI/CD pipelines for Unity projects and C# core projects",
        "Created Build Definitions for CI/CD Pipelines",
        "Structured Gitflow branching strategies",
        "Created applications for improving CI/CD processes"
      ],
      technologies: ["Unity", "C#", "AWS", "Git"]
    },
    {
      title: "Software Developer",
      company: "American Barcode and RFID",
      startDate: "Feb 2022",
      endDate: "Nov 2022",
      current: false,
      description: [
        "Developed RESTful APIs into microservices for Scanits project",
        "Worked with UI developer to develop application in Xamarin for Android",
        "Created and developed solutions for Scanit",
        "Wrote unit tests and documented code",
        "Wrote microservice APIs to handle transactions for authentication and persistence",
        "Implemented RabbitMQ and Maximo calls for message queues and containers"
      ],
      technologies: ["VS 2022", "C#", "MySQL", "Docker", "Xamarin", "RabbitMQ", "Maximo", "Azure DevOps"]
    },
    {
      title: "Software Developer",
      company: "Transplant Connect",
      startDate: "Sep 2021",
      endDate: "Feb 2022",
      current: false,
      description: [
        "Developed and maintained ITX-Transplant systems website for several clients",
        "Worked with international clients for transplant services",
        "Created and developed solutions for I-Transplant",
        "Debugged and fixed defects within the systems",
        "Completed user stories for each release cycle",
        "Scripted changes to SQL database for deployments"
      ],
      technologies: ["VS 2022", "C#", "MySQL", "Docker"]
    },
    {
      title: "Software Developer",
      company: "USIC",
      startDate: "Feb 2021",
      endDate: "Sep 2021",
      current: false,
      description: [
        "Developed and maintained Translore mapping application for field locators",
        "Worked on mapping capabilities similar to Google Maps for Desktop/Mobile",
        "Developed Legend for symbols for map view",
        "Created symbol viewer to show mapping symbols in the application",
        "Implemented Voice to text recording and Google voice to text features for Xamarin",
        "Designed and developed Xamarin and WPF UI and Backends",
        "Configured Docker, Postgres, and SQL servers to run locally"
      ],
      technologies: ["VS 2019", "C#", "MySQL", "Docker", "Xamarin", "WPF", "Postgres"]
    },
    {
      title: "Software Developer",
      company: "Microsoft (Insight Global)",
      startDate: "May 2020",
      endDate: "Sep 2020",
      current: false,
      description: [
        "Developed and maintained Windows Essential Applications (Calculator, Maps, Voice Recorder, Notepad, etc.)",
        "Worked with setting up Azure Pipelines and unit testing",
        "Created Azure Pipeline for Voice Recorder",
        "Updated Unit Tests for Pipeline runs",
        "Worked on Internal Tool to check repositories for inconsistencies"
      ],
      technologies: ["VS 2019", "Azure DevOps", "C#", "MySQL"]
    },
    {
      title: "Software Developer",
      company: "Mainstream Non Profit Solutions",
      startDate: "Nov 2019",
      endDate: "Aug 2020",
      current: false,
      description: [
        "Developed modifications and changes to Internal and external facing Websites / Web Apps",
        "Managed and handled ticket requests from users",
        "Made modifications to existing codebase for TFI Net and WebFaces",
        "Created and modified stored procedures for SQL Database",
        "Worked on completing development and user tickets",
        "Handled WEB API calls with JSON backing requests"
      ],
      technologies: ["VS 2017", "Azure DevOps", "VB", "MySQL"]
    },
    {
      title: "Senior Software Engineer",
      company: "Super Systems Inc. (MSA)",
      startDate: "Apr 2017",
      endDate: "Jun 2018",
      current: false,
      description: [
        "Designed and developed Azure/AWS Cloud Integration API / Webservice",
        "Created integration handling using Azure and AWS APIs connecting existing codebases to cloud infrastructure",
        "Created webservice wrapper to handle calls between AWS/Azure for internal products",
        "Developed custom APIs for integration",
        "Managed AZURE and AWS API handling using web service calls",
        "Created C# wrapper for connection management",
        "Managed AZURE cloud computing network virtual desktop",
        "Designed and developed Dosimetry Scanning Project desktop interface for scanning, validating and uploading documents",
        "Created application to folder scan, verify convention and format with batch processing for 10K+ files daily",
        "Designed for concurrent team usage with large batch handling",
        "Created desktop interface using C# and WPF/XAML",
        "Managed Oracle/SQL data bindings and data packages",
        "Setup custom database wrapper for SQL and Oracle using EF6",
        "Configured SOAP and Web Service calls for data packages",
        "Interfaced with OpenText through document control handling and Web Service APIs",
        "Designed and developed Document Control Web Application for uploading, merging and entering metadata",
        "Created web interface using C# and ASP.NET MVC pattern",
        "Designed and developed Web API Interface / AWS Cloud Interfacing library",
        "Created library to handle data and migration to/from AWS cloud services",
        "Wrote wrapper that could be placed into any compatible project"
      ],
      technologies: ["VS 2017", "TFS", "C#", "Web Services", "XAML", "MySQL", "Oracle", "SOAP", "WFS", "COTS (OpenText)", "AWS", "Azure", "MVC", "ASP.NET", "EF6", "WPF"]
    },
    {
      title: "IT & Software Director",
      company: "Specialty Fulfillment Center",
      startDate: "Oct 2016",
      endDate: "Apr 2017",
      current: false,
      description: [
        "Managed and operated all technical services for the company",
        "Handled networks, servers, and devices on site",
        "Managed SQL database administration for website and internal tools",
        "Optimized technical workflow and devices utilized by the company",
        "Directed improvements and modifications to computer/network infrastructure",
        "Maintained servers and client computers",
        "Managed website and software",
        "Handled order processing and general IT tasks",
        "Migrated servers to cloud infrastructure"
      ],
      technologies: ["VS 2017", "C#", "MySQL", "Windows", "Microsoft Office"]
    },
    {
      title: "Lead Software QA Engineer Tier 3",
      company: "Hewlett Packard (HP) Lionbridge",
      startDate: "Apr 2014",
      endDate: "Sep 2016",
      current: false,
      description: [
        "Worked with hardware engineers on enterprise class printers and other devices",
        "Supported direct support and troubleshooting for lab full of devices",
        "Maintained and updated printers and devices on site",
        "Troubleshot devices and installed software on computers and devices",
        "Setup automated testing"
      ],
      technologies: ["Windows 7", "Microsoft Office", "HP Software/Drivers"]
    },
    {
      title: "Lead Software QA Engineer Tier 3",
      company: "Microsoft (Lionbridge)",
      startDate: "Mar 2013",
      endDate: "Apr 2014",
      current: false,
      description: [
        "Helped direct and manage medium sized teams supporting Microsoft in Windows Store release and QA",
        "Installed and performed quality assurance for Windows Store apps",
        "Reviewed and led team of QA engineers and helped in validating audits"
      ],
      technologies: ["Windows 8", "Microsoft Office"]
    },
    {
      title: "Technical Support Supervisor",
      company: "WDS Global",
      startDate: "Feb 2012",
      endDate: "Sep 2012",
      current: false,
      description: [
        "Led large team of over 20 people with technical support for telecommunication support",
        "Supported Android/IOS/BlackBerry devices",
        "Coached and trained new team members on consistent basis",
        "Handled call escalations for technical and non-technical calls",
        "Led team of agents and handled one-on-ones and disciplinary actions"
      ],
      technologies: ["Windows 7", "Microsoft Office", "Call Recording Software"]
    },
    {
      title: "Technical Support",
      company: "Apple",
      startDate: "Oct 2011",
      endDate: "Jan 2012",
      current: false,
      description: [
        "Supported iOS, OSX, and AirPort devices as technical support representative",
        "Handled calls for technical and non-technical support",
        "Supported iOS, OSX, and Airport device calls and troubleshooting"
      ],
      technologies: ["Mac OS", "Call Recording Software", "iOS", "Airport"]
    },
    {
      title: "Customer Support Representative",
      company: "AT&T",
      startDate: "Nov 2010",
      endDate: "Oct 2011",
      current: false,
      description: [
        "Handled customer service calls for telecommunication devices",
        "Handled calls for technical and non-technical support",
        "Handled customer concerns for billing, technical issues and escalations"
      ],
      technologies: ["Windows 7", "Microsoft Office", "Call Recording Software"]
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

