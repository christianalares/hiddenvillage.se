import clsx from 'clsx'
import Link, { LinkProps } from 'next/link'
import type { ButtonHTMLAttributes } from 'react'

type OwnProps = {
  children: React.ReactNode
  className?: string
  to?: LinkProps['href']
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
}

type Props = (OwnProps & ButtonHTMLAttributes<HTMLButtonElement>) | (OwnProps & Omit<LinkProps, 'href'>)

const Button = ({ children, type = 'button', className = '', to, ...restProps }: Props) => {
  const classNames =
    'border border-slate-500 py-1 px-3 rounded-md text-slate-300 shadow-md shadow-slate-900/20 hover:border-slate-400 hover:text-slate-300 transition-colors focus:border-slate-400 focus:text-slate-300'

  if (to) {
    return (
      <Link
        {...(restProps as LinkProps)}
        href={to}
        className={clsx(classNames, {
          [className]: !!className,
        })}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={clsx(classNames, {
        [className]: !!className,
      })}
      {...restProps}
    >
      {children}
    </button>
  )
}

export default Button
