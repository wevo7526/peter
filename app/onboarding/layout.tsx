'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';

const steps = [
  { name: 'Personal Info', path: '/onboarding/personal' },
  { name: 'Financial Goals', path: '/onboarding/goals' },
  { name: 'Risk Assessment', path: '/onboarding/risk' },
  { name: 'Current Status', path: '/onboarding/status' },
  { name: 'Preferences', path: '/onboarding/preferences' },
  { name: 'AI Interview', path: '/onboarding/interview' },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((step) => step.path === pathname);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Image
            src="/peter.png"
            alt="Peter Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">
            Let's Set Up Your Profile
          </h1>
          <p className="text-gray-600 mt-2">
            We'll guide you through the process step by step
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.name}
                className={`flex items-center ${
                  index !== steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index <= currentStepIndex
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStepIndex
                        ? 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div
                key={step.name}
                className={`text-sm ${
                  step.path === pathname
                    ? 'text-emerald-500 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
} 