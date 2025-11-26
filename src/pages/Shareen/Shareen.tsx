import React, { useState, useEffect } from 'react';
import { Card, Table } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface ShareenItem {
  id: number;
  created_at: string;
}

export const Shareen: React.FC = () => {
  const [items, setItems] = useState<ShareenItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('shareen')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setItems(data || []);
    } catch (err: any) {
      toast.error('فشل في تحميل البيانات: ' + err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Table columns
  const columns = [
    { key: 'id', label: 'المعرف', header: 'المعرف' },
    { 
      key: 'created_at', 
      label: 'تاريخ الإنشاء', 
      header: 'تاريخ الإنشاء',
      render: (item: ShareenItem) => formatDate(item.created_at)
    },
  ];

  return (
    <>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            direction: 'rtl',
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            duration: 4000,
          },
        }}
      />
      
      <div className="space-y-6">
        <Card title="سجل shareen">
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table
              columns={columns}
              data={items}
              emptyMessage="لا يوجد بيانات"
            />
          )}
        </Card>
      </div>
    </>
  );
};
