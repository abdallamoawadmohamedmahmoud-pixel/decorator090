try:
    from flask import Flask, render_template
    from flask_sqlalchemy import SQLAlchemy
    print("Flask imported successfully")
except ImportError as e:
    print(f"Flask import error: {e}")
    try:
        from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
        print("SQLAlchemy core imported successfully")
    except ImportError as e:
        print(f"SQLAlchemy import error: {e}")
    
    try:
        from sqlalchemy.ext.declarative import declarative_base
        print("SQLAlchemy declarative imported successfully")
    except ImportError as e:
        print(f"SQLAlchemy ext.declarative import error: {e}")
    
    try:
        from sqlalchemy.orm import sessionmaker, scoped_session
        print("SQLAlchemy ORM imported successfully")
    except ImportError as e:
        print(f"SQLAlchemy ORM import error: {e}")
    
    from datetime import datetime
    print("Date/Time imported successfully")
except ImportError as e:
        print(f"Date/Time import error: {e}")
    
    import os
    print("OS module imported successfully")
    
except Exception as e:
    print(f"Error during imports: {e}")

# Database Configuration
try:
    DATABASE_URL = 'sqlite:///services.db'
    engine = create_engine(DATABASE_URL)
    Base = declarative_base()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False)
    
    # Create tables
    Base.metadata.create_all(engine)
    print("Database created successfully")
except Exception as e:
    print(f"Database configuration error: {e}")

# Import Flask app from separate file
try:
    from app import app
    print("Flask app imported successfully")
except ImportError as e:
    print(f"App import error: {e}")
    
    print("Starting Flask server...")

# Database Configuration
DATABASE_URL = 'sqlite:///services.db'
engine = create_engine(DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False)
db_session = scoped_session(SessionLocal)

# Database Models
class Service(Base):
    __tablename__ = 'services'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=True)
    image_url = Column(String(200), nullable=True)
    category = Column(String(50), nullable=True)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

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
Base.metadata.create_all(engine)

# Flask App
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database session
def get_db_session():
    return db_session()

# API Endpoints
@app.route('/api/services')
def api_services():
    try:
        session = get_db_session()
        services = session.query(Service).all()
        services_data = [service.to_dict() for service in services]
        return jsonify(services_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/services/<int:service_id>')
def api_service_detail(service_id):
    try:
        session = get_db_session()
        service = session.query(Service).filter(Service.id == service_id).first()
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        return jsonify(service.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Web Pages
@app.route('/admin/services')
def admin_services():
    try:
        session = get_db_session()
        services = session.query(Service).order_by(Service.created_at.desc()).all()
        return render_template('admin/services.html', services=services)
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return render_template('admin/services.html', services=[])

@app.route('/services')
def services():
    try:
        session = get_db_session()
        services = session.query(Service).filter(Service.status == 'active').order_by(Service.created_at.desc()).all()
        return render_template('public/services.html', services=services)
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return render_template('public/services.html', services=[])

@app.route('/services/<int:service_id>')
def service_detail(service_id):
    try:
        session = get_db_session()
        service = session.query(Service).filter(Service.id == service_id).first()
        if not service:
            flash('الخدمة غير موجودة', 'error')
            return redirect(url_for('services'))
        return render_template('public/service_detail.html', service=service)
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return redirect(url_for('services'))

# CRUD Operations
@app.route('/admin/services/create', methods=['POST'])
def create_service():
    try:
        session = get_db_session()
        
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', '').strip()
        category = request.form.get('category', '').strip()
        image_url = request.form.get('image_url', '').strip()
        
        if not title or not description:
            flash('العنوان والوصف مطلوبان', 'error')
            return redirect(url_for('admin_services'))
        
        new_service = Service(
            title=title,
            description=description,
            price=float(price) if price else None,
            image_url=image_url,
            category=category
        )
        
        session.add(new_service)
        session.commit()
        flash('تم إضافة الخدمة بنجاح', 'success')
        return redirect(url_for('admin_services'))
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return redirect(url_for('admin_services'))
    finally:
        get_db_session().remove()

@app.route('/admin/services/<int:service_id>/edit', methods=['GET', 'POST'])
def edit_service(service_id):
    try:
        session = get_db_session()
        service = session.query(Service).filter(Service.id == service_id).first()
        
        if not service:
            flash('الخدمة غير موجودة', 'error')
            return redirect(url_for('admin_services'))
        
        if request.method == 'POST':
            title = request.form.get('title', '').strip()
            description = request.form.get('description', '').strip()
            price = request.form.get('price', '').strip()
            category = request.form.get('category', '').strip()
            image_url = request.form.get('image_url', '').strip()
            
            if not title or not description:
                flash('العنوان والوصف مطلوبان', 'error')
                return redirect(url_for('admin_services'))
            
            service.title = title
            service.description = description
            service.price = float(price) if price else None
            service.category = category
            service.image_url = image_url
            service.updated_at = datetime.utcnow()
            
            session.commit()
            flash('تم تحديث الخدمة بنجاح', 'success')
            return redirect(url_for('admin_services'))
        
        return render_template('admin/edit_service.html', service=service)
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return redirect(url_for('admin_services'))
    finally:
        get_db_session().remove()

@app.route('/admin/services/<int:service_id>/delete', methods=['POST'])
def delete_service(service_id):
    try:
        session = get_db_session()
        service = session.query(Service).filter(Service.id == service_id).first()
        
        if not service:
            flash('الخدمة غير موجودة', 'error')
            return redirect(url_for('admin_services'))
        
        session.delete(service)
        session.commit()
        flash('تم حذف الخدمة بنجاح', 'success')
        return redirect(url_for('admin_services'))
    except Exception as e:
        flash(f'خطأ: {str(e)}', 'error')
        return redirect(url_for('admin_services'))
    finally:
        get_db_session().remove()

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
        session = get_db_session()
        categories = session.query(Service.category).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]
        return jsonify(category_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)