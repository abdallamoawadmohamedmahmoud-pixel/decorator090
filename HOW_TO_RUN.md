# 🚀 كيفية تشغيل مشروع Decorator

## 📍 **الموقع:**
```
C:\Users\HFCS\Desktop\New folder (4)
```

---

## 🔧 **الخطوات لتشغيل المشروع:**

### 1️⃣ **تشغيل الخادم الخلفي (Backend):**
```bash
# افتح Command Prompt أو PowerShell
cd C:\Users\HFCS\Desktop\New folder (4)\backend
pip install flask flask-sqlalchemy
python app.py
```
**الخادم سيعمل على:** `http://localhost:5001`

### 2️⃣ **تشغيل الواجهة الأمامية (Frontend):**
```bash
# افتح Command Prompt جديد
cd C:\Users\HFCS\Desktop\New folder (4)

# افتح الصفحات التالية في المتصفح:
start index.html          # الصفحة الرئيسية
start services.html       # صفحة الخدمات  
start dashboard.html      # لوحة التحكم
start whatsapp-direct.html # صفحة WhatsApp
```

---

## 🎯 **الروابط المهمة بعد التشغيل:**

### 🌐 **الواجهة الأمامية:**
- **الرئيسية**: `file:///C:/Users/HFCS/Desktop/New%20folder%20(4)/index.html`
- **الخدمات**: `file:///C:/Users/HFCS/Desktop/New%20folder%20(4)/services.html`
- **لوحة التحكم**: `file:///C:/Users/HFCS/Desktop/New%20folder%20(4)/dashboard.html`
- **التسجيل**: `file:///C:/Users/HFCS/Desktop/New%20folder%20(4)/register.html`

### 🔌 **الخادم الخلفي:**
- **API Services**: `http://localhost:5001/api/services`
- **Admin Panel**: `http://localhost:5001/admin/services`

### 📱 **WhatsApp:**
- **رابط مباشر**: `https://wa.me/01099797984`

---

## 👤 **بيانات الدخول الافتراضية:**

### 🏠 **حساب المالك:**
- **البريد**: `owner@decorator.com`
- **كلمة المرور**: `owner123`
- **الصلاحيات**: مالك كامل للنظام

### 👔 **حساب المدير:**
- **البريد**: `admin@decorator.com`
- **كلمة المرور**: `admin123`
- **الصلاحيات**: إدارة المستخدمين والخدمات

### 👤 **حساب مستخدم عادي:**
- **البريد**: `user@decorator.com`
- **كلمة المرور**: `user123`
- **الصلاحيات**: عرض الخدمات فقط

---

## 🔥 **طريقة تشغيل سريع:**

### **الطريقة الأولى (يدوية):**
1. افتح Terminal
2. اكتب: `cd C:\Users\HFCS\Desktop\New folder (4)`
3. اكتب: `start backend\app.py`
4. اكتب: `start index.html`

### **الطريقة الثانية (ملف الباتش):**
1. اذهب إلى: `C:\Users\HFCS\Desktop\New folder (4)`
2. انقر نقرًا مزدوجًا على: `start-server.bat`

---

## 📱 **اختبار الموقع:**

### ✅ **قائمة التحقق:**
- [ ] الخادم الخلفي يعمل على `localhost:5001`
- [ ] الصفحة الرئيسية تفتح في المتصفح
- [ **] الخدمات تظهر من قاعدة البيانات
- [ ] لوحة التحكم تعمل بكفاءة
- [ ] WhatsApp رابط يعمل بالرقم `01099797984`
- [ ] التسجيل والدخول يعملان
- [ ] إضافة/تعديل/حذف الخدمات يعمل

---

## 🎯 **المميزات التي يجب اختبارها:**

### 🏠 **في الصفحة الرئيسية:**
- عرض الخدمات ديناميكيًا
- أزرار WhatsApp تعمل
- تصميم متجاوب

### 🛠️ **في لوحة التحكم:**
- إضافة خدمة جديدة
- تعديل خدمة موجودة
- حذف خدمة
- فلترة وبحث

### 📱 **في صفحة الخدمات:**
- الفلترة حسب الفئات
- عرض تفاصيل الخدمة
- التواصل عبر WhatsApp

---

## 🆘 **المشاكل الشائعة وحلولها:**

### **مشكلة: الخادم لا يعمل**
```bash
# الحل:
cd backend
pip install flask flask-sqlalchemy
python app.py
```

### **مشكلة: الخدمات لا تظهر**
```bash
# تأكد من:
# 1. الخادم يعمل على localhost:5001
# 2. قاعدة البيانات أنشأت بشكل صحيح
# 3. صفحة services.html مفتوحة
```

### **مشكلة: WhatsApp لا يعمل**
```bash
# تأكد من الرقم:
# 01099797984
# يجب أن يعمل على الموبايل والواتساب ويب
```

---

## 🎉 **بعد التشغيل بنجاح:**

### **ستحصل على:**
- 🌐 موقع احترافي متكامل
- 📊 لوحة تحكم متقدمة  
- 📱 WhatsApp integration
- 🗄️ قاعدة بيانات متكاملة
- 🔐 نظام مصادقة كامل
- 🎨 تصميم متجاوب
- 📱 Ready for mobile!

**موقع Decorator جاهز للاستخدام الإنتاجي!** 🚀