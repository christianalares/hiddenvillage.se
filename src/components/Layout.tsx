type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return <div className="container bg-slate-200">{children}</div>
}

export default Layout
