import ProfileForm from '@/app/ui/dashboard/profile-form-loader';
import MfaSetup from '@/app/ui/dashboard/mfa-setup-loader';
import DeviceManagement from '@/app/ui/dashboard/device-management-loader';
import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-6 text-xl md:text-2xl`}>Profile</h1>
      <div className="flex max-w-md flex-col gap-6">
        <ProfileForm />
        <MfaSetup />
        <DeviceManagement />
      </div>
    </main>
  );
}
