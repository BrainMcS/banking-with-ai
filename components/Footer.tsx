import { logoutAccount } from '@/lib/actions/user.actions'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import ThemeToggle from './shared/ThemeToggle'  // Add this import

const Footer = ({ user, type = 'desktop' }: FooterProps) => {
  const router = useRouter();

  const handleLogOut = async () => {
    const loggedOut = await logoutAccount();
    if(loggedOut) router.push('/sign-in')
  }

  return (
    <footer className="footer dark:border-dark-border">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className={type === 'mobile' ? 'footer_name-mobile dark:bg-dark-muted' : 'footer_name dark:bg-dark-muted'}>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {user?.firstName[0]}
          </p>
        </div>
      </div>

      <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
        <h1 className="text-14 truncate text-gray-700 dark:text-gray-200 font-semibold">
          {user?.firstName}
        </h1>
        <p className="text-14 truncate font-normal text-gray-600 dark:text-gray-400">
          {user?.email}
        </p>
      </div>

      <div className="footer_image dark:invert" onClick={handleLogOut}>
        <Image src="icons/logout.svg" fill alt="logout" />
      </div>
    </footer>
  )
}

export default Footer