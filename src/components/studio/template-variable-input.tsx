'use client'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { TemplatePromptVariable } from '@/types/database'

interface TemplateVariableInputProps {
  variable: TemplatePromptVariable
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TemplateVariableInput({ variable, value, onChange, disabled }: TemplateVariableInputProps) {
  if (variable.type === 'select' && variable.options) {
    return (
      <Select
        label={`${variable.label}${variable.required ? ' *' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`Select ${variable.label.toLowerCase()}...`}
        options={variable.options.map((opt) => ({ value: opt, label: opt }))}
      />
    )
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">
        {variable.label}
        {variable.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}...`}
        disabled={disabled}
      />
    </div>
  )
}
