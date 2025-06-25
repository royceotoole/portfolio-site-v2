'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'

const Screensaver = dynamic(() => import('./Screensaver'), {
  ssr: false
})

export default function MobileLanding() {
  return (
    <>
      {/* Background Screensaver */}
      <div className="pointer-events-none">
        <Screensaver disableInteraction />
      </div>

      {/* Mobile Content Overlay */}
      <div className="fixed inset-0 bg-black/20 pointer-events-none" />
      <div className="fixed inset-0 flex flex-col justify-between pointer-events-none">
        {/* Top Bar - Only Contact is clickable */}
        <div className="py-[18px] px-5">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-gt-america">
              Royce O'Toole
            </span>
            <Link 
              href="mailto:royceotoole@gmail.com"
              className="text-white text-sm font-gt-america hover:opacity-75 transition-opacity pointer-events-auto"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-[18px] px-5">
          <p className="text-white text-sm font-gt-america text-center mb-[18px]">
            This website is designed for desktop viewing.<br />
            Please visit on a larger screen to view the full portfolio of work.
          </p>
        </div>
      </div>
    </>
  )
} 