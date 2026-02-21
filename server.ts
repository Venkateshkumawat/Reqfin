import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("accounting.db");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gst_number TEXT,
    address TEXT,
    credit_limit REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    purchase_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    tax_amount REAL NOT NULL,
    status TEXT DEFAULT 'unpaid',
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    tax_rate REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    vendor TEXT,
    payment_mode TEXT,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL,
    designation TEXT,
    basic_salary REAL NOT NULL,
    allowances REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    net_salary REAL NOT NULL,
    payment_date DATE NOT NULL,
    status TEXT DEFAULT 'paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Admin User if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@artha.com");
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Admin User",
    "admin@artha.com",
    hashedPassword,
    "admin"
  );
}

// Seed Demo Data if empty
const customerCount = (db.prepare("SELECT COUNT(*) as count FROM customers").get() as any).count;
if (customerCount === 0) {
  // Seed Customers
  const customers = [
    ['Acme Corp', 'contact@acme.com', '9876543210', '27AAACA1234A1Z5', 'Mumbai, Maharashtra', 500000],
    ['Global Tech Solutions', 'info@globaltech.in', '9123456789', '07AABCG5678G1Z2', 'Bangalore, Karnataka', 1000000],
    ['Retail Hub', 'sales@retailhub.com', '8887776665', '19AADEF9012F1Z9', 'Kolkata, West Bengal', 200000]
  ];
  const insertCustomer = db.prepare("INSERT INTO customers (name, email, phone, gst_number, address, credit_limit) VALUES (?, ?, ?, ?, ?, ?)");
  customers.forEach(c => insertCustomer.run(...c));

  // Seed Products
  const products = [
    ['PROD-001', 'Enterprise Server Rack', 'High-performance server rack for data centers', 45000, 65000, 15, 3],
    ['PROD-002', 'Cloud Storage License', 'Annual subscription for 1TB cloud storage', 2000, 4500, 100, 10],
    ['PROD-003', 'Workstation Pro', 'High-end desktop for engineering tasks', 85000, 120000, 8, 2]
  ];
  const insertProduct = db.prepare("INSERT INTO products (sku, name, description, purchase_price, selling_price, stock_quantity, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?)");
  products.forEach(p => insertProduct.run(...p));

  // Seed Expenses
  const expenses = [
    ['Rent', 45000, 'Office rent for Feb', 'Skyline Properties', 'Bank Transfer', '2024-02-01'],
    ['Utilities', 12000, 'Electricity and Water', 'City Power Corp', 'UPI', '2024-02-05'],
    ['Marketing', 25000, 'Google Ads Campaign', 'Google India', 'Credit Card', '2024-02-10']
  ];
  const insertExpense = db.prepare("INSERT INTO expenses (category, amount, description, vendor, payment_mode, date) VALUES (?, ?, ?, ?, ?, ?)");
  expenses.forEach(e => insertExpense.run(...e));

  // Seed Payroll
  const payroll = [
    ['Rahul Sharma', 'Senior Developer', 85000, 15000, 5000, 95000, '2024-02-28'],
    ['Priya Patel', 'UI/UX Designer', 65000, 10000, 3000, 72000, '2024-02-28'],
    ['Amit Singh', 'Accountant', 45000, 5000, 2000, 48000, '2024-02-28']
  ];
  const insertPayroll = db.prepare("INSERT INTO payroll (employee_name, designation, basic_salary, allowances, deductions, net_salary, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
  payroll.forEach(p => insertPayroll.run(...p));
}

const app = express();
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- Dashboard Stats ---
app.get("/api/stats", authenticateToken, (req, res) => {
  const revenue = db.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE status != 'cancelled'").get() as any;
  const expenses = db.prepare("SELECT SUM(amount) as total FROM expenses").get() as any;
  const unpaid = db.prepare("SELECT SUM(total_amount) as total FROM invoices WHERE status = 'unpaid'").get() as any;
  
  const monthlySales = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, SUM(total_amount) as total 
    FROM invoices 
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 6
  `).all();

  res.json({
    totalRevenue: revenue.total || 0,
    totalExpenses: expenses.total || 0,
    netProfit: (revenue.total || 0) - (expenses.total || 0),
    outstandingInvoices: unpaid.total || 0,
    monthlySales
  });
});

// --- Customers ---
app.get("/api/customers", authenticateToken, (req, res) => {
  const customers = db.prepare("SELECT * FROM customers ORDER BY name ASC").all();
  res.json(customers);
});

app.post("/api/customers", authenticateToken, (req, res) => {
  const { name, email, phone, gst_number, address, credit_limit } = req.body;
  const result = db.prepare(
    "INSERT INTO customers (name, email, phone, gst_number, address, credit_limit) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(name, email, phone, gst_number, address, credit_limit || 0);
  res.json({ id: result.lastInsertRowid });
});

// --- Products ---
app.get("/api/products", authenticateToken, (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

app.post("/api/products", authenticateToken, (req, res) => {
  const { sku, name, description, purchase_price, selling_price, stock_quantity, low_stock_threshold } = req.body;
  const result = db.prepare(
    "INSERT INTO products (sku, name, description, purchase_price, selling_price, stock_quantity, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(sku, name, description, purchase_price, selling_price, stock_quantity, low_stock_threshold);
  res.json({ id: result.lastInsertRowid });
});

// --- Invoices ---
app.get("/api/invoices", authenticateToken, (req, res) => {
  const invoices = db.prepare(`
    SELECT i.*, c.name as customer_name 
    FROM invoices i 
    JOIN customers c ON i.customer_id = c.id 
    ORDER BY i.created_at DESC
  `).all();
  res.json(invoices);
});

app.post("/api/invoices", authenticateToken, (req, res) => {
  const { customer_id, items, due_date } = req.body;
  
  const invoice_number = `INV-${Date.now()}`;
  let total_amount = 0;
  let tax_amount = 0;

  const transaction = db.transaction(() => {
    const invResult = db.prepare(
      "INSERT INTO invoices (invoice_number, customer_id, total_amount, tax_amount, due_date) VALUES (?, ?, ?, ?, ?)"
    ).run(invoice_number, customer_id, 0, 0, due_date);
    
    const invoiceId = invResult.lastInsertRowid;

    for (const item of items) {
      const product: any = db.prepare("SELECT * FROM products WHERE id = ?").get(item.product_id);
      const lineTotal = item.quantity * product.selling_price;
      const lineTax = lineTotal * (item.tax_rate / 100);
      
      total_amount += lineTotal + lineTax;
      tax_amount += lineTax;

      db.prepare(
        "INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, tax_rate) VALUES (?, ?, ?, ?, ?)"
      ).run(invoiceId, item.product_id, item.quantity, product.selling_price, item.tax_rate);

      // Update Stock
      db.prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?").run(item.quantity, item.product_id);
    }

    db.prepare("UPDATE invoices SET total_amount = ?, tax_amount = ? WHERE id = ?").run(total_amount, tax_amount, invoiceId);
    return invoiceId;
  });

  const id = transaction();
  res.json({ id, invoice_number });
});

// --- Expenses ---
app.get("/api/expenses", authenticateToken, (req, res) => {
  const expenses = db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
  res.json(expenses);
});

app.post("/api/expenses", authenticateToken, (req, res) => {
  const { category, amount, description, vendor, payment_mode, date } = req.body;
  const result = db.prepare(
    "INSERT INTO expenses (category, amount, description, vendor, payment_mode, date) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(category, amount, description, vendor, payment_mode, date);
  res.json({ id: result.lastInsertRowid });
});

// --- Payroll ---
app.get("/api/payroll", authenticateToken, (req, res) => {
  const payroll = db.prepare("SELECT * FROM payroll ORDER BY payment_date DESC").all();
  res.json(payroll);
});

app.post("/api/payroll", authenticateToken, (req, res) => {
  const { employee_name, designation, basic_salary, allowances, deductions, net_salary, payment_date } = req.body;
  const result = db.prepare(
    "INSERT INTO payroll (employee_name, designation, basic_salary, allowances, deductions, net_salary, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(employee_name, designation, basic_salary, allowances, deductions, net_salary, payment_date);
  res.json({ id: result.lastInsertRowid });
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();
