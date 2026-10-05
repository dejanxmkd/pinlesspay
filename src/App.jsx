import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  BadgeDollarSign,
  ChevronsUpDown,
  Ellipsis,
  Eye,
  FileText,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Pencil,
  Search,
  Store,
  WalletCards,
} from "lucide-react";
import logo from "../assets/img/logo.svg";
import logoDark from "../assets/img/logo-dark.svg";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Table,
} from "./components/ui";

const avatarUrl = "https://randomuser.me/api/portraits/men/32.jpg";

const initialMerchants = [
  { id: 1, dba: "True Print Shop", address: "123 Main St, Brooklyn, NY", processor: "Fiserv", mcc: "2741", phone: "(718) 555-0132", owner: "John Smith", cell: "(917) 555-0194", created: "Oct 3, 2026", status: "Active" },
  { id: 2, dba: "Northside Market", address: "81 Kent Ave, Brooklyn, NY", processor: "TSYS", mcc: "5411", phone: "(718) 555-0148", owner: "Olivia Brown", cell: "(917) 555-0181", created: "Sep 28, 2026", status: "Active" },
  { id: 3, dba: "Blue Harbor Cafe", address: "22 Water St, New York, NY", processor: "Fiserv", mcc: "5812", phone: "(212) 555-0175", owner: "Daniel Lee", cell: "(646) 555-0144", created: "Sep 22, 2026", status: "Active" },
  { id: 4, dba: "Urban Cuts", address: "438 Atlantic Ave, Brooklyn, NY", processor: "Worldpay", mcc: "7230", phone: "(718) 555-0188", owner: "Marcus Hill", cell: "(347) 555-0120", created: "Sep 18, 2026", status: "Active" },
  { id: 5, dba: "Peak Fitness", address: "90 Broadway, Queens, NY", processor: "Fiserv", mcc: "7997", phone: "(718) 555-0106", owner: "Sofia Reed", cell: "(917) 555-0166", created: "Sep 11, 2026", status: "Active" },
];

const applications = [
  { id: "APP-1048", merchant: "True Print Shop", owner: "John Smith", processor: "Fiserv", submitted: "Oct 3, 2026", status: "Approved" },
  { id: "APP-1047", merchant: "Northside Market", owner: "Olivia Brown", processor: "TSYS", submitted: "Oct 2, 2026", status: "In Review" },
  { id: "APP-1046", merchant: "Blue Harbor Cafe", owner: "Daniel Lee", processor: "Fiserv", submitted: "Sep 30, 2026", status: "Pending" },
  { id: "APP-1045", merchant: "Urban Cuts", owner: "Marcus Hill", processor: "Worldpay", submitted: "Sep 29, 2026", status: "Draft" },
  { id: "APP-1044", merchant: "Peak Fitness", owner: "Sofia Reed", processor: "Fiserv", submitted: "Sep 27, 2026", status: "Declined" },
];

const residuals = [
  { merchant: "True Print Shop", processor: "Fiserv", volume: "$84,320", amount: "$684.20", period: "September 2026", status: "Paid" },
  { merchant: "Northside Market", processor: "TSYS", volume: "$73,150", amount: "$602.10", period: "September 2026", status: "Paid" },
  { merchant: "Blue Harbor Cafe", processor: "Fiserv", volume: "$51,240", amount: "$429.50", period: "September 2026", status: "Pending" },
  { merchant: "Urban Cuts", processor: "Worldpay", volume: "$44,980", amount: "$355.80", period: "September 2026", status: "Paid" },
  { merchant: "Peak Fitness", processor: "Fiserv", volume: "$39,420", amount: "$318.40", period: "August 2026", status: "Paid" },
];

function statusVariant(status) {
  const value = status.toLowerCase();
  if (["active", "approved", "paid"].includes(value)) return "success";
  if (value === "pending") return "warning";
  if (value === "in review") return "purple";
  if (["declined", "inactive"].includes(value)) return "danger";
  return "neutral";
}

function PageHeader({ title, description, actions }) {
  return (
    <header className="page-header">
      <div><h1>{title}</h1><p>{description}</p></div>
      <div className="header-actions">{actions}</div>
    </header>
  );
}

function AccountMenu() {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="profile-menu-trigger" type="button" aria-label="Open account menu">
          <ChevronsUpDown />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end">
        <DropdownMenuItem onSelect={() => navigate("/login")}>
          <LogOut /><span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar() {
  const nav = [
    ["/dashboard", "Dashboard", LayoutDashboard],
    ["/merchants", "Merchants", Store],
    ["/applications", "Applications", FileText],
    ["/residuals", "Residuals", WalletCards],
  ];

  return (
    <aside className="sidebar">
      <div className="brand"><img src={logo} alt="Pinless Pay" style={{ width: 164 }} /></div>
      <nav className="nav">
        {nav.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : undefined}>
            <Icon />{label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-card">
          <Avatar src={avatarUrl} alt="Michael Carter" fallback="MC" />
          <div className="user-meta"><strong>Michael Carter</strong><span>Agent</span></div>
          <AccountMenu />
        </div>
      </div>
    </aside>
  );
}

function AppShell({ children }) {
  return <div className="app"><Sidebar /><main className="main">{children}</main></div>;
}

function Dashboard() {
  return (
    <AppShell>
      <PageHeader title="Dashboard" description="Welcome back, Michael" />
      <section className="grid grid-4">
        <Kpi label="Total Merchants" value="128" icon={Store} />
        <Kpi label="Active Merchants" value="117" icon={BadgeCheck} />
        <Kpi label="Applications" value="14" icon={FileText} />
        <Kpi label="Monthly Residuals" value="$12,840" icon={WalletCards} />
      </section>

      <div className="two-column-panels">
        <Card className="panel">
          <div className="section-head"><h2 className="section-title">Recent Merchants</h2><Link to="/merchants">View all</Link></div>
          <Table className="mini-table">
            <thead><tr><th>Merchant</th><th>Processor</th><th>Owner</th><th>Status</th></tr></thead>
            <tbody>{initialMerchants.slice(0,4).map(m => <tr key={m.id}><td>{m.dba}</td><td>{m.processor}</td><td>{m.owner}</td><td><Badge variant="success">Active</Badge></td></tr>)}</tbody>
          </Table>
        </Card>
        <Card className="panel">
          <div className="section-head"><h2 className="section-title">Recent Applications</h2><Link to="/applications">View all</Link></div>
          <Table className="mini-table">
            <thead><tr><th>Merchant</th><th>ID</th><th>Submitted</th><th>Status</th></tr></thead>
            <tbody>{applications.slice(0,4).map(a => <tr key={a.id}><td>{a.merchant}</td><td>{a.id}</td><td>{a.submitted}</td><td><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td></tr>)}</tbody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, icon: Icon }) {
  return (
    <Card className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-icon"><Icon /></div>
    </Card>
  );
}

function FilterSelect({ value, onValueChange, placeholder, options, className, includeAll = true }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">{placeholder}</SelectItem>}
        {options.map(option => <SelectItem value={option} key={option}>{option}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function MerchantSheet({ open, onOpenChange, merchant, onSave }) {
  const blank = { dba:"", address:"", processor:"Fiserv", mcc:"", phone:"", owner:"", cell:"", status:"Active" };
  const [form, setForm] = useState(blank);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(merchant ? { ...merchant } : blank);
      setShowErrors(false);
    }
  }, [open, merchant]);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const required = ["dba","address","processor","mcc","phone","owner","cell"];

  const submit = e => {
    e.preventDefault();
    if (required.some(key => !String(form[key] || "").trim())) {
      setShowErrors(true);
      return;
    }
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <form onSubmit={submit} className={showErrors ? "show-errors" : ""}>
          <SheetHeader>
            <div>
              <SheetTitle>{merchant ? "Edit Merchant" : "Add Merchant"}</SheetTitle>
              <SheetDescription>{merchant ? "Update merchant information." : "Create a new merchant record."}</SheetDescription>
            </div>
            <SheetCloseButton />
          </SheetHeader>

          <div className="drawer-body">
            <section className="drawer-section">
              <h3>Merchant Information</h3>
              <div className="drawer-grid">
                <Field label="Merchant DBA *" error="Merchant DBA is required." className="span-2">
                  <Input required value={form.dba} onChange={e => set("dba", e.target.value)} placeholder="Enter merchant DBA" />
                </Field>
                <Field label="Address *" error="Address is required." className="span-2">
                  <Input required value={form.address} onChange={e => set("address", e.target.value)} placeholder="Enter business address" />
                </Field>
                <Field label="Processor *">
                  <FilterSelect value={form.processor || "Fiserv"} onValueChange={v => set("processor", v)} placeholder="Select processor" options={["Fiserv","TSYS","Worldpay"]} className="input sh-form-select" includeAll={false} />
                </Field>
                <Field label="MCC Code *" error="MCC is required.">
                  <Input required value={form.mcc} onChange={e => set("mcc", e.target.value)} placeholder="2741" />
                </Field>
                <Field label="DBA Phone *" error="Phone is required.">
                  <Input required value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(000) 000-0000" />
                </Field>
                <Field label="Status">
                  <FilterSelect value={form.status || "Active"} onValueChange={v => set("status", v)} placeholder="Status" options={["Active","Inactive"]} className="input sh-form-select" includeAll={false} />
                </Field>
              </div>
            </section>
            <section className="drawer-section">
              <h3>Business Owner</h3>
              <div className="drawer-grid">
                <Field label="Business Owner *" error="Owner is required." className="span-2">
                  <Input required value={form.owner} onChange={e => set("owner", e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Cell Phone *" error="Cell phone is required." className="span-2">
                  <Input required value={form.cell} onChange={e => set("cell", e.target.value)} placeholder="(000) 000-0000" />
                </Field>
              </div>
            </section>
          </div>

          <SheetFooter>
            <SheetClose asChild><Button type="button" variant="secondary">Cancel</Button></SheetClose>
            <Button type="submit">{merchant ? "Save Changes" : "Add Merchant"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, error, className="", children }) {
  return <div className={`field ${className}`}><label>{label}</label>{children}{error && <span className="required-error">{error}</span>}</div>;
}

function MerchantActions({ merchant, onEdit }) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="action-menu-trigger" type="button" aria-label="More actions" onClick={e => e.stopPropagation()}>
          <Ellipsis />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={e => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => navigate("/merchant-details")}>
          <Eye /><span>View Merchant</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(merchant)}>
          <Pencil /><span>Edit Merchant</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Merchants() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState(initialMerchants);
  const [search, setSearch] = useState("");
  const [processor, setProcessor] = useState("all");
  const [status, setStatus] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => rows.filter(row => {
    const haystack = Object.values(row).join(" ").toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (processor === "all" || row.processor === processor) &&
      (status === "all" || row.status === status);
  }), [rows, search, processor, status]);

  const openAdd = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = row => { setEditing(row); setSheetOpen(true); };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("drawer") === "add") {
      setEditing(null);
      setSheetOpen(true);
      return;
    }
    const edit = params.get("edit");
    if (edit) {
      const target = initialMerchants.find(row => row.dba.toLowerCase().replace(/\s+/g, "-") === edit);
      if (target) {
        setEditing(target);
        setSheetOpen(true);
      }
    }
  }, []);

  const save = form => {
    if (editing) {
      setRows(current => current.map(row => row.id === editing.id ? { ...row, ...form } : row));
    } else {
      setRows(current => [{ ...form, id: Date.now(), created: "Today" }, ...current]);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Merchants"
        description="View and manage your merchants."
        actions={<Button onClick={openAdd}>Add Merchant</Button>}
      />

      <Card className="toolbar">
        <div className="search"><Search /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchants" /></div>
        <FilterSelect value={processor} onValueChange={setProcessor} placeholder="All processors" options={["Fiserv","TSYS","Worldpay"]} />
        <FilterSelect value={status} onValueChange={setStatus} placeholder="All statuses" options={["Active","Inactive"]} />
        <Button variant="ghost" className="btn-clear" onClick={() => { setSearch(""); setProcessor("all"); setStatus("all"); }}>Clear filters</Button>
      </Card>

      <Card className="table-wrap">
        <Table>
          <thead><tr><th>Merchant DBA</th><th>Address</th><th>Processor</th><th>MCC</th><th>DBA Phone</th><th>Owner</th><th>Created</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map(row => (
              <tr className="clickable-row" key={row.id} onClick={() => navigate("/merchant-details")}>
                <td><strong>{row.dba}</strong></td><td>{row.address}</td><td>{row.processor}</td><td>{row.mcc}</td><td>{row.phone}</td><td>{row.owner}</td><td>{row.created}</td>
                <td><Badge variant={statusVariant(row.status)}>{row.status}</Badge></td>
                <td className="actions"><MerchantActions merchant={row} onEdit={openEdit} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
        {!filtered.length && <div className="table-empty"><strong>No merchants found</strong>Try changing or clearing your filters.</div>}
      </Card>
      <div className="filter-meta"><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>

      <MerchantSheet open={sheetOpen} onOpenChange={setSheetOpen} merchant={editing} onSave={save} />
    </AppShell>
  );
}

function Applications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [processor, setProcessor] = useState("all");
  const [submitted, setSubmitted] = useState("all");

  const filtered = useMemo(() => applications.filter(row => {
    const haystack = Object.values(row).join(" ").toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (status === "all" || row.status === status) &&
      (processor === "all" || row.processor === processor) &&
      (submitted === "all" || row.submitted === submitted);
  }), [search, status, processor, submitted]);

  return (
    <AppShell>
      <PageHeader title="Applications" description="View and track merchant applications." />
      <Card className="toolbar">
        <div className="search"><Search /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications" /></div>
        <FilterSelect value={status} onValueChange={setStatus} placeholder="All statuses" options={["Approved","In Review","Pending","Draft","Declined"]} />
        <FilterSelect value={processor} onValueChange={setProcessor} placeholder="All processors" options={["Fiserv","TSYS","Worldpay"]} />
        <FilterSelect value={submitted} onValueChange={setSubmitted} placeholder="All dates" options={["Oct 3, 2026","Oct 2, 2026","Sep 30, 2026","Sep 29, 2026","Sep 27, 2026"]} />
        <Button variant="ghost" className="btn-clear" onClick={() => { setSearch(""); setStatus("all"); setProcessor("all"); setSubmitted("all"); }}>Clear filters</Button>
      </Card>

      <Card className="table-wrap">
        <Table>
          <thead><tr><th>Application ID</th><th>Merchant DBA</th><th>Business Owner</th><th>Processor</th><th>Submitted</th><th>Status</th></tr></thead>
          <tbody>{filtered.map(row => (
            <tr className="clickable-row" key={row.id} onClick={() => navigate("/application-details")}>
              <td><strong>{row.id}</strong></td><td>{row.merchant}</td><td>{row.owner}</td><td>{row.processor}</td><td>{row.submitted}</td><td><Badge variant={statusVariant(row.status)}>{row.status}</Badge></td>
            </tr>
          ))}</tbody>
        </Table>
        {!filtered.length && <div className="table-empty"><strong>No applications found</strong>Try changing or clearing your filters.</div>}
      </Card>
      <div className="filter-meta"><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>
    </AppShell>
  );
}

function Residuals() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [processor, setProcessor] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => residuals.filter(row => {
    const haystack = Object.values(row).join(" ").toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) &&
      (period === "all" || row.period === period) &&
      (processor === "all" || row.processor === processor) &&
      (status === "all" || row.status === status);
  }), [search, period, processor, status]);

  return (
    <AppShell>
      <PageHeader title="Residuals" description="View your merchant residual earnings." />
      <section className="grid grid-3">
        <Kpi label="Current Month Residuals" value="$12,840" icon={WalletCards} />
        <Kpi label="Previous Month Residuals" value="$11,920" icon={History} />
        <Kpi label="Year-to-Date Residuals" value="$112,450" icon={BadgeDollarSign} />
      </section>

      <Card className="toolbar" style={{ marginTop: 18 }}>
        <div className="search"><Search /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search merchant" /></div>
        <FilterSelect value={period} onValueChange={setPeriod} placeholder="All periods" options={["September 2026","August 2026"]} />
        <FilterSelect value={processor} onValueChange={setProcessor} placeholder="All processors" options={["Fiserv","TSYS","Worldpay"]} />
        <FilterSelect value={status} onValueChange={setStatus} placeholder="All statuses" options={["Paid","Pending"]} />
        <Button variant="ghost" className="btn-clear" onClick={() => { setSearch(""); setPeriod("all"); setProcessor("all"); setStatus("all"); }}>Clear filters</Button>
      </Card>

      <Card className="table-wrap">
        <Table>
          <thead><tr><th>Merchant DBA</th><th>Processor</th><th>Processing Volume</th><th>Residual Amount</th><th>Period</th><th>Status</th></tr></thead>
          <tbody>{filtered.map((row, index) => <tr key={index}><td><strong>{row.merchant}</strong></td><td>{row.processor}</td><td className="money">{row.volume}</td><td className="money">{row.amount}</td><td>{row.period}</td><td><Badge variant={statusVariant(row.status)}>{row.status}</Badge></td></tr>)}</tbody>
        </Table>
        {!filtered.length && <div className="table-empty"><strong>No residuals found</strong>Try changing or clearing your filters.</div>}
      </Card>
      <div className="filter-meta"><span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span></div>
    </AppShell>
  );
}

function MerchantDetails() {
  return (
    <AppShell>
      <PageHeader
        title="Merchant Details"
        description="Merchant profile and account details."
        actions={<><Button variant="secondary" asChild><Link to="/merchants">Back</Link></Button><Button asChild><Link to="/merchants?edit=true-print-shop">Edit Merchant</Link></Button></>}
      />
      <div className="breadcrumb">Merchants / True Print Shop</div>
      <Card className="merchant-profile-card">
        <div className="merchant-profile-top">
          <div className="merchant-identity">
            <div className="merchant-eyebrow">Merchant</div>
            <div className="merchant-title-line"><h2>True Print Shop</h2><Badge variant="success">Active</Badge></div>
            <p className="merchant-address">123 Main St, Brooklyn, NY 11201</p>
          </div>
          <div className="merchant-summary-grid">
            <div className="merchant-summary-item"><span>Processor</span><strong>Fiserv</strong></div>
            <div className="merchant-summary-item"><span>MCC Code</span><strong>2741</strong></div>
            <div className="merchant-summary-item"><span>Created</span><strong>Oct 3, 2026</strong></div>
          </div>
        </div>
        <div className="merchant-contact-grid">
          <div className="merchant-contact-item"><span>Business Owner</span><strong>John Smith</strong></div>
          <div className="merchant-contact-item"><span>DBA Phone</span><strong>(718) 555-0132</strong></div>
          <div className="merchant-contact-item"><span>Cell Phone</span><strong>(917) 555-0194</strong></div>
        </div>
      </Card>
    </AppShell>
  );
}

function ApplicationDetails() {
  return (
    <AppShell>
      <PageHeader title="Application Details" description="Review application information and status." actions={<Button variant="secondary" asChild><Link to="/applications">Back</Link></Button>} />
      <div className="breadcrumb">Applications / APP-1048</div>
      <div className="title-row" style={{ marginBottom: 18 }}><h1 style={{ fontSize: 24 }}>APP-1048</h1><Badge variant="success">Approved</Badge></div>
      <div className="grid grid-2">
        <Card className="details-card">
          <h3 className="section-title" style={{ marginBottom: 8 }}>Application Information</h3>
          <Detail label="Merchant DBA" value="True Print Shop" />
          <Detail label="Business Owner" value="John Smith" />
          <Detail label="Processor" value="Fiserv" />
          <Detail label="Submitted Date" value="October 3, 2026" />
        </Card>
        <Card className="details-card">
          <h3 className="section-title" style={{ marginBottom: 8 }}>Application Status</h3>
          <Detail label="Current Status" value="Approved" />
          <Detail label="Application ID" value="APP-1048" />
          <Detail label="Last Updated" value="October 4, 2026" />
          <Detail label="Processor" value="Fiserv" />
        </Card>
      </div>
    </AppShell>
  );
}

function Detail({ label, value }) {
  return <div className="detail"><label>{label}</label><strong>{value}</strong></div>;
}

function AuthLayout({ recovery = false, children }) {
  return (
    <div className="auth-page">
      <section className="auth-brand">
        <img className="brandmark" src={logo} alt="Pinless Pay" />
        <h1>Agent Portal</h1>
        <p>{recovery ? "Secure access for Pinless Pay agents. Recover your account in a few simple steps." : "Secure access for Pinless Pay agents. Manage merchants, applications and residuals in one focused workspace."}</p>
      </section>
      <section className="auth-side">{children}</section>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="auth-card">
        <img className="auth-logo" src={logoDark} alt="Pinless Pay" />
        <h2>Welcome back</h2><p>Sign in to your account</p>
        <div className="auth-field"><label>Email Address</label><div className="input-wrap"><Mail /><Input defaultValue="agent@pinlesspay.com" /></div></div>
        <div className="auth-field"><label>Password</label><div className="input-wrap"><LockKeyhole /><Input type="password" defaultValue="password" /></div></div>
        <div className="auth-options"><label className="check"><input type="checkbox" defaultChecked /> Remember me</label><Link className="auth-link" to="/forgot-password">Forgot password?</Link></div>
        <Button className="full" onClick={() => navigate("/dashboard")}>Sign In</Button>
        <div className="auth-error">Incorrect email or password. Please try again.</div>
        <div className="copyright">© Pinless Pay</div>
      </div>
    </AuthLayout>
  );
}

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout recovery>
      <div className="auth-card">
        <img className="auth-logo" src={logoDark} alt="Pinless Pay" />
        <h2>Forgot your password?</h2><p>Enter your email address and we’ll send you instructions to reset your password.</p>
        <div className="auth-field"><label>Email Address</label><div className="input-wrap"><Mail /><Input defaultValue="agent@pinlesspay.com" /></div></div>
        <Button className="full" onClick={() => setSent(true)}>Send Reset Link</Button>
        {sent && <div className="auth-success"><strong>Check your email</strong>We sent password reset instructions to your email address.</div>}
        <div style={{ textAlign: "center", marginTop: 18 }}><Link className="auth-link" to="/login">Back to Sign In</Link></div>
      </div>
    </AuthLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/merchants" element={<Merchants />} />
      <Route path="/merchant-details" element={<MerchantDetails />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/application-details" element={<ApplicationDetails />} />
      <Route path="/residuals" element={<Residuals />} />
      <Route path="/login.html" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password.html" element={<Navigate to="/forgot-password" replace />} />
      <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />
      <Route path="/merchants.html" element={<Navigate to="/merchants" replace />} />
      <Route path="/merchant-details.html" element={<Navigate to="/merchant-details" replace />} />
      <Route path="/applications.html" element={<Navigate to="/applications" replace />} />
      <Route path="/application-details.html" element={<Navigate to="/application-details" replace />} />
      <Route path="/residuals.html" element={<Navigate to="/residuals" replace />} />
      <Route path="/add-merchant.html" element={<Navigate to="/merchants?drawer=add" replace />} />
      <Route path="/edit-merchant.html" element={<Navigate to="/merchants?edit=true-print-shop" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
