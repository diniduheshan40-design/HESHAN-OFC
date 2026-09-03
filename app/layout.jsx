export const metadata = {
  title: "HESHAN OFC",
  description: "Official Portfolio & Guestbook",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

