"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export default function SalesAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error("Error fetching sales:", error);
      else setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8 pt-24">
      <style jsx>{`
        .sales-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .sales-table th { text-align: left; padding: 15px; border-bottom: 2px solid #000; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; }
        .sales-table td { padding: 15px; border-bottom: 1px solid #eee; }
        .status-badge { font-size: 9px; font-weight: 900; padding: 4px 8px; background: #000; color: #fff; text-transform: uppercase; }
        .total-cell { font-weight: 700; }
      `}</style>

      <h1 className="text-2xl font-black tracking-tighter uppercase mb-10">Sales Archive</h1>

      {loading ? (
        <p className="animate-pulse text-[10px] tracking-widest uppercase">Syncing Data...</p>
      ) : (
        <table className="sales-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="font-bold">{order.customer_name}</div>
                  <div className="text-gray-400 text-[10px]">{order.customer_email}</div>
                </td>
                <td>
                  {/* Displaying items from JSONB */}
                  {Array.isArray(order.items) ? order.items.map((item: any, i: number) => (
                    <div key={i}>{item.name} (x{item.quantity})</div>
                  )) : "No items"}
                </td>
                <td className="total-cell">{Number(order.total_amount).toLocaleString('uk-UA')} ₴</td>
                <td>
                  <span className="status-badge">{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && orders.length === 0 && (
        <div className="py-20 text-center text-gray-400 uppercase tracking-widest text-[10px]">
          No sales recorded in the vault.
        </div>
      )}
    </div>
  );
}