from flask import Flask, render_template, request, jsonify, session, redirect
import pymysql
import os
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename


app = Flask(__name__)
app.secret_key = "supersecret"  # session key
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
# =====================
# DATABASE CONNECTION
# =====================
def get_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="samruddhi123",
        database="newdb1",
        autocommit=True
    )

# HOME PAGE
# =====================

# =====================
# SIGNUP
# =====================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json or request.form
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"status": "error", "msg": "Please provide username and password"})

    hashed_password = generate_password_hash(password)

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    try:
        cursor.execute(
            "INSERT INTO users1 (username, password) VALUES (%s, %s)",
            (username, hashed_password)
        )

        con.close()   # ✅ CLOSE CONNECTION

        return jsonify({"status": "success"})

    except pymysql.err.IntegrityError:
        con.close()   # ✅ CLOSE CONNECTION
        return jsonify({"status": "error", "msg": "Username already exists"})

    except Exception as e:
        con.close()   # ✅ CLOSE CONNECTION
        return jsonify({"status": "error", "msg": str(e)})

# =====================
# LOGIN
# =====================
@app.route("/login", methods=["POST"])
def login():
    data = request.json or request.form
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"status": "error", "msg": "Please provide username and password"})

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(
        "SELECT password FROM users1 WHERE username=%s",
        (username,)
    )
    result = cursor.fetchone()

    con.close()   # ✅ CLOSE CONNECTION

    # ✅ USER NOT FOUND
    if not result:
        return jsonify({
            "status": "error",
            "msg": "Please Signup First"
        })

    # ✅ PASSWORD CORRECT
    elif check_password_hash(result[0], password):
        session["user"] = username

        role = "admin" if username == "admin" else "user"
        session["role"] = role

        return jsonify({
            "status": "success",
            "username": username,
            "role": role
        })

    # ✅ WRONG PASSWORD
    else:
        return jsonify({
            "status": "error",
            "msg": "Invalid Password"
        })



   
# FOOD IMAGE MAPPING
FOOD_IMAGES = {
    "Vada Pav": "https://i.imgur.com/abcd123.png",
    "samosa": "https://i.imgur.com/wxyz456.jpg",
    "Veg Manchurian": "https://i.imgur.com/qwer789.png",
    "Veg Noodles": "https://i.imgur.com/tyui012.jpg"
}

# =====================
# ORDER PAGE
# =====================
@app.route("/")
def home():
    username = session.get("user", "")

    con = get_connection()
    cursor = con.cursor()

    # Fetch menu items
    cursor.execute("SELECT * FROM menu WHERE available = 1 AND prepared > 0")
    menu_items = cursor.fetchall()

    # Fetch user's bill if logged in
    bill_items = []
    grand_total = 0
    if username:
        cursor.execute("""
            SELECT o.food_name, o.quantity, m.price, (o.quantity * m.price) AS total
            FROM orders o
            JOIN menu m ON o.food_name = m.name
            WHERE o.username=%s
        """, (username,))
        bill_items = cursor.fetchall()
        grand_total = sum(item[3] for item in bill_items)  # item[3] = total

    con.close()

    return render_template(
        "index.html",
        username=username,
        menu_items=menu_items,
        bill_items=bill_items,
        grand_total=grand_total
    )



  
# =====================
# PLACE ORDER
#orders table
  # =====================
# PLACE ORDER
# orders table
@app.route("/place_order", methods=["POST"])
def place_order():
    data = request.json
    food_name = data.get("food_name")
    quantity = data.get("quantity")
    upi_pin = data.get("upi_pin")

    payment_method_raw = data.get("payment_method")
    payment_method = (payment_method_raw or "").strip().lower()

    import uuid
    from datetime import datetime

    username = session.get("user")

    if not username:
        return jsonify({"status": "error", "msg": "User not logged in"})

    if not food_name or not quantity:
        return jsonify({"status": "error", "msg": "Missing food name or quantity"})

    FOOD_IMAGES = {
        "Vada Pav": "https://i.imgur.com/abcd123.png",
        "Samosa": "https://i.imgur.com/wxyz456.jpg",
        "Veg Manchurian": "https://i.imgur.com/qwer789.png",
        "Veg Noodles": "https://i.imgur.com/tyui012.jpg"
    }

    food_img = FOOD_IMAGES.get(food_name, "/static/images/default.jpg")

    if payment_method == "cash":
        payment_status = "Pending"
        transaction_id = None
        order_status = "Pending"
        display_transaction_id = "Not Paid Yet"

    elif payment_method == "upi":
        if not upi_pin or len(upi_pin) != 4 or not upi_pin.isdigit():
            return jsonify({"status": "error", "msg": "UPI PIN must be exactly 4 digits"})
        payment_status = "Paid"
        transaction_id = "TXN" + str(uuid.uuid4())[:8]
        order_status = "Ready"

    elif payment_method == "card":
        payment_status = "Paid"
        transaction_id = "CARD" + str(uuid.uuid4())[:8]
        order_status = "Ready"

    else:
        return jsonify({"status": "error", "msg": "Invalid payment method"})

    try:
        # ✅ OPEN NEW CONNECTION
        con = get_connection()
        cursor = con.cursor()

        cursor.execute(
            """INSERT INTO orders 
            (username, food_name, quantity, status, image, payment_method, payment_status, transaction_id, payment_time) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (username, food_name, quantity, order_status, food_img,
             payment_method, payment_status, transaction_id, datetime.now())
        )

        con.close()   # ✅ CLOSE CONNECTION

        return jsonify({
            "status": payment_status,
            "transaction_id": display_transaction_id if payment_method == "cash" else transaction_id
        })

    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)})

    #logout
from flask import Flask, session, redirect, jsonify, request

@app.route("/logout", methods=["GET", "POST"])
def logout():
    session.clear()  # remove all session data

    # If it's a JS fetch POST request, return JSON
    if request.method == "POST":
        return jsonify({"status": "success"})

    # If it's a normal GET (clicked link), redirect
    return redirect("/")
# =====================
# ADMIN PAGE
# =====================
@app.route("/admin")
def admin_page():
    if session.get("role") != "admin":
        return redirect("/")

    tab = request.args.get("tab", "dashboard")

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    # Orders
    cursor.execute("SELECT * FROM orders ORDER BY id DESC")
    orders = cursor.fetchall()

    # Dashboard stats
    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users1")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders WHERE status='Pending'")
    pending_orders = cursor.fetchone()[0]

    completed_orders = total_orders - pending_orders

    cursor.execute("""
        SELECT SUM(o.quantity * m.price)
        FROM orders o
        JOIN menu m ON o.food_name = m.name
        WHERE o.payment_status = 'Paid'
    """)
    revenue_data = cursor.fetchone()[0]
    total_revenue = revenue_data if revenue_data else 0

    # Menu
    cursor.execute("SELECT * FROM menu")
    menu_items = cursor.fetchall()

    # Top items
    cursor.execute(
        "SELECT food_name, SUM(quantity) FROM orders GROUP BY food_name ORDER BY SUM(quantity) DESC LIMIT 5"
    )
    top_items_data = cursor.fetchall()
    top_items = [row[0] for row in top_items_data]
    top_items_counts = [row[1] for row in top_items_data]

    # Reports
    cursor.execute("SELECT * FROM reports ORDER BY id DESC")
    reports = cursor.fetchall()

    cursor.execute("SELECT * FROM waste_reports ORDER BY created_at DESC")
    waste_reports = cursor.fetchall()
    cursor.execute("""
    SELECT food_name, AVG(waste_percent)
    FROM waste_reports
    GROUP BY food_name
    ORDER BY AVG(waste_percent) DESC
    LIMIT 1
""")

    most_wasted = cursor.fetchone()

    if most_wasted:



        if most_wasted[1] > 25:


            suggestion = "Reduce preparation quantity."
        else:
            suggestion = "Preparation level is optimal."
    else:


        suggestion = "No waste data available."
# ===== END BLOCK =====

    cursor.execute("SELECT username FROM users1")
    users = cursor.fetchall()
    cursor.execute("""
        SELECT username, COUNT(*)
        FROM orders
        GROUP BY username
    """)
    orders_data = cursor.fetchall()
    user_orders = {row[0]: row[1] for row in orders_data}
    cursor.execute("""
        SELECT o.username, SUM(o.quantity * m.price)
        FROM orders o
        JOIN menu m ON o.food_name = m.name
        WHERE o.payment_status='Paid'
        GROUP BY o.username
    """)
    paid_data = cursor.fetchall()
    user_paid = {row[0]: row[1] for row in paid_data}


    

    # ✅ CLOSE CONNECTION
    con.close()

    return render_template(
        "admin.html",
        active=tab,
        orders=orders,
        total_orders=total_orders,
        total_users=total_users,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        total_revenue=total_revenue,
        menu_items=menu_items,
        top_items=top_items,
        top_items_counts=top_items_counts,
        reports=reports,
        waste_reports=waste_reports,
        users=users,
        user_orders=user_orders,
        user_paid=user_paid,
        most_wasted=most_wasted,
        suggestion=suggestion
    )


 # =====================
# ADD WASTE REPORT (ADMIN ONLY)
# =====================
@app.route("/add_waste_report", methods=["POST"])
def add_waste_report():
    if session.get("role") != "admin":
        return redirect("/")

    food_name = request.form.get("food_name")
    prepared = int(request.form.get("prepared"))
    sold = int(request.form.get("sold"))

    waste_percent = ((prepared - sold) / prepared) * 100 if prepared > 0 else 0

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(
        "INSERT INTO waste_reports (food_name, prepared, sold, waste_percent) VALUES (%s, %s, %s, %s)",
        (food_name, prepared, sold, waste_percent)
    )

    con.close()   # ✅ CLOSE CONNECTION

    return redirect("/admin?tab=reports")


         
          
          
          

    
       

    
   
   

    
      
# =====================
# DELETE WASTE REPORT (ADMIN ONLY)
# =====================
@app.route("/delete_waste_report", methods=["POST"])
def delete_waste_report():
    if session.get("role") != "admin":
        return redirect("/")

    report_id = request.form.get("id")

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(
        "DELETE FROM waste_reports WHERE id=%s",
        (report_id,)
    )

    con.close()   # ✅ CLOSE CONNECTION

    return redirect("/admin?tab=reports")


@app.route("/donate_food", methods=["POST"])
def donate_food():

    if session.get("role") != "admin":
        return redirect("/")

    food_name = request.form.get("food_name")
    prepared = request.form.get("prepared")
    sold = request.form.get("sold")
    waste_percent = request.form.get("waste_percent")
    donate_to = request.form.get("donate_to")

    con = get_connection()
    cursor = con.cursor()

    cursor.execute("""
        INSERT INTO donation 
        (food_name, prepared, sold, waste_percent, donate_to)
        VALUES (%s,%s,%s,%s,%s)
    """,(food_name, prepared, sold, waste_percent, donate_to))

    con.close()

    return redirect("/admin?tab=reports")
    # =====================
# ADD MENU ITEM (ADMIN ONLY)
# =====================
@app.route("/add_menu", methods=["POST"])
def add_menu():
    if session.get("role") != "admin":
        return redirect("/")

    name = request.form.get("name")
    price = request.form.get("price")
    prepared = request.form.get("prepared")
    available = request.form.get("available")

    # Handle uploaded file
    file = request.files.get("image")
    if file and file.filename != "":
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        image_url = f"/{filepath.replace('\\','/')}"
    else:
        image_url = "/static/images/default.jpg"

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(
        "INSERT INTO menu (name, price, image, available, prepared) VALUES (%s, %s, %s, %s, %s)",
        (name, price, image_url, available, prepared)
    )

    con.close()   # ✅ CLOSE CONNECTION

    return redirect("/admin?tab=menu")

    
     
    

# =====================
# UPDATE ORDER STATUS (ADMIN)
# =====================
@app.route("/update_status", methods=["POST"])
def update_status():
    if session.get("role") != "admin":
        return redirect("/login")

    order_id = request.form["id"]
    status = request.form["status"]
    message = request.form.get("admin_message", "")

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    if status == "Delete":
        cursor.execute("DELETE FROM orders WHERE id=%s", (order_id,))
        con.close()
        return redirect("/admin")

    # Update order status + admin message
    cursor.execute(
        "UPDATE orders SET status=%s, admin_message=%s WHERE id=%s",
        (status, message, order_id)
    )

    # If order is Ready → reset notified
    if status == "Ready":
        cursor.execute(
            "UPDATE orders SET notified=0 WHERE id=%s",
            (order_id,)
        )

    con.close()  # ✅ CLOSE CONNECTION

    return redirect("/admin")

# UPDATE MENU (ADMIN ONLY)
# =====================
@app.route("/update_menu", methods=["POST"])
def update_menu():
    if session.get("role") != "admin":
        return redirect("/")

    menu_id = request.form.get("id")
    price = request.form.get("price")
    prepared = request.form.get("prepared")
    available = int(request.form.get("available"))  # ✅ correct

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(
        """
        UPDATE menu
        SET price=%s, available=%s, prepared=%s
        WHERE id=%s
        """,
        (price, available, prepared, menu_id)
    )

    con.close()   # ✅ CLOSE CONNECTION

    return redirect("/admin?tab=menu")

    # =====================
# DELETE MENU (ADMIN ONLY)
# =====================
@app.route("/delete_menu", methods=["POST"])
def delete_menu():
    if session.get("role") != "admin":
        return redirect("/")

    menu_id = request.form.get("id")

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute("DELETE FROM menu WHERE id=%s", (menu_id,))

    con.close()   # ✅ CLOSE CONNECTION

    return redirect("/admin?tab=menu")

    # =====================
# CHECK READY ORDERS FOR LOGGED-IN USER
# =====================
@app.route("/check_my_order_ready")
def check_my_order_ready():
    username = session.get("user")
    if not username:
        return jsonify({"status": "error", "msg": "User not logged in"})

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(
        "SELECT id, food_name FROM orders WHERE username=%s AND status='Ready' AND notified=0",
        (username,)
    )
    ready_orders = cursor.fetchall()

    con.close()   # ✅ CLOSE CONNECTION

    orders_list = [{"id": o[0], "food_name": o[1]} for o in ready_orders]

    return jsonify({"status": "success", "ready_orders": orders_list})


# MARK ORDER AS NOTIFIED
# =====================
@app.route("/mark_my_order_notified", methods=["POST"])
def mark_my_order_notified():
    username = session.get("user")
    if not username:
        return jsonify({"status": "error", "msg": "User not logged in"})

    data = request.json
    order_id = data.get("order_id")

    # ✅ OPEN NEW CONNECTION
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(
        "UPDATE orders SET notified=1 WHERE id=%s AND username=%s",
        (order_id, username)
    )

    con.close()   # ✅ CLOSE CONNECTION

    return jsonify({"status": "success"})

# =====================
# VIEW BILL (ADMIN ONLY)
# =====================
@app.route("/view_bill/<username>")
def view_bill(username):
    if session.get("role") != "admin" and session.get("user") != username:

        return redirect("/")

    con = get_connection()
    cursor = con.cursor()

    cursor.execute("""
    SELECT o.food_name, o.quantity,
           IFNULL(m.price,0) AS price,
           (o.quantity * IFNULL(m.price,0)) AS total
    FROM orders o
    LEFT JOIN menu m ON o.food_name = m.name
    WHERE o.username = %s
""", (username,))

    bill_items = cursor.fetchall()

    grand_total = sum(item[3] for item in bill_items)

    con.close()

    return render_template(
        "bill.html",
        username=username,
        bill_items=bill_items,
        grand_total=grand_total
    )

# =====================
# DELETE USER (ADMIN ONLY)
# =====================
@app.route("/delete_user/<username>")
def delete_user(username):
    if session.get("role") != "admin":
        return redirect("/")

    con = get_connection()
    cursor = con.cursor()

    # First delete user's orders (important)
    cursor.execute("DELETE FROM orders WHERE username=%s", (username,))

    # Then delete user from users1 table
    cursor.execute("DELETE FROM users1 WHERE username=%s", (username,))

    con.close()

    return redirect("/admin?tab=users")






    

   

    
   
# =====================
if __name__ == "__main__":
    app.run(debug=True)