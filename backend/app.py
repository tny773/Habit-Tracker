import os
from datetime import date, datetime, timedelta

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app)

# ---------------- CONFIG ----------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# ---------------- MODELS ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)

class HabitLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    completed = db.Column(db.Boolean, default=True)

class Journal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(20), nullable=False)
    note = db.Column(db.String(300))
    image = db.Column(db.String(300))

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    category = db.Column(db.String(50), default="daily")
    
class Mood(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    date = db.Column(db.String(10))
    mood = db.Column(db.String(10))
    
class Reflection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    date = db.Column(db.String(10))
    text = db.Column(db.Text)

# ---------------- ROUTES ----------------
@app.route("/")
def home():
    return jsonify({"message": "Backend is running 🚀"})

# ---------- AUTH ----------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"error": "User already exists"}), 400

    hashed = bcrypt.generate_password_hash(data.get("password")).decode('utf-8')

    user = User(
        username=data.get("username"),
        email=data.get("email"),
        password=hashed
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email")).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.check_password_hash(user.password, data.get("password")):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })

# ---------- HABITS ----------
@app.route("/habits", methods=["POST"])
def create_habit():
    data = request.get_json()

    habit = Habit(
        title=data.get("title"),
        user_id=data.get("user_id")
    )

    db.session.add(habit)
    db.session.commit()

    return jsonify({"message": "Habit created"}), 201


@app.route("/habits/<int:user_id>", methods=["GET"])
def get_habits(user_id):
    habits = Habit.query.filter_by(user_id=user_id).all()

    return jsonify([
        {"id": h.id, "title": h.title}
        for h in habits
    ])


@app.route("/habits/<int:habit_id>/check", methods=["POST"])
def mark_habit(habit_id):
    today = date.today().isoformat()

    existing = HabitLog.query.filter_by(
        habit_id=habit_id,
        date=today
    ).first()

    if existing:
        return jsonify({"message": "Already marked for today"}), 400

    log = HabitLog(habit_id=habit_id, date=today)
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Marked successfully"})


@app.route("/habits/<int:habit_id>/streak", methods=["GET"])
def get_streak(habit_id):
    logs = HabitLog.query.filter_by(habit_id=habit_id).order_by(HabitLog.date.desc()).all()

    streak = 0
    today = datetime.now().date()

    for log in logs:
        log_date = datetime.strptime(log.date, "%Y-%m-%d").date()

        if log_date == today - timedelta(days=streak):
            streak += 1
        else:
            break

    return jsonify({"streak": streak})
  
@app.route("/habits/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):
    HabitLog.query.filter_by(habit_id=habit_id).delete()

    habit = Habit.query.get(habit_id)

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    db.session.delete(habit)
    db.session.commit()

    return jsonify({"message": "Habit deleted successfully"})

# ---------- JOURNAL ----------
@app.route("/journal", methods=["POST"])
def add_journal():
    user_id = request.form.get("user_id")
    date_val = request.form.get("date")
    note = request.form.get("note")

    file = request.files.get("image")

    image_path = None

    if file:
        filename = file.filename
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        image_path = f"uploads/{filename}"

    existing = Journal.query.filter_by(user_id=user_id, date=date_val).first()

    if existing:
        existing.note = note
        if image_path:
            existing.image = image_path
    else:
        entry = Journal(
            user_id=user_id,
            date=date_val,
            note=note,
            image=image_path
        )
        db.session.add(entry)

    db.session.commit()

    return jsonify({"message": "Journal saved"}), 201


@app.route("/journal/<int:user_id>/<date>", methods=["GET"])
def get_journal(user_id, date):
    entry = Journal.query.filter_by(user_id=user_id, date=date).first()

    if not entry:
        return jsonify({"message": "No entry"}), 404

    return jsonify({
        "note": entry.note,
        "image": entry.image
    })

# ---------- IMAGE SERVING ----------
@app.route("/uploads/<filename>")
def get_image(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ---------- CALENDAR (FIXED ONLY ERROR PART) ----------
@app.route("/calendar/<int:user_id>/<int:year>/<int:month>", methods=["GET"])
def get_calendar(user_id, year, month):
    habits = Habit.query.filter_by(user_id=user_id).all()
    habit_ids = [h.id for h in habits]

    logs = HabitLog.query.filter(HabitLog.habit_id.in_(habit_ids)).all()
    journals = Journal.query.filter_by(user_id=user_id).all()

    result = {}

    for log in logs:
        log_date = datetime.strptime(log.date, "%Y-%m-%d")

        if log_date.year == year and log_date.month == month:
            date_str = log.date

            if date_str not in result:
                result[date_str] = {"habits": 0, "journal": False, "image": None, "mood": None}

            result[date_str]["habits"] += 1

    for j in journals:
        j_date = datetime.strptime(j.date, "%Y-%m-%d")

        if j_date.year == year and j_date.month == month:
            date_str = j.date

            if date_str not in result:
                result[date_str] = {"habits": 0, "journal": False, "image": None, "mood": None}

            result[date_str]["journal"] = True
            result[date_str]["image"] = j.image

            # ✅ FIXED ERROR HERE
            mood = Mood.query.filter_by(user_id=user_id, date=date_str).first()
            result[date_str]["mood"] = mood.mood if mood else None

    return jsonify(result)

# ---------- TODOS ----------
@app.route("/todos", methods=["POST"])
def create_todo():
    data = request.get_json()

    todo = Todo(
        title=data.get("title"),
        user_id=data.get("user_id"),
        category=data.get("category", "daily")
    )

    db.session.add(todo)
    db.session.commit()

    return jsonify({"message": "Todo created"}), 201


@app.route("/todos/<int:user_id>", methods=["GET"])
def get_todos(user_id):
    todos = Todo.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "completed": t.completed,
            "category": t.category
        }
        for t in todos
    ])


@app.route("/todos/<int:todo_id>/toggle", methods=["POST"])
def toggle_todo(todo_id):
    todo = Todo.query.get(todo_id)

    if not todo:
        return jsonify({"error": "Not found"}), 404

    todo.completed = not todo.completed
    db.session.commit()

    return jsonify({"message": "Updated"})


@app.route("/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    todo = Todo.query.get(todo_id)

    if not todo:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(todo)
    db.session.commit()

    return jsonify({"message": "Deleted"})

@app.route("/analytics/<int:user_id>", methods=["GET"])
def analytics(user_id):
    habits = Habit.query.filter_by(user_id=user_id).all()
    habit_ids = [h.id for h in habits]

    logs = HabitLog.query.filter(HabitLog.habit_id.in_(habit_ids)).all()

    total_habits = len(habits)
    total_completions = len(logs)

    last_7_days = {}
    today = datetime.now().date()

    for i in range(7):
        day = today - timedelta(days=i)
        last_7_days[str(day)] = 0

    for log in logs:
        log_date = datetime.strptime(log.date, "%Y-%m-%d").date()
        if str(log_date) in last_7_days:
            last_7_days[str(log_date)] += 1

    return jsonify({
        "total_habits": total_habits,
        "total_completions": total_completions,
        "weekly_activity": last_7_days
    })

# --------------- MOOD ----------------
@app.route("/mood", methods=["POST"])
def save_mood():
    user_id = request.form.get("user_id")
    date = request.form.get("date")
    mood = request.form.get("mood")

    existing = Mood.query.filter_by(user_id=user_id, date=date).first()

    if existing:
        existing.mood = mood
    else:
        new_mood = Mood(user_id=user_id, date=date, mood=mood)
        db.session.add(new_mood)

    db.session.commit()
    return jsonify({"message": "Mood saved"})

# --------------- REFLECTION ----------
@app.route("/reflection", methods=["POST"])
def save_reflection():
    user_id = request.form.get("user_id")
    date = request.form.get("date")
    text = request.form.get("text")

    existing = Reflection.query.filter_by(user_id=user_id, date=date).first()

    if existing:
        existing.text = text
    else:
        new_ref = Reflection(user_id=user_id, date=date, text=text)
        db.session.add(new_ref)

    db.session.commit()
    return jsonify({"message": "Reflection saved"})

@app.route("/reflection/<user_id>/<date>")
def get_reflection(user_id, date):
    ref = Reflection.query.filter_by(user_id=user_id, date=date).first()

    if ref:
        return jsonify({"text": ref.text})
    return jsonify({"text": ""})

# --------------- REVIEW (FIXED DATE ONLY) -------------
@app.route("/weekly/<user_id>")
def weekly_review(user_id):
    today = datetime.today()
    week_data = []

    for i in range(7):
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")

        journal = Journal.query.filter_by(user_id=user_id, date=date).first()
        mood = Mood.query.filter_by(user_id=user_id, date=date).first()
        reflection = Reflection.query.filter_by(user_id=user_id, date=date).first()

        week_data.append({
            "date": date,
            "has_journal": journal is not None,
            "mood": mood.mood if mood else None,
            "reflection": reflection.text if reflection else ""
        })

    return jsonify(week_data)

# ---------------- RUN ----------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)