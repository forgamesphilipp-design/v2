import type { ReactNode } from "react";
import Container from "../shared/ui/Container";
import HeaderBar from "../shared/ui/HeaderBar";

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
      <HeaderBar title={title} subtitle={subtitle} backTo={backTo} right={right} />
      <main>
        <Container>{children}</Container>
      </main>
    </div>
  );
}
