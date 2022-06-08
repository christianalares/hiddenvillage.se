import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

const Container = ({ children, as: As = 'div', className = '' }: Props) => (
  <As
    className={clsx('w-full max-w-5xl mx-auto px-4', {
      [className]: !!className,
    })}
  >
    {children}
  </As>
)

export default Container
