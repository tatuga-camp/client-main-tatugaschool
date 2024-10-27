import Dashboard from '@/components/school/Dashboard';
import { useGetMemberBySchool, useGetSchool, useGetUser } from '@/react-query';
import { useRouter } from 'next/router';
import { ProgressSpinner } from "primereact/progressspinner";

const SchoolPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const { data: school, isLoading: isSchoolLoading } = useGetSchool({ schoolId: id as string });
    const { data: members, isLoading: isMembersLoading } = useGetMemberBySchool({ schoolId: id as string });
    const { data: user, isLoading: isUserLoading } = useGetUser();

    return (
        <div>
            {user && school && members && !isSchoolLoading && !isMembersLoading && !isUserLoading ?
                <Dashboard user={user} school={school} members={members ?? []} /> :
                <div className="flex justify-center items-center h-screen">
                    <ProgressSpinner
                        animationDuration="0.5s"
                        style={{ width: "50px" }}
                        strokeWidth="8"
                    />
                </div>}
        </div>
    );
};

export default SchoolPage;
