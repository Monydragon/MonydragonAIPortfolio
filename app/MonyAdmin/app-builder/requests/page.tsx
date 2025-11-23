'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  appType: string;
  features: string[];
  requirements: string;
  paymentType: string;
  status: string;
  queuePosition?: number;
  priority: string;
  size?: string;
  complexity?: string;
  techStack?: string[];
  questionnaireData?: any;
  kickoffMeetingRequested?: boolean;
  kickoffMeetingScheduled?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AppBuilderRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status, router, filter]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/app-builder/projects/queue');
      const data = await response.json();
      
      let filtered = data.projects || [];
      if (filter !== 'all') {
        filtered = filtered.filter((p: Project) => p.status === filter);
      }
      
      setProjects(filtered);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/app-builder/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchProjects();
        if (selectedProject?._id === projectId) {
          setSelectedProject(null);
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">App Builder Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all app builder project requests
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'draft'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'in_progress'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('review')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'review'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Review
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1 space-y-3">
            {projects.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No projects found</p>
            ) : (
              projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedProject?._id === project._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{project.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      project.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {project.description.substring(0, 80)}...
                  </p>
                  <div className="flex gap-2 flex-wrap text-xs">
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                      {project.appType}
                    </span>
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded capitalize">
                      {project.status}
                    </span>
                    {project.queuePosition && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                        Queue #{project.queuePosition}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {project.userId.name} ({project.userId.email})
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Project Details */}
          {selectedProject && (
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Created: {new Date(selectedProject.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedProject.status}
                    onChange={(e) => updateProjectStatus(selectedProject._id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedProject.description}</p>
                </div>

                {/* User Info */}
                <div>
                  <h3 className="font-semibold mb-2">Client</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedProject.userId.name} ({selectedProject.userId.email})
                  </p>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">App Type</h3>
                    <p className="text-gray-700 dark:text-gray-300">{selectedProject.appType}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payment Type</h3>
                    <p className="text-gray-700 dark:text-gray-300 capitalize">{selectedProject.paymentType}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Size</h3>
                    <p className="text-gray-700 dark:text-gray-300 capitalize">{selectedProject.size || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Complexity</h3>
                    <p className="text-gray-700 dark:text-gray-300 capitalize">{selectedProject.complexity || 'N/A'}</p>
                  </div>
                </div>

                {/* Features */}
                {selectedProject.features && selectedProject.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProject.features.map((feature, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack */}
                {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questionnaire Data */}
                {selectedProject.questionnaireData && (
                  <div>
                    <h3 className="font-semibold mb-2">Questionnaire Data</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedProject.questionnaireData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {selectedProject.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedProject.requirements}</p>
                  </div>
                )}

                {/* Kickoff Meeting */}
                {selectedProject.kickoffMeetingRequested && (
                  <div>
                    <h3 className="font-semibold mb-2">Kickoff Meeting</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedProject.kickoffMeetingScheduled
                        ? `Scheduled: ${new Date(selectedProject.kickoffMeetingScheduled).toLocaleString()}`
                        : 'Requested (not yet scheduled)'}
                    </p>
                  </div>
                )}

                {/* Queue Info */}
                {selectedProject.queuePosition && (
                  <div>
                    <h3 className="font-semibold mb-2">Queue Information</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Position: #{selectedProject.queuePosition} | Priority: {selectedProject.priority}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

