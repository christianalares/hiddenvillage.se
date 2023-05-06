import { cn } from '@/utils/cn'

type Props = {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export const GradientBorderedBox = ({ children, as: As = 'div', className }: Props) => {
  return (
    <As
      style={
        {
          '--dark-purple': '9 18 37',
          '--light-purple': '60 79 148',

          '--bg-color': 'linear-gradient(rgb(var(--dark-purple)), rgb(var(--dark-purple)))',
          '--border-color': `linear-gradient(145deg,
            rgb(var(--light-purple)) 0%,
            rgb(var(--light-purple) / 0.3) 33.33%,
            rgb(var(--light-purple) / 0.14) 66.67%,
            rgb(var(--light-purple) / 0.1) 100%)
          `,
        } as React.CSSProperties
      }
      className={cn(
        'border border-transparent [background:padding-box_var(--bg-color),border-box_var(--border-color)]',
        className
      )}
    >
      {children}
    </As>
  )
}
