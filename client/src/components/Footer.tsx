import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className='bg-[#090C16] opacity-65'>
            <div className='max-w-300 mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 font-poppins'>

                {/* Top section */}
                <div className='flex flex-col gap-6 lg:gap-10 mb-6 lg:mb-10'>

                    {/* Legal */}
                    <div className='flex flex-row gap-5 lg:gap-6'>
                        <p className='hidden lg:block text-white text-base font-bold tracking-widest'>LEGAL</p>
                        <Link to="/privacy" className='text-white/70 text-sm tracking-widest hover:text-[#00C9B1] transition-colors'>PRIVACY</Link>
                        <Link to="/terms" className='text-white/70 text-sm tracking-widest hover:text-[#00C9B1] transition-colors'>TERMS</Link>
                        <Link to="/support" className='text-white/70 text-sm tracking-widest hover:text-[#00C9B1] transition-colors'>SUPPORT</Link>
                    </div>

                    {/* Socials */}
                    <div className='flex flex-wrap gap-4 sm:gap-8 font-medium'>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer"
                            className='text-white text-sm sm:text-base lg:text-lg tracking-widest hover:text-[#00C9B1] transition-colors'>
                            FACEBOOK
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer"
                            className='text-white text-sm sm:text-base lg:text-lg tracking-widest hover:text-[#00C9B1] transition-colors'>
                            INSTAGRAM
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                            className='text-white text-sm sm:text-base lg:text-lg tracking-widest hover:text-[#00C9B1] transition-colors'>
                            LINKEDIN
                        </a>
                    </div>
                </div>

                <div className='border-t border-white/10 mb-6' />

                {/* Contact row */}
                <div className='grid grid-cols-2 sm:flex sm:flex-row gap-4 sm:gap-12 mb-6'>
                    <div className='flex flex-col gap-1'>
                        <p className='text-[#00C9B1] text-xs tracking-widest uppercase'>CONTACT</p>
                        <p className='text-white text-sm'>0521-874223</p>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='text-[#00C9B1] text-xs tracking-widest uppercase'>EMAIL</p>
                        <p className='text-white text-sm'>contact@agence47.ma</p>
                    </div>
                    <div className='flex flex-col gap-1 col-span-2 sm:col-span-1'>
                        <p className='text-[#00C9B1] text-xs tracking-widest uppercase'>ADRESSE</p>
                        <p className='text-white text-sm'>Résidence Niama II IM B1, Magasin 2, El Jadida, Maroc</p>
                    </div>
                </div>

                <p className='text-white/30 text-xs tracking-wider'>
                    ©2026 AGENCE 47 | DEVELOPED BY SANAOUI OMAR AS A INTERNSHIP PROJECT
                </p>

            </div>
        </footer>
    )
}
