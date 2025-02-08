'use client'

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Footer from './Footer'
import PlaidLink from './PlaidLink'

const Sidebar = ({ user }: SiderbarProps) => {
  const pathname = usePathname();

  return (
    <section className="sidebar dark:bg-dark-background dark:border-dark-border">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <Image 
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Horizon logo"
            className="size-[24px] max-xl:size-14 dark:invert"
          />
          <h1 className="sidebar-logo dark:text-white">Bank</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

          return (
            <Link href={item.route} key={item.label}
              className={cn('sidebar-link dark:hover:bg-dark-muted', { 
                'bg-bank-gradient': isActive,
                'dark:bg-bank-gradient-dark': isActive 
              })}
            >
              <div className="relative size-6">
                <Image 
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({
                    'brightness-[3] invert-0': isActive,
                    'dark:invert': !isActive
                  })}
                />
              </div>
              <p className={cn("sidebar-label dark:text-gray-300", { 
                "!text-white": isActive 
              })}>
                {item.label}
              </p>
            </Link>
          )
        })}
        
        <PlaidLink user={user} />
      </nav>

      <Footer user={user} />
    </section>
  )
}

export default Sidebar