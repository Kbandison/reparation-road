// components/shared/LayoutWrapper.tsx
import { Header } from "./Header";
import { Footer } from "./home/Footer";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
};
