type Props = {
  tag: string
  as?: keyof JSX.IntrinsicElements
}

const Tag = ({ tag, as: As = 'span' }: Props) => {
  return (
    <As data-c={Tag.name} className="bg-slate-400 text-slate-900 text-sm py-0.5 px-2 rounded-sm">
      {tag}
    </As>
  )
}

export default Tag
