import { Link } from 'react-router-dom'
import Logo from '../assets/icons/logo47.svg?react'

export default function Footer() {
    return (
        <footer className='bg-[#090C16] opacity-65'>
            <div className='max-w-300 mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins'>
                <div className='flex justify-between items-start mb-10'>

                    <div className='flex flex-col gap-6'>
                        <Logo className="relative -left-5" />
                        <div className='flex gap-8 font-medium'>
                            <a href="https://facebook.com" target="_blank" rel="noreferrer"
                                className='text-white text-[20px] tracking-widest hover:text-[#00C9B1] transition-colors'>
                                FACEBOOK
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer"
                                className='text-white text-[20px] tracking-widest hover:text-[#00C9B1] transition-colors'>
                                INSTAGRAM
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                                className='text-white text-[20px] tracking-widest hover:text-[#00C9B1] transition-colors'>
                                LINKEDIN
                            </a>
                        </div>
                    </div>

                    <div className='flex flex-col gap-3'>
                        <p className='text-white text-[24px] font-bold tracking-widest'>LEGAL</p>
                        <Link to="/privacy"
                            className='text-white/70 text-[20px] font-medium tracking-widest hover:text-[#00C9B1] transition-colors'>
                            PRIVACY
                        </Link>
                        <Link to="/terms"
                            className='text-white/70 text-[20px] font-medium tracking-widest hover:text-[#00C9B1] transition-colors'>
                            TERMS
                        </Link>
                        <Link to="/support"
                            className='text-white/70 text-[20px] font-medium tracking-widest hover:text-[#00C9B1] transition-colors'>
                            SUPPORT
                        </Link>
                    </div>
                </div>

                <div className='border-t border-white/10 mb-8' />

                <div className='flex gap-16 mb-10'>
                    <div className='flex flex-col gap-1'>
                        <p className='text-[#00C9B1] text-xs tracking-widest uppercase'>CONTACT</p>
                        <p className='text-white text-sm'>0521-874223</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='text-[#00C9B1] text-xs tracking-widest uppercase'>EMAIL</p>
                        <p className='text-white text-sm'>contact@agence47.ma</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='text-[#00C9B1] text-xs tracking-widest uppercase'>ADRESSE</p>
                        <p className='text-white text-sm'>Résidence Niama II IM B1,<br />Magasin 2, El Jadida, Maroc</p>
                    </div>
                </div>

                <p className='text-white/30 text-xs tracking-wider'>
                    ©2026 AGENCE 47 | DEVELOPED BY SANAOUI OMAR AS A INTERNSHIP PROJECT
                </p>

            </div>
        </footer>
    )
}