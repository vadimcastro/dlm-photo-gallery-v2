// src/components/resume/ResumeSummary.tsx
import Link from 'next/link';

export const ResumeSummary = () => {
  return (
    <Link href="/resume" className="block h-full group cursor-pointer">
      <div className="flex flex-col bg-white rounded-lg overflow-hidden border-0 md:border md:border-gray-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:bg-gray-50 p-4 md:p-6">
        {/* Skills section */}
        <div className="shrink-0 pb-6">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">
            Key Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "React",
              "Python",
              "Java",
              "Spring Boot",
              "PostgreSQL",
              "AWS",
              "CI/CD",
              "REST APIs"
            ].map((skill) => (
              <span 
                key={skill}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs md:text-sm rounded-full 
                         border border-emerald-200 hover:bg-emerald-100 transition-colors duration-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Experience section */}
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Recent Experience</h3>
          
          <div className="space-y-6">
            <div className="border-l-2 border-emerald-200 pl-4 md:pl-5">
              <div className="space-y-2">
                <h4 className="font-medium text-sm md:text-base">Senior Software Engineer, UI/UX</h4>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <p className="text-gray-700 text-sm">Stickshift AI</p>
                  <p className="text-xs text-gray-500 md:whitespace-nowrap">
                    Dec 2023 - Oct 2024
                  </p>
                </div>
              </div>
              <ul className="mt-3 text-xs md:text-sm text-gray-600 space-y-1">
                <li>• Added GPT-4 Turbo and Claude 3 Haiku integration</li>
                <li>• Implemented Bing Autosuggest for real-time search</li>
                <li>• Designed & built mobile-friendly React UI</li>
              </ul>
            </div>

            <div className="border-l-2 border-emerald-200 pl-4 md:pl-5">
              <div className="space-y-2">
                <h4 className="font-medium text-sm md:text-base">Software Engineer, Platform & Data</h4>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <p className="text-gray-700 text-sm">Goldman Sachs & Co.</p>
                  <p className="text-xs text-gray-500 md:whitespace-nowrap">
                    Feb 2022 - Apr 2023
                  </p>
                </div>
              </div>
              <ul className="mt-3 text-xs md:text-sm text-gray-600 space-y-1">
                <li>• Developed streamlined data pipeline strategy</li>
                <li>• Created custom internal Python libraries</li>
                <li>• Managed CI/CD pipelines in Gitlab CI</li>
              </ul>
            </div>

            <div className="border-l-2 border-emerald-200 pl-4 md:pl-5">
              <div className="space-y-2">
                <h4 className="font-medium text-sm md:text-base">Associate Software Developer</h4>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <p className="text-gray-700 text-sm">IBM</p>
                  <p className="text-xs text-gray-500 md:whitespace-nowrap">
                    Aug 2020 - Dec 2021
                  </p>
                </div>
              </div>
              <ul className="mt-3 text-xs md:text-sm text-gray-600 space-y-1">
                <li>• Developed REST services with Java Spring Boot</li>
                <li>• Implemented APIs for GSA Data Scientists</li>
                <li>• Created automated DB configuration scripts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Education section */}
        <div className="shrink-0 mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Education</h3>
          <div className="border-l-2 border-emerald-200 pl-4 md:pl-5">
            <h4 className="font-medium text-sm md:text-base">B.S. Computer Science and Applied Mathematics</h4>
            <p className="text-gray-700 text-sm">University at Albany, SUNY</p>
            <p className="text-xs text-gray-500">2015 - 2019</p>
          </div>
        </div>
      </div>
    </Link>
  );
};