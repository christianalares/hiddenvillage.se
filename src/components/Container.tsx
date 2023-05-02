import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export const Container = ({ children, as: As = 'div', className = '' }: Props) => (
  <As
    className={clsx('mx-auto w-full max-w-5xl px-4', {
      [className]: !!className,
    })}
  >
    {children}
  </As>
)
