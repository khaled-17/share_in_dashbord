import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { Dashboard } from './pages/Dashboard';
import { Vouchers } from './pages/Vouchers';
import { Quotations } from './pages/Quotations';
import { Reports } from './pages/Reports';

import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/Customers/CustomerDetails';
import { ExpenseTypes } from './pages/ExpenseTypes';
import { Employees } from './pages/Employees';
import { Expenses } from './pages/Expenses';
import { Revenue } from './pages/Revenue';
import { RevenueTypes } from './pages/RevenueTypes';
import { Suppliers } from './pages/Suppliers';
import { SupplierDetails } from './pages/Suppliers/SupplierDetails';
import { Shareen } from './pages/Shareen';

const RouteHandler = () => {
  const location = useLocation();

  const getPageInfo = (pathname: string) => {
    // Dynamic routes
    if (pathname.startsWith('/customers/') && pathname !== '/customers') {
      return { title: 'تفاصيل العميل', subtitle: 'عرض سجل عمليات العميل وتفاصيله' };
    }
    if (pathname.startsWith('/suppliers/') && pathname !== '/suppliers') {
      return { title: 'تفاصيل المورد', subtitle: 'عرض سجل عمليات المورد وتفاصيله' };
    }

    const routes: Record<string, { title: string; subtitle: string }> = {
      '/': { 
        title: 'لوحة التحكم', 
        subtitle: 'نظرة شاملة على الوضع المالي للشركة' 
      },
      '/payment-vouchers': { 
        title: 'سندات الصرف والقبض', 
        subtitle: 'إدارة ومتابعة جميع سندات الصرف والقبض' 
      },
      '/receipt-vouchers': { 
        title: 'سندات الصرف والقبض', 
        subtitle: 'إدارة ومتابعة جميع سندات الصرف والقبض' 
      },
      '/quotations': { 
        title: 'عروض الأسعار', 
        subtitle: 'إنشاء ومتابعة عروض الأسعار المقدمة للعملاء' 
      },
      '/reports': { 
        title: 'التقارير المالية', 
        subtitle: 'عرض التقارير المالية وكشف الحساب' 
      },
      '/customers': { 
        title: 'إدارة العملاء', 
        subtitle: 'إدارة بيانات العملاء وعروض الأسعار' 
      },
      '/expense-types': { 
        title: 'أنواع المصروفات', 
        subtitle: 'إدارة أنواع وتصنيفات المصروفات' 
      },
      '/employees': { 
        title: 'إدارة الموظفين', 
        subtitle: 'إدارة بيانات الموظفين والرواتب' 
      },
      '/expenses': { 
        title: 'المصروفات', 
        subtitle: 'إدارة ومتابعة جميع المصروفات' 
      },
      '/revenue': { 
        title: 'الإيرادات', 
        subtitle: 'إدارة ومتابعة جميع الإيرادات' 
      },
      '/revenue-types': { 
        title: 'أنواع الإيرادات', 
        subtitle: 'إدارة أنواع وتصنيفات الإيرادات' 
      },
      '/suppliers': { 
        title: 'الموردين', 
        subtitle: 'إدارة بيانات الموردين' 
      },
      '/shareen': { 
        title: 'سجل Shareen', 
        subtitle: 'عرض سجلات Shareen' 
      },
    };

    return routes[pathname] || { title: 'لوحة التحكم', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo(location.pathname);

  return (
    <MainLayout
      pageTitle={title}
      pageSubtitle={subtitle}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/payment-vouchers" element={<Vouchers />} />
        <Route path="/receipt-vouchers" element={<Vouchers />} />
        <Route path="/quotations" element={<Quotations />} />
        <Route path="/reports" element={<Reports />} />
        
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        
        <Route path="/expense-types" element={<ExpenseTypes />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/expenses" element={<Expenses />} />
        
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/revenue-types" element={<RevenueTypes />} />
        
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/:id" element={<SupplierDetails />} />
        
        <Route path="/shareen" element={<Shareen />} />
      </Routes>
    </MainLayout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <RouteHandler />
    </BrowserRouter>
  );
}

export default App;
