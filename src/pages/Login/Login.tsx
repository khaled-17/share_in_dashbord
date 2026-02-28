import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components/ui';
import toast, { Toaster } from 'react-hot-toast';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
            toast.success('تم تسجيل الدخول بنجاح');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'فشل تسجيل الدخول');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4" dir="rtl">
            <Toaster position="top-center" />
            <div className="w-full max-w-md">
                <Card title="تسجيل الدخول - Share In">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@share-in.com"
                            required
                        />
                        <Input
                            label="كلمة المرور"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'جاري التحميل...' : 'دخول'}
                        </Button>
                    </form>
                </Card>
                <p className="text-center text-gray-500 mt-6 text-sm">
                    جميع الحقوق محفوظة &copy; {new Date().getFullYear()} Share In Agency
                </p>
            </div>
        </div>
    );
};
