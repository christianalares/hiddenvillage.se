import { AtSymbolIcon, PhoneIcon } from '@heroicons/react/24/outline'

import { BriefcaseIcon, InformationCircleIcon, CodeBracketIcon } from '@heroicons/react/24/solid'
import {
  CalendarIcon,
  DocumentTextIcon,
  LinkIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

// import { CalendarIcon, DocumentTextIcon, ExternalLinkIcon, LinkIcon, UserIcon } from '@heroicons/react/outline'
// import { CodeIcon } from '@heroicons/react/solid'

import clsx from 'clsx'

const iconComponents = {
  atSymbol: AtSymbolIcon,
  phone: PhoneIcon,
  briefcase: BriefcaseIcon,
  calendar: CalendarIcon,
  informationCircle: InformationCircleIcon,
  codeBracket: CodeBracketIcon,
  documentText: DocumentTextIcon,
  link: LinkIcon,
  user: UserIcon,
  externalLink: ArrowTopRightOnSquareIcon,
  close: XMarkIcon,
}

export type IconName = keyof typeof iconComponents

type Props = {
  name: IconName
  className?: string
}

export const Icon = ({ name, className }: Props) => {
  const IconComponent = iconComponents[name]

  if (!IconComponent) {
    throw new Error(`Could not find icon: ${name}`)
  }

  return <IconComponent className={clsx(className)} />
}
