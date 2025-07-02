// src/app/projects/[slug]/page.tsx - Complete file
"use client";

import { getProjectBySlug } from '../../../lib/projects';
import { ImageModal } from '../../../components/projects/ImageModal';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Github } from 'lucide-react';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  
  if (!project) {
    notFound();
  }

  // Check screen size and scroll position
  useEffect(() => {
    // Function to determine if we should show the scroll indicator
    const checkScrollVisibility = () => {
      // Only show on smaller screens where content may not be visible
      const isSmallerScreen = window.innerHeight < 800;
      
      // Check if we've scrolled already
      const hasScrolled = window.scrollY > 100;
      
      // Show indicator only on smaller screens and when at the top of the page
      setShowScrollIndicator(isSmallerScreen && !hasScrolled);
    };

    // Check immediately and on resize
    checkScrollVisibility();
    window.addEventListener('resize', checkScrollVisibility);
    window.addEventListener('scroll', checkScrollVisibility);
    
    return () => {
      window.removeEventListener('resize', checkScrollVisibility);
      window.removeEventListener('scroll', checkScrollVisibility);
    };
  }, []);

  return (
    <>
      <div className="max-w-6xl mx-auto px-2 md:px-4 space-y-3 md:space-y-6 py-2 md:py-6">
        {/* Project Header */}
        <header className="space-y-2 md:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              <div className="relative w-8 h-8 md:w-12 md:h-12">
                <Image 
                  src="/images/compass.svg"
                  alt="Project Icon"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-3xl md:text-6xl font-heading font-bold text-gray-900">{project.title}</h1>
            </div>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm border hover:shadow-md transition-all duration-200 group flex-shrink-0"
                title="View on GitHub"
              >
                <Github className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-gray-900" />
              </a>
            )}
          </div>
          <p className="text-lg md:text-2xl text-gray-600 w-full font-medium">
            {project.longDescription}
          </p>
        </header>

        {/* Project Image - Using aspect ratio approach */}
        <div className="rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200">
          <div 
            className="relative w-full"
            style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
            onClick={() => setSelectedImage(project.imageUrl)}
          >
            <Image
              src={project.imageUrl}
              alt={`${project.title} Showcase`}
              fill
              className="object-fill"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 hover:opacity-100 text-white bg-black/50 px-4 py-2 rounded-full transition-opacity">
                Click to enlarge
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Only on smaller screens */}
        {showScrollIndicator && (
          <div className="flex justify-center animate-bounce mt-4 mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        )}

        {/* Tech Stack and Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8 mt-3 md:mt-6">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-900 mb-3 md:mb-5 pt-2 md:pt-4 ml-2 uppercase tracking-widest">TECHNOLOGY STACK</h2>
            
            {/* Frontend */}
            <div className="mb-3 md:mb-4 ml-2">
              <h3 className="text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Frontend</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {project.techStack.Frontend.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-2 md:px-3 py-1 md:py-1.5 bg-mint-500/10 text-mint-500 rounded-full font-medium text-xs md:text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Backend */}
            <div className="mb-3 md:mb-4 ml-2">
              <h3 className="text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Backend</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {project.techStack.Backend.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-2 md:px-3 py-1 md:py-1.5 bg-mint-500/10 text-mint-500 rounded-full font-medium text-xs md:text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Database */}
            <div className="mb-3 md:mb-4 ml-2">
              <h3 className="text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">Database</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {project.techStack.Database.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-2 md:px-3 py-1 md:py-1.5 bg-mint-500/10 text-mint-500 rounded-full font-medium text-xs md:text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* DevOps */}
            <div className="mb-3 md:mb-4 ml-2">
              <h3 className="text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">DevOps</h3>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {project.techStack.DevOps.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-2 md:px-3 py-1 md:py-1.5 bg-mint-500/10 text-mint-500 rounded-full font-medium text-xs md:text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-900 mb-3 md:mb-5 pt-1 md:pt-2 ml-2 uppercase tracking-widest">KEY FEATURES</h2>
            <div className="space-y-3 md:space-y-5">
              {project.features.map((feature) => (
                <div key={feature.title} className="p-3 md:p-5 bg-white rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-base md:text-xl font-medium mb-1 md:mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        {project.technicalImplementation && (
          <section className="space-y-3 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-900 pt-2 md:pt-4 ml-2 uppercase tracking-widest">TECHNICAL IMPLEMENTATION</h2>
            
            {/* Architecture Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg md:text-2xl font-medium text-gray-900 mb-3 md:mb-6">System Architecture</h3>
              <div className="space-y-2 md:space-y-4 text-sm md:text-lg leading-relaxed text-gray-700">
                {project.technicalImplementation.systemArchitecture.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Algorithm Card - Only display if project has algorithm data */}
            {project.technicalImplementation.algorithm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Route Calculation Algorithm</h3>
                <div className="space-y-2 md:space-y-4 text-sm md:text-lg leading-relaxed text-gray-700">
                  <p className="font-medium text-gray-900">
                    {project.technicalImplementation.algorithm.description}
                  </p>
                  
                  <div className="space-y-4 md:space-y-5">
                    {project.technicalImplementation.algorithm.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 md:space-x-4">
                        <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium text-xs md:text-sm mt-8 md:mt-2">
                          {index + 1}
                        </span>
                        <p className="text-sm md:text-base leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt={`${project.title} Screenshot`}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}