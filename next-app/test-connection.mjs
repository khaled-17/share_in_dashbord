import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nkoxxxwepgvyeujrnjvv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rb3h4eHdlcGd2eWV1anJuanZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjIxMjksImV4cCI6MjA3OTYzODEyOX0.Xe6Acu1X3khZ51bwheAF_Q6DLQrUsxwFWKb80rFmYdQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 جاري اختبار الاتصال بـ Supabase...\n')
  
  try {
    // اختبار 1: جلب قائمة الجداول
    const { data: tables, error: tablesError } = await supabase
      .from('ExpenseType')
      .select('*')
      .limit(1)
    
    if (tablesError) {
      console.log('❌ فشل الاتصال:')
      console.log('   الخطأ:', tablesError.message)
      console.log('   الكود:', tablesError.code)
      console.log('\n💡 ملاحظة: إذا كان الخطأ "relation does not exist" فهذا يعني:')
      console.log('   - الاتصال شغال ✅')
      console.log('   - لكن الجدول ExpenseType غير موجود في قاعدة البيانات')
      console.log('   - تحتاج إنشاء الجدول في Supabase Dashboard')
      return
    }
    
    console.log('✅ الاتصال ناجح!')
    console.log('✅ الجدول ExpenseType موجود')
    console.log('📊 عدد السجلات:', tables?.length || 0)
    
    if (tables && tables.length > 0) {
      console.log('📝 أول سجل:', JSON.stringify(tables[0], null, 2))
    }
    
  } catch (error) {
    console.log('❌ حدث خطأ غير متوقع:')
    console.log(error)
  }
}

testConnection()
