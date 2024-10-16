
import ListsSchoolComponent from "@/components/school/ListsSchoolComponent";
import DefaultLayout from "@/components/layout/DefaultLayout";
import { useRouter } from 'next/router';
import { useEffect } from 'react';


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/school/list');
  }, []);

  return (
    <DefaultLayout>
      <ListsSchoolComponent />
    </DefaultLayout>
  );
}
