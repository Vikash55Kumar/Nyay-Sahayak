import Logo from '../assets/logo.png';

// Using a placeholder URL for the logo to make the component self-contained.
const logoUrl = Logo; 

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 text-gray-700 font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Main Content Area */}
                <div className="md:flex md:justify-between md:items-start md:space-x-8">
                    {/* Left Section - Branding & Description */}
                    <div className="mb-8 md:mb-0 md:w-1/3 lg:w-1/4">
                        <div className="flex items-center space-x-3 mb-4">
                            <img src={logoUrl} alt="Nyay Sahayak Logo" className="h-10 w-10 rounded-full" />
                            <span className="self-center text-2xl font-bold whitespace-nowrap text-gray-900">Nyay Sahayak</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed">
                            © {currentYear} Government of India. All Rights Reserved.
                        </p>
                    </div>

                    {/* Middle & Right Sections - Quick Links, Legal, Contact */}
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 md:grid-cols-3 md:w-2/3 lg:w-3/4">
                        {/* Quick Links */}
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Resources</h2>
                            <ul className="text-gray-500 space-y-3">
                                <li><a href="/" className="hover:underline hover:text-gray-900 transition-colors duration-200">Home</a></li>
                                <li><a href="/about" className="hover:underline hover:text-gray-900 transition-colors duration-200">About Us</a></li>
                                <li><a href="/help" className="hover:underline hover:text-gray-900 transition-colors duration-200">Help & Support</a></li>
                            </ul>
                        </div>
                        {/* Legal */}
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h2>
                            <ul className="text-gray-500 space-y-3">
                                <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors duration-200">Privacy Policy</a></li>
                                <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors duration-200">Terms & Conditions</a></li>
                                <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors duration-200">Accessibility Statement</a></li>
                            </ul>
                        </div>
                        {/* Contact */}
                        <div>
                            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact</h2>
                            <ul className="text-gray-500 space-y-3">
                                <li>
                                    <span className="block">Helpline: 1800-754-8643</span>
                                </li>
                                <li>
                                    <a href="mailto:support@nyaysahayak.gov.in" className="hover:underline hover:text-gray-900 transition-colors duration-200">support@nyaysahayak.gov.in</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - Copyright */}
                <hr className="my-8 border-gray-200 md:my-10" />
                <div className="text-center">
                    <span className="text-sm text-gray-500">
                        © {currentYear} <a href="#" className="hover:underline hover:text-gray-900">Nyay Sahayak</a>. All Rights Reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

