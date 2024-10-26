import { useState } from 'react';
import { FC } from 'react';
import MemberHeader from './MemberHeader';
import MemberTable from './MemberTable';
import { MemberOnSchool } from '@/interfaces';

export interface MembersSectionProps {
    members: MemberOnSchool[];
    onInvite: () => void;
}

const MembersSection: React.FC<MembersSectionProps> = ({ members, onInvite }) => {
    const [activeTab, setActiveTab] = useState('Member');

    const tabs = [
        { name: 'Member' },
        { name: 'Basic information' },
        { name: 'Billing & Plan' },
        { name: 'Invitation' },
    ];

    return (
        <>
            <div className="flex space-x-8 pb-10 px-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`text-gray-600 pb-2 ${activeTab === tab.name
                            ? 'text-primary-color font-semibold border-b-2 border-primary-color px-5'
                            : 'hover:text-gray-800 px-5'
                            }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            
            {activeTab === 'Member' && <div className="bg-white rounded-lg">
                <MemberHeader members={members} onInvite={onInvite} />
                <MemberTable members={members} />
            </div>}
        </>
    );
};

export default MembersSection;
