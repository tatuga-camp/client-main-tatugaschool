import Image from 'next/image';
import SchoolCard from './SchoolCard';
import { School, User } from '@/interfaces';
import { FaBook, FaChalkboardTeacher, FaTachometerAlt } from 'react-icons/fa';
import { useState } from 'react';
import WelcomeCard from './WelcomeCard';

interface SidebarProps {
    user: User;
    school: School;
    className?: string;
}

const navItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, color: 'text-primary-color' },
    { name: 'Class', icon: <FaChalkboardTeacher />, color: 'text-gray-600' },
    { name: 'Subject', icon: <FaBook />, color: 'text-gray-600' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, school, className }) => {
    const [active, setActive] = useState('Dashboard');

    return (
        <div className={className}>
            <aside className={`${className} fixed left-0 top-0 w-1/5 h-auto bg-white p-4 overflow-hidden flex flex-col z-50`}>
                <div className="flex-shrink-0 text-left mb-6">
                    <Image src="/svg/logo/logo.svg" alt="School Logo" width={50} height={50} />
                </div>

                <SchoolCard school={school} />

                <nav className="flex-grow space-y-2 overflow-y-auto py-4 z-10 relative bg-white">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActive(item.name)}
                            className={`flex items-center space-x-2 w-full text-left p-5 rounded-lg ${active === item.name ? 'bg-purple-100 text-primary-color' : 'text-gray-600'
                                } hover:bg-purple-50 transition-colors duration-200`}
                        >
                            <span className={`text-lg ${active === item.name ? item.color : ''}`}>
                                {item.icon}
                            </span>
                            <span className="font-semibold">{item.name}</span>
                        </button>
                    ))}
                </nav>

            </aside>
            <footer className="fixed left-0 w-1/5 h-auto bg-white p-4 overflow-hidden flex flex-col bottom-0">
                <WelcomeCard user={user} />
            </footer>
        </div>
    );
};

export default Sidebar;
