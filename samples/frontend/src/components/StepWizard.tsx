import { ReactNode, useState } from 'react'

interface Step {
  title: string
  summary: string | null
  content: ReactNode
}

interface StepWizardProps {
  steps: Step[]
  activeStep: number
}

export default function StepWizard({ steps, activeStep }: StepWizardProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {steps.map((step, i) => {
        const isCompleted = i < activeStep
        const isActive = i === activeStep
        const isFuture = i > activeStep
        const isExpanded = expandedSteps.has(i)

        return (
          <div key={i} className={`rounded-lg border ${
            isActive ? 'border-blue-600 bg-gray-900' :
            isCompleted ? 'border-green-800 bg-gray-900/50' :
            'border-gray-800 bg-gray-900/30 opacity-50'
          }`}>
            <div
              className={`flex items-center gap-3 p-4 ${isCompleted ? 'cursor-pointer select-none' : ''}`}
              onClick={() => isCompleted && toggleStep(i)}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                isCompleted ? 'bg-green-700 text-green-200' :
                isActive ? 'bg-blue-600 text-white' :
                'bg-gray-700 text-gray-400'
              }`}>
                {isCompleted ? '\u2713' : i + 1}
              </div>
              <h3 className={`font-medium ${isFuture ? 'text-gray-500' : 'text-gray-100'}`}>
                {step.title}
              </h3>
              {isCompleted && step.summary && (
                <span className="ml-auto text-xs text-green-400 font-mono truncate max-w-xs">
                  {step.summary}
                </span>
              )}
              {isCompleted && (
                <span className={`text-xs text-gray-500 ${step.summary ? 'ml-2' : 'ml-auto'}`}>
                  {isExpanded ? '\u25BC' : '\u25B6'}
                </span>
              )}
            </div>
            {(isActive || isCompleted) && (
              <div className={`px-4 pb-4 ${isCompleted && !isExpanded ? 'hidden' : ''}`}>
                {step.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
