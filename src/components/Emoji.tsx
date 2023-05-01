import clsx from 'clsx'

type Props = {
  emoji: string
  label: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export const Emoji = ({ emoji, label, as: As = 'span', className = '' }: Props) => {
  return (
    <As
      role="img"
      aria-label={label}
      className={clsx({
        [className]: !!className,
      })}
    >
      {emoji}
    </As>
  )
}
