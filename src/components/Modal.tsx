import { Dialog } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useRef } from 'react'

type Props = {
  children: React.ReactNode
  isOpen: boolean
}

const Modal = ({ children, isOpen }: Props) => {
  const router = useRouter()
  const closeButtonRef = useRef<HTMLAnchorElement>(null)

  return (
    <Dialog
      open={isOpen}
      onClose={() =>
        router.push('/', undefined, {
          shallow: true,
          scroll: false,
        })
      }
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
                  className="fixed z-10 inset-3 rounded-md bg-white/10 max-w-2xl mx-auto md:h-fit md:max-h-[85vh] md:top-[8vh] overflow-y-scroll backdrop-blur-lg"
                >
                  <div className="overflow-y-scroll">
                    <Link href="/" scroll={false} shallow={true} ref={closeButtonRef}>
                      <a
                        // tabIndex={0}
                        className="text-slate-200 p-1 top-2 right-2 fixed rounded-full focus:ring-slate-500"
                      >
                        <span className="sr-only">Close</span>
                        <XIcon className="w-8" />
                      </a>
                    </Link>
                    <div className="mx-4 mt-16 mb-10">{children}</div>
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

export default Modal
