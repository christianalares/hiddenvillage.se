import clsx from 'clsx'
import type { ComponentProps } from 'react'

type Props = ComponentProps<'button'>

export const Button = ({ className, children, type = 'button', ...restProps }: Props) => {
  return (
    <button
      type={type}
      className={clsx(
        'rounded-md border border-slate-500 px-3 py-1 text-slate-300 shadow-md shadow-slate-900/20 transition-colors hover:border-slate-400 hover:text-slate-300 focus:border-slate-400 focus:text-slate-300',
        className
      )}
      {...restProps}
    >
      {children}
    </button>
  )
}
