import ProfileForm from '@/app/ui/dashboard/profile-form-loader';
import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-6 text-xl md:text-2xl`}>Profile</h1>
      <div className="max-w-md">
        <ProfileForm />
      </div>
    </main>
  );
}
