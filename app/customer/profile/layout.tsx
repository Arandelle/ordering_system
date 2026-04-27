import { ProfileAuthGuard } from "./component/ProfileAuthGuard";
import { ProfileShell } from "./component/ProfileShell";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileAuthGuard>
      <ProfileShell>{children}</ProfileShell>
    </ProfileAuthGuard>
  );
}
