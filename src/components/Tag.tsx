import clsx from 'clsx'

type Props = {
  tag: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}

const Tag = ({ tag, as: As = 'span', className = '' }: Props) => {
  return (
    <As
      data-c={Tag.name}
      className={clsx('bg-slate-400/20 text-slate-300 text-sm py-0.5 px-2 rounded-sm', {
        [className]: !!className,
      })}
    >
      {tag}
    </As>
  )
}

export default Tag
