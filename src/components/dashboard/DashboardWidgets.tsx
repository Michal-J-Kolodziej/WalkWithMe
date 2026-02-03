import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({
  children,
  className = '',
  hover = true,
}: GlassCardProps) {
  return (
    <div
      className={`
        glass-card rounded-2xl p-6 
        transition-all duration-300 ease-out
        ${hover ? 'hover:scale-[1.02] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: number
    positive: boolean
  }
  iconColor?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  iconColor = 'text-primary',
}: StatCardProps) {
  return (
    <GlassCard className="flex items-start gap-4">
      <div className={`p-3 rounded-xl bg-primary/10 ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold stat-value">{value}</p>
        {trend && (
          <p
            className={`text-xs font-medium mt-1 ${trend.positive ? 'text-green-600' : 'text-red-500'}`}
          >
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
          </p>
        )}
      </div>
    </GlassCard>
  )
}

interface PulseStatusProps {
  status: 'active' | 'idle' | 'offline'
  label?: string
}

export function PulseStatus({ status, label }: PulseStatusProps) {
  const colors = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-400',
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2.5 h-2.5 rounded-full ${colors[status]} ${status === 'active' ? 'pulse-dot' : ''}`}
      >
        {status === 'active' && (
          <div
            className={`absolute inset-0 rounded-full ${colors[status]} animate-ping`}
          />
        )}
      </div>
      {label && (
        <span className="text-sm text-muted-foreground capitalize">
          {label || status}
        </span>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-4">
        {description}
      </p>
      {action}
    </div>
  )
}
