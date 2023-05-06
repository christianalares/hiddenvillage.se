import { cn } from '@/utils/cn'

type Props = {
  tag: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export const Tag = ({ tag, as: As = 'span', className = '' }: Props) => {
  return <As className={cn('rounded-md bg-slate-400/20 px-2 py-0.5 text-sm text-slate-300', className)}>{tag}</As>
}
