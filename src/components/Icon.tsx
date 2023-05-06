import { AtSymbolIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { BriefcaseIcon, InformationCircleIcon, CodeBracketIcon, ArrowLeftIcon } from '@heroicons/react/24/solid'
import {
  CalendarIcon,
  DocumentTextIcon,
  LinkIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

import { cn } from '@/utils/cn'

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
  arrowLeft: ArrowLeftIcon,
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

  return <IconComponent className={cn(className)} />
}
