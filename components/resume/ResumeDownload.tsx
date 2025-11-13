"use client";

import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { useMemo, useState } from 'react';
import { generateResumeText, ResumeData, ResumeMode } from '@/lib/resume';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface ResumeDownloadProps {
  resumeData: ResumeData;
}

const modes: Array<{ id: ResumeMode; label: string; description: string }> = [
  { id: 'concise', label: 'Concise (1 Page)', description: 'Highlights recent experience and core strengths.' },
  { id: 'detailed', label: 'Detailed', description: 'Full experience history with extended context.' },
];

export function ResumeDownload({ resumeData }: ResumeDownloadProps) {
  const { play: playClick } = useSound('click');
  const { play: playSuccess } = useSound('success');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<ResumeMode>('concise');

  const displayExperience = useMemo(() => {
    const trimmed = resumeData.experience.map((exp) => ({
      ...exp,
      description: mode === 'concise' ? exp.description.slice(0, 3) : exp.description,
    }));
    return mode === 'concise' ? trimmed.slice(0, 3) : trimmed;
  }, [resumeData.experience, mode]);

  const displayProjects = useMemo(() => {
    const projects = mode === 'concise'
      ? resumeData.projects.filter((proj) => proj.featured).slice(0, 2)
      : resumeData.projects;
    return projects;
  }, [resumeData.projects, mode]);

  const handleDownload = async () => {
    playClick();
    setIsGenerating(true);

    try {
      const resumeText = generateResumeText(resumeData, { mode });
      const blob = new Blob([resumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MonyDragon_Resume_${mode}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      playSuccess();
    } catch (error) {
      console.error('Error generating resume:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const lastUpdatedLabel = useMemo(() => {
    const formatted = new Date(resumeData.lastUpdated).toLocaleDateString();
    return formatted;
  }, [resumeData.lastUpdated]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Living Resume
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Auto-generated from the experience and projects displayed on this portfolio. Choose the format you need, preview instantly, and download a ready-to-share copy.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last synchronized: {lastUpdatedLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {modes.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                playClick();
                setMode(option.id);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                mode === option.id
                  ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-100/10">
          <div className="border-b border-gray-200 bg-gray-50 px-8 py-6 dark:border-gray-700 dark:bg-gray-900/40">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">{resumeData.personal.name}</h4>
                <p className="text-sm uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">
                  {resumeData.personal.title}
                </p>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300 md:mt-0 md:text-right">
                <p>{resumeData.personal.email}</p>
                <p>{resumeData.personal.website}</p>
                {resumeData.personal.location && <p>{resumeData.personal.location}</p>}
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6 text-gray-700 dark:text-gray-200">
            <section>
              <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Professional Summary
              </h5>
              <p className="mt-2 leading-relaxed text-sm md:text-base">
                {resumeData.personal.summary}
              </p>
            </section>

            <section>
              <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Core Skills
              </h5>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <ResumeChipGroup title="Languages & Frameworks" items={[...resumeData.skills.languages, ...resumeData.skills.frameworks]} />
                <ResumeChipGroup title="Tools & Platforms" items={resumeData.skills.tools} />
                <ResumeChipGroup title="AI & ML" items={resumeData.skills.ai} />
              </div>
            </section>

            <section>
              <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Experience
              </h5>
              <div className="mt-3 space-y-6">
                {displayExperience.map((exp) => (
                  <div key={`${exp.company}-${exp.startDate}`} className="space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {exp.title} · {exp.company}
                        </p>
                        {exp.location && (
                          <p className="text-xs uppercase tracking-wide text-blue-500 dark:text-blue-300">
                            {exp.location}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 md:text-right">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                      </p>
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {exp.description.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {exp.technologies && exp.technologies.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Tech:</span> {exp.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {displayProjects.length > 0 && (
              <section>
                <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Project Highlights
                </h5>
                <div className="mt-3 space-y-4">
                  {displayProjects.map((project) => (
                    <div key={project.name} className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {project.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Tech:</span> {project.technologies.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 shadow-inner dark:border-gray-700 dark:from-blue-950/40 dark:via-purple-950/30 dark:to-pink-950/20">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Export Options
            </h4>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Download a {mode === 'concise' ? 'single-page' : 'detailed multi-page'} resume snapshot or view your living document in Google Docs for manual edits.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <AnimatedButton
                onClick={handleDownload}
                variant="primary"
                className="justify-center"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating…' : `Download ${mode === 'concise' ? 'Concise' : 'Detailed'} Resume`}
              </AnimatedButton>

              <AnimatedButton
                href="https://docs.google.com/document/d/1QlelG4Gq3aAMV7g0RUOsBeacYVapZ9Hg/"
                hrefTarget="_blank"
                hrefRel="noopener noreferrer"
                variant="secondary"
                className="justify-center"
              >
                Open in Google Docs
              </AnimatedButton>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: Save as PDF from your browser or Google Docs for a polished handoff.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <p>
              • “Concise” mode trims experience bullets and focuses on recent roles to support 1-page resumes.
            </p>
            <p className="mt-2">
              • “Detailed” mode includes the full work history and additional project context for comprehensive submissions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ResumeChipGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

