import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { ToastContainer } from 'react-toastify'; // <-- 1. Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // <-- 2. Import CSS-nya

export const metadata = {
  title: 'SmartBudget',
  description: 'Personal Money Budgeting App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable}`}>
        {children}
        {/* --- 3. LETAKKAN ToastContainer DI SINI --- */}
        <ToastContainer
          position="bottom-right" // Posisi notifikasi
          autoClose={3000} // Durasi tampil (3 detik)
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark" // Tema gelap
        />
      </body>
    </html>
  );
}