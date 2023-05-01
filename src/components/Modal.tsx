import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'
import { Icon } from '@/components/Icon'

type Props = {
  children: React.ReactNode
  isOpen: boolean
}

export const Modal = ({ children, isOpen }: Props) => {
  const router = useRouter()
  const closeButtonRef = useRef<HTMLAnchorElement>(null)

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        router.replace('/')
      }}
      static
      initialFocus={closeButtonRef}
    >
      {({ open }) => (
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <Dialog.Panel as={React.Fragment}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: '10%' }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: '10%' }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-3 z-10 mx-auto max-w-2xl overflow-y-scroll rounded-md bg-white/10 backdrop-blur-lg md:top-[8vh] md:h-fit md:max-h-[85vh]"
                >
                  <div className="overflow-y-scroll">
                    <Link
                      href="/"
                      scroll={false}
                      shallow={true}
                      ref={closeButtonRef}
                      className="fixed right-2 top-2 rounded-full p-1 text-slate-200 focus:ring-slate-500"
                    >
                      <span className="sr-only">Close</span>
                      <Icon name="close" className="w-8" />
                    </Link>
                    <div className="mx-4 mb-10 mt-16">{children}</div>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </>
          )}
        </AnimatePresence>
      )}
    </Dialog>
  )
}
