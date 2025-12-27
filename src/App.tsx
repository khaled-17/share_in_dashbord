import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { Dashboard } from './pages/Dashboard';

import { Quotations, QuotationDetails } from './pages/Quotations';
import { Reports } from './pages/Reports';

import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/Customers/CustomerDetails';
import { Employees } from './pages/Employees';
import { Expenses } from './pages/Expenses';
import { Revenue } from './pages/Revenue';
import { Suppliers } from './pages/Suppliers';
import { SupplierDetails } from './pages/Suppliers/SupplierDetails';
import { Shareen } from './pages/Shareen';
import { Settings } from './pages/Settings';
import { WorkOrders } from './pages/WorkOrders';
import { Partners } from './pages/Partners';
import { ReceiptVouchers } from './pages/ReceiptVouchers';
import { PaymentVouchers } from './pages/PaymentVouchers';

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
    if (pathname.startsWith('/partners/') && pathname !== '/partners') {
      return { title: 'تفاصيل الشريك', subtitle: 'عرض سجل رأس المال والمسحوبات' };
    }

    const routes: Record<string, { title: string; subtitle: string }> = {
      '/': {
        title: 'لوحة التحكم',
        subtitle: 'نظرة شاملة على الوضع المالي للشركة'
      },
      '/quotations': {
        title: 'عروض الأسعار',
        subtitle: 'إنشاء ومتابعة عروض الأسعار المقدمة للعملاء'
      },
      '/work-orders': {
        title: 'أوامر التشغيل',
        subtitle: 'إدارة ومتابعة أوامر التشغيل والمشاريع'
      },
      '/reports': {
        title: 'التقارير المالية',
        subtitle: 'عرض التقارير المالية وكشف الحساب'
      },
      '/customers': {
        title: 'إدارة العملاء',
        subtitle: 'إدارة بيانات العملاء وعروض الأسعار'
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
      '/suppliers': {
        title: 'الموردين',
        subtitle: 'إدارة بيانات الموردين'
      },
      '/shareen': {
        title: 'سجل Shareen',
        subtitle: 'عرض سجلات Shareen'
      },
      '/settings': {
        title: 'الإعدادات',
        subtitle: 'إدارة أنواع المصروفات والإيرادات'
      },
      '/partners': {
        title: 'إدارة الشركاء',
        subtitle: 'إدارة بيانات الشركاء ورأس المال'
      },
      '/receipt-vouchers': {
        title: 'سندات القبض',
        subtitle: 'تسجيل ومتابعة جميع المقبوضات المالية'
      },
      '/payment-vouchers': {
        title: 'سندات الصرف',
        subtitle: 'تسجيل ومتابعة جميع المدفوعات المالية'
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

        <Route path="/quotations" element={<Quotations />} />
        <Route path="/quotations/:id" element={<QuotationDetails />} />
        <Route path="/work-orders" element={<WorkOrders />} />
        <Route path="/reports" element={<Reports />} />

        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />

        <Route path="/employees" element={<Employees />} />
        <Route path="/expenses" element={<Expenses />} />

        <Route path="/revenue" element={<Revenue />} />

        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/:id" element={<SupplierDetails />} />

        <Route path="/shareen" element={<Shareen />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/receipt-vouchers" element={<ReceiptVouchers />} />
        <Route path="/payment-vouchers" element={<PaymentVouchers />} />
      </Routes>
    </MainLayout>
  );
};

function App() {
  return (
    <HashRouter>
      <RouteHandler />
    </HashRouter>
  );
}

export default App;
