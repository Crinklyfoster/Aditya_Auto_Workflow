import "../styles/globals.css";

export const metadata = {
  title: "Aditya Auto Workflow",
  description: "Demo workflow system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
