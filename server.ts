import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const DATA_FILE = path.join(process.cwd(), "data.json");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Helper to read data
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return {
      users: [],
      customers: [],
      products: [],
      invoices: [],
      invoice_items: [],
      expenses: [],
      payroll: []
    };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

// Helper to write data
const writeData = (data: any) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Initialize Data and Seed
let data = readData();

if (data.users.length === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  data.users.push({
    id: 1,
    name: "Admin User",
    email: "admin@artha.com",
    password: hashedPassword,
    role: "admin",
    created_at: new Date().toISOString()
  });

  // Seed Customers
  data.customers = [
    { id: 1, name: 'Acme Corp', email: 'contact@acme.com', phone: '9876543210', gst_number: '27AAACA1234A1Z5', address: 'Mumbai, Maharashtra', credit_limit: 500000, created_at: new Date().toISOString() },
    { id: 2, name: 'Global Tech Solutions', email: 'info@globaltech.in', phone: '9123456789', gst_number: '07AABCG5678G1Z2', address: 'Bangalore, Karnataka', credit_limit: 1000000, created_at: new Date().toISOString() },
    { id: 3, name: 'Retail Hub', email: 'sales@retailhub.com', phone: '8887776665', gst_number: '19AADEF9012F1Z9', address: 'Kolkata, West Bengal', credit_limit: 200000, created_at: new Date().toISOString() }
  ];

  // Seed Products
  data.products = [
    { id: 1, sku: 'PROD-001', name: 'Enterprise Server Rack', description: 'High-performance server rack for data centers', purchase_price: 45000, selling_price: 65000, stock_quantity: 15, low_stock_threshold: 3, created_at: new Date().toISOString() },
    { id: 2, sku: 'PROD-002', name: 'Cloud Storage License', description: 'Annual subscription for 1TB cloud storage', purchase_price: 2000, selling_price: 4500, stock_quantity: 100, low_stock_threshold: 10, created_at: new Date().toISOString() },
    { id: 3, sku: 'PROD-003', name: 'Workstation Pro', description: 'High-end desktop for engineering tasks', purchase_price: 85000, selling_price: 120000, stock_quantity: 8, low_stock_threshold: 2, created_at: new Date().toISOString() }
  ];

  // Seed Expenses
  data.expenses = [
    { id: 1, category: 'Rent', amount: 45000, description: 'Office rent for Feb', vendor: 'Skyline Properties', payment_mode: 'Bank Transfer', date: '2024-02-01', created_at: new Date().toISOString() },
    { id: 2, category: 'Utilities', amount: 12000, description: 'Electricity and Water', vendor: 'City Power Corp', payment_mode: 'UPI', date: '2024-02-05', created_at: new Date().toISOString() },
    { id: 3, category: 'Marketing', amount: 25000, description: 'Google Ads Campaign', vendor: 'Google India', payment_mode: 'Credit Card', date: '2024-02-10', created_at: new Date().toISOString() }
  ];

  // Seed Payroll
  data.payroll = [
    { id: 1, employee_name: 'Rahul Sharma', designation: 'Senior Developer', basic_salary: 85000, allowances: 15000, deductions: 5000, net_salary: 95000, payment_date: '2024-02-28', status: 'paid', created_at: new Date().toISOString() },
    { id: 2, employee_name: 'Priya Patel', designation: 'UI/UX Designer', basic_salary: 65000, allowances: 10000, deductions: 3000, net_salary: 72000, payment_date: '2024-02-28', status: 'paid', created_at: new Date().toISOString() },
    { id: 3, employee_name: 'Amit Singh', designation: 'Accountant', basic_salary: 45000, allowances: 5000, deductions: 2000, net_salary: 48000, payment_date: '2024-02-28', status: 'paid', created_at: new Date().toISOString() }
  ];

  writeData(data);
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
  const data = readData();
  const user = data.users.find((u: any) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// --- Dashboard Stats ---
app.get("/api/stats", authenticateToken, (req, res) => {
  const data = readData();
  const revenue = data.invoices.filter((i: any) => i.status !== 'cancelled').reduce((acc: number, i: any) => acc + i.total_amount, 0);
  const expenses = data.expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const unpaid = data.invoices.filter((i: any) => i.status === 'unpaid').reduce((acc: number, i: any) => acc + i.total_amount, 0);
  
  // Group by month
  const salesByMonth: any = {};
  data.invoices.forEach((inv: any) => {
    const month = inv.created_at.substring(0, 7);
    salesByMonth[month] = (salesByMonth[month] || 0) + inv.total_amount;
  });

  const monthlySales = Object.keys(salesByMonth).map(month => ({
    month,
    total: salesByMonth[month]
  })).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6);

  res.json({
    totalRevenue: revenue,
    totalExpenses: expenses,
    netProfit: revenue - expenses,
    outstandingInvoices: unpaid,
    monthlySales
  });
});

// --- Customers ---
app.get("/api/customers", authenticateToken, (req, res) => {
  const data = readData();
  res.json(data.customers.sort((a: any, b: any) => a.name.localeCompare(b.name)));
});

app.post("/api/customers", authenticateToken, (req, res) => {
  const data = readData();
  const newCustomer = {
    id: data.customers.length > 0 ? Math.max(...data.customers.map((c: any) => c.id)) + 1 : 1,
    ...req.body,
    credit_limit: req.body.credit_limit || 0,
    created_at: new Date().toISOString()
  };
  data.customers.push(newCustomer);
  writeData(data);
  res.json({ id: newCustomer.id });
});

// --- Products ---
app.get("/api/products", authenticateToken, (req, res) => {
  const data = readData();
  res.json(data.products);
});

app.post("/api/products", authenticateToken, (req, res) => {
  const data = readData();
  const newProduct = {
    id: data.products.length > 0 ? Math.max(...data.products.map((p: any) => p.id)) + 1 : 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.products.push(newProduct);
  writeData(data);
  res.json({ id: newProduct.id });
});

// --- Invoices ---
app.get("/api/invoices", authenticateToken, (req, res) => {
  const data = readData();
  const invoices = data.invoices.map((inv: any) => {
    const customer = data.customers.find((c: any) => c.id === Number(inv.customer_id));
    return {
      ...inv,
      customer_name: customer ? customer.name : 'Unknown'
    };
  }).sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
  res.json(invoices);
});

app.post("/api/invoices", authenticateToken, (req, res) => {
  const { customer_id, items, due_date } = req.body;
  const data = readData();
  
  const invoice_number = `INV-${Date.now()}`;
  let total_amount = 0;
  let tax_amount = 0;

  const invoiceId = data.invoices.length > 0 ? Math.max(...data.invoices.map((i: any) => i.id)) + 1 : 1;

  for (const item of items) {
    const productIndex = data.products.findIndex((p: any) => p.id === Number(item.product_id));
    if (productIndex !== -1) {
      const product = data.products[productIndex];
      const lineTotal = item.quantity * product.selling_price;
      const lineTax = lineTotal * (item.tax_rate / 100);
      
      total_amount += lineTotal + lineTax;
      tax_amount += lineTax;

      data.invoice_items.push({
        id: data.invoice_items.length > 0 ? Math.max(...data.invoice_items.map((ii: any) => ii.id)) + 1 : 1,
        invoice_id: invoiceId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.selling_price,
        tax_rate: item.tax_rate
      });

      // Update Stock
      data.products[productIndex].stock_quantity -= item.quantity;
    }
  }

  data.invoices.push({
    id: invoiceId,
    invoice_number,
    customer_id,
    total_amount,
    tax_amount,
    status: 'unpaid',
    due_date,
    created_at: new Date().toISOString()
  });

  writeData(data);
  res.json({ id: invoiceId, invoice_number });
});

// --- Expenses ---
app.get("/api/expenses", authenticateToken, (req, res) => {
  const data = readData();
  res.json(data.expenses.sort((a: any, b: any) => b.date.localeCompare(a.date)));
});

app.post("/api/expenses", authenticateToken, (req, res) => {
  const data = readData();
  const newExpense = {
    id: data.expenses.length > 0 ? Math.max(...data.expenses.map((e: any) => e.id)) + 1 : 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.expenses.push(newExpense);
  writeData(data);
  res.json({ id: newExpense.id });
});

// --- Payroll ---
app.get("/api/payroll", authenticateToken, (req, res) => {
  const data = readData();
  res.json(data.payroll.sort((a: any, b: any) => b.payment_date.localeCompare(a.payment_date)));
});

app.post("/api/payroll", authenticateToken, (req, res) => {
  const data = readData();
  const newPayroll = {
    id: data.payroll.length > 0 ? Math.max(...data.payroll.map((p: any) => p.id)) + 1 : 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.payroll.push(newPayroll);
  writeData(data);
  res.json({ id: newPayroll.id });
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
