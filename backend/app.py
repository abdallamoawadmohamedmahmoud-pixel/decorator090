from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///services.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# Database Models
class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.String(200), nullable=True)
    category = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'image_url': self.image_url,
            'category': self.category,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Create tables
with app.app_context():
    db.create_all()

# Add sample services if empty
with app.app_context():
    if Service.query.count() == 0:
        sample_services = [
            Service(
                title="تصميم مواقع احترافي",
                description="نصمم لك موقع إلكتروني احترافي يليق بعملك مع واجهة مستخدم حديثة وتجربة ممتازة",
                price=2500,
                image_url="https://picsum.photos/seed/web1/400/300",
                category="تصميم وتطوير"
            ),
            Service(
                title="تطبيقات موبايل",
                description="تطوير تطبيقات موبايل حديثة لنظامي iOS و Android بأحدث التقنيات",
                price=3500,
                image_url="https://picsum.photos/seed/app1/400/300",
                category="تصميم وتطوير"
            ),
            Service(
                title="تسويق رقمي",
                description="حملات تسويق رقمية متكاملة تضمن وصول منتجك للجمهور المستهدف",
                price=1500,
                image_url="https://picsum.photos/seed/marketing1/400/300",
                category="تسويق"
            )
        ]
        
        for service in sample_services:
            db.session.add(service)
        db.session.commit()

# API Endpoints
@app.route('/api/services')
def api_services():
    try:
        services = Service.query.filter_by(status='active').order_by(Service.created_at.desc()).all()
        services_data = [service.to_dict() for service in services]
        response = jsonify(services_data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services/<int:service_id>')
def api_service_detail(service_id):
    try:
        service = Service.query.filter_by(id=service_id).first()
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        return jsonify(service.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Web Pages
@app.route('/admin/services')
def admin_services():
    try:
        services = Service.query.order_by(Service.created_at.desc()).all()
        return render_template('admin/services.html', services=services)
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return render_template('admin/services.html', services=[])

@app.route('/admin/services/create', methods=['GET', 'POST'])
def create_service():
    if request.method == 'GET':
        return render_template('admin/create_service.html')
    
    try:
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', '').strip()
        category = request.form.get('category', '').strip()
        image_url = request.form.get('image_url', '').strip()
        
        if not title or not description:
            flash('العنوان والوصف مطلوبان', 'error')
            return render_template('admin/create_service.html')
        
        new_service = Service(
            title=title,
            description=description,
            price=float(price) if price else None,
            image_url=image_url,
            category=category
        )
        
        db.session.add(new_service)
        db.session.commit()
        flash('تم إضافة الخدمة بنجاح', 'success')
        return redirect(url_for('admin_services'))
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return render_template('admin/create_service.html')

@app.route('/admin/services/<int:service_id>/edit', methods=['GET', 'POST'])
def edit_service(service_id):
    service = Service.query.filter_by(id=service_id).first()
    
    if not service:
        flash('الخدمة غير موجودة', 'error')
        return redirect(url_for('admin_services'))
    
    if request.method == 'POST':
        try:
            title = request.form.get('title', '').strip()
            description = request.form.get('description', '').strip()
            price = request.form.get('price', '').strip()
            category = request.form.get('category', '').strip()
            image_url = request.form.get('image_url', '').strip()
            
            if not title or not description:
                flash('العنوان والوصف مطلوبان', 'error')
                return render_template('admin/edit_service.html', service=service)
            
            service.title = title
            service.description = description
            service.price = float(price) if price else None
            service.category = category
            service.image_url = image_url
            service.updated_at = datetime.utcnow()
            
            db.session.commit()
            flash('تم تحديث الخدمة بنجاح', 'success')
            return redirect(url_for('admin_services'))
        except Exception as e:
            flash(f'خطأ: {str(e)}', 'error')
            return render_template('admin/edit_service.html', service=service)
    
    return render_template('admin/edit_service.html', service=service)

@app.route('/admin/services/<int:service_id>/delete', methods=['POST'])
def delete_service(service_id):
    try:
        service = Service.query.filter_by(id=service_id).first()
        
        if not service:
            flash('الخدمة غير موجودة', 'error')
            return redirect(url_for('admin_services'))
        
        db.session.delete(service)
        db.session.commit()
        flash('تم حذف الخدمة بنجاح', 'success')
        return redirect(url_for('admin_services'))
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return redirect(url_for('admin_services'))

# Image Upload
@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'لا يوجد ملف مرفوع'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'لم يتم اختيار ملف'}), 400
    
    if file:
        # Check file extension
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        filename = file.filename
        if '.' in filename and filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
            return jsonify({'error': 'امتداد الملف غير مدعوم'}), 400
        
        # Generate unique filename
        unique_filename = f"service_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        # Save file
        file.save(file_path)
        image_url = f"/static/uploads/{unique_filename}"
        
        return jsonify({'success': True, 'image_url': image_url})
    
    return jsonify({'error': 'فشل رفع الملف'}), 500

# Categories API
@app.route('/api/categories')
def get_categories():
    try:
        categories = db.session.query(Service.category).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]
        return jsonify(category_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)