'use client';

import { useState } from 'react';
import CashierUnpaid from '@/components/CashierUnpaid';
import CashierPaid from '@/components/CashierPaid';

export default function CashierPage() {
  const [activeTab, setActiveTab] = useState<'paid' | 'unpaid'>('unpaid');

  return (
    <div className="relative size-full">
      {activeTab === 'unpaid' ? <CashierUnpaid /> : <CashierPaid />}
      
      {/* Interactive overlay buttons */}
      <button
        onClick={() => setActiveTab('paid')}
        className="absolute left-[158px] top-[612px] w-[250px] h-[60px] z-10 cursor-pointer bg-transparent border-none"
        aria-label="View paid invoices"
      />
      <button
        onClick={() => setActiveTab('unpaid')}
        className="absolute left-[816px] top-[612px] w-[250px] h-[60px] z-10 cursor-pointer bg-transparent border-none"
        aria-label="View unpaid invoices"
      />
    </div>
  );
}
