// FILE: src/app/AppLayout.tsx

import type { ReactNode } from "react";
import { Container, HeaderBar } from "../shared/ui";
import AuthStatus from "../features/auth/AuthStatus";

type Props = {
  title: string;
  subtitle?: string;
  backTo?: string;
  right?: ReactNode;
  children: ReactNode;
};

export default function AppLayout({ title, subtitle, backTo, right, children }: Props) {
  return (
    <div style={{ minHeight: "100%" }}>
      <HeaderBar title={title} subtitle={subtitle} backTo={backTo} right={right ?? <AuthStatus />} />
      <main>
        <Container>{children}</Container>
      </main>
    </div>
  );
}
