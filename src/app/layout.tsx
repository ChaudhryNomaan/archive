import "./globals.css";
import { VelosProvider } from "@/context/VelosContext";
import ScrollToTop from "@/components/ScrollToTop"; // Ensure path matches your file structure

export const metadata = {
  title: "VELOS ARCHIVE",
  description: "Modular Utility // Structural Permanence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white"> 
        <VelosProvider>
          {children}
          {/* Global Scroll Component */}
          <ScrollToTop />
        </VelosProvider>
      </body>
    </html>
  );
}