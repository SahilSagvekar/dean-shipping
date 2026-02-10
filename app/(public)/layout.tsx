'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Define which paths should have the header and footer
    const showHeaderFooter = ['/', '/schedule', '/about', '/shipment', '/contact', '/login', '/register'].includes(pathname);

    return (
        <>
            {showHeaderFooter && <Header currentPage={pathname.replace('/', '')} onNavigate={() => { }} />}
            {children}
            {showHeaderFooter && <Footer />}
        </>
    );
}
