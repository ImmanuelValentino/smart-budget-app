import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata = {
  title: 'SmartBudget',
  description: 'Personal Money Budgeting App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        {children}
      </body>
    </html>
  );
}