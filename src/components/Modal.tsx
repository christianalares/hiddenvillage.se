'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
  isOpen: boolean
}

export const Modal = ({ children, isOpen }: Props) => {
  const router = useRouter()

  return (
    <Dialog.Root modal open={isOpen} onOpenChange={() => router.back()}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </Dialog.Overlay>
        <Dialog.DialogContent asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: '10%' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-3 z-10 mx-auto max-w-2xl overflow-y-scroll rounded-md bg-white/10 backdrop-blur-lg md:top-[8vh] md:h-fit md:max-h-[85vh]"
          >
            <Dialog.Close asChild>
              <button
                type="button"
                className="fixed right-2 top-2 rounded-full p-1 text-slate-200 focus:ring-slate-500"
              >
                <span className="sr-only">Close</span>
                <Icon name="close" className="w-8" />
              </button>
            </Dialog.Close>
            <div className="mx-4 mb-10 mt-16">{children}</div>
          </motion.div>
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
