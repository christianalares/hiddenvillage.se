import { cn } from '@/utils/cn'

type Props = {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export const Container = ({ children, as: As = 'div', className }: Props) => (
  <As className={cn('mx-auto w-full max-w-5xl px-4', className)}>{children}</As>
)
