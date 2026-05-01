import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useState } from "react";
import "@/App.css";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "next-themes";
import {
  AlertTriangle,
  BellRing,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  Moon,
  Plus,
  Search,
  SunMedium,
  Ticket,
  TicketPercent,
  Trash2,
  UserRound,
  Users,
  UtensilsCrossed,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "@/components/ui/sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, BarChart, Bar } from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const FORMSPREE_ENDPOINT = process.env.REACT_APP_FORMSPREE_ENDPOINT || "https://formspree.io/f/mykbqjav";
const POSTERS_FOLDER_URL =
  process.env.REACT_APP_POSTERS_FOLDER_URL ||
  "https://drive.google.com/drive/folders/REPLACE_WITH_DRIVE_FOLDER_ID";

const api = axios.create({
  baseURL: API,
});

const CUSTOMER_TOKEN_KEY = "vv-customer-token";
const CUSTOMER_USER_KEY = "vv-customer-user";
const ADMIN_TOKEN_KEY = "vv-admin-token";
const ADMIN_USER_KEY = "vv-admin-user";
const BOOTSTRAP_CACHE_KEY = "vv-bootstrap-cache";
const HERO_IMAGE = "/vibes.jpeg";
const HUNGRY_PLATTER_IMAGE = "/vv-hungry-platter.jpg";
const BOTTLE_BOOTH_IMAGE = "/DSC_0697 (1).jpg";
const FRIDAY_AFTER_DARK_IMAGE = "/fridayafterdark.PNG";
const SPECIAL_FEATURE_IMAGE = "/birthdaybook.jpg";
const VENUE_FEATURE_IMAGE = "/LivePerfomance1.jpg";
const FULL_LOGO_IMAGE = "/vv-logo-full.png";

const defaultBootstrap = {
  venue_name: "Vaal Vibes",
  tagline: "Nightlife, braai plates, and premium table vibes.",
  logo_url: FULL_LOGO_IMAGE,
  hero_image_url: HERO_IMAGE,
  menu: [],
  events: [],
  specials: [],
  gallery: [],
  venue_hours: [],
  service_note: "Pay at venue only.",
};

const requestSeed = {
  request_type: "order-intent",
  selectedDate: new Date(),
  selectedTime: "19:00",
  guest_count: 2,
  notes: "",
  contact_phone: "",
  items: [],
};

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/specials", label: "Specials", icon: UtensilsCrossed },
  { to: "/admin/menu", label: "Menu", icon: BookOpen },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/promo", label: "Promo Desk", icon: TicketPercent },
  { to: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/audit", label: "Audit", icon: ClipboardCheck },
];

const customerLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/gallery", label: "Gallery", icon: Image },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const removeStorage = (key) => {
  localStorage.removeItem(key);
};

const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
  }).format(new Date(value));

const getInitials = (name = "Vaal Vibes") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const buildIsoDateTime = (date, timeValue) => {
  const safeDate = date ? new Date(date) : new Date();
  const [hours, minutes] = (timeValue || "19:00").split(":").map(Number);
  safeDate.setHours(hours || 19, minutes || 0, 0, 0);
  return safeDate.toISOString();
};

const getEventFilter = (events, filter) => {
  const now = new Date();
  if (filter === "all") {
    return events;
  }
  if (filter === "week") {
    const limit = new Date();
    limit.setDate(now.getDate() + 7);
    return events.filter((event) => new Date(event.date) <= limit);
  }
  const monthLimit = new Date();
  monthLimit.setMonth(now.getMonth() + 1);
  return events.filter((event) => new Date(event.date) <= monthLimit);
};

const getSpecialFeatureImage = (special) => {
  if (special?.title === "Hungry Platter Special") {
    return HUNGRY_PLATTER_IMAGE;
  }
  if (special?.title === "Bottle & Booth Night") {
    return BOTTLE_BOOTH_IMAGE;
  }
  if (special?.title === "Sunset Special") {
    return "/corona1.jpg";
  }
  return special?.image_url || SPECIAL_FEATURE_IMAGE;
};

const getEventFeatureImage = (event) => {
  if (event?.title === "Friday After Dark") {
    return FRIDAY_AFTER_DARK_IMAGE;
  }
  if (event?.title === "Party Yama 2000") {
    return "/fridayafterdark.PNG";
  }
  return event?.image_url || FRIDAY_AFTER_DARK_IMAGE;
};

function App() {
  return (
    <div className="vv-app">
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </div>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [bootstrap, setBootstrap] = useState(() => readStorage(BOOTSTRAP_CACHE_KEY, defaultBootstrap));
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem(CUSTOMER_TOKEN_KEY) || "");
  const [customerUser, setCustomerUser] = useState(() => readStorage(CUSTOMER_USER_KEY, null));
  const [customerProfile, setCustomerProfile] = useState(null);
  const [wallet, setWallet] = useState([]);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [adminUser, setAdminUser] = useState(() => readStorage(ADMIN_USER_KEY, null));
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminEvents, setAdminEvents] = useState([]);
  const [adminSpecials, setAdminSpecials] = useState([]);
  const [adminMenu, setAdminMenu] = useState([]);
  const [adminGallery, setAdminGallery] = useState([]);
  const [promoPools, setPromoPools] = useState([]);
  const [issuedPromos, setIssuedPromos] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [requestDrawerOpen, setRequestDrawerOpen] = useState(false);
  const [requestStep, setRequestStep] = useState(1);
  const [requestReference, setRequestReference] = useState("");
  const [requestDraft, setRequestDraft] = useState(requestSeed);
  const [selectedSpecial, setSelectedSpecial] = useState(null);
  const [adminSheetOpen, setAdminSheetOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const requestTotal = useMemo(
    () => requestDraft.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [requestDraft.items],
  );

  const loadBootstrap = async () => {
    setBootstrapLoading(true);
    try {
      const response = await api.get("/public/bootstrap");
      setBootstrap(response.data);
      writeStorage(BOOTSTRAP_CACHE_KEY, response.data);
      setBootstrapError("");
    } catch (error) {
      const cached = readStorage(BOOTSTRAP_CACHE_KEY, defaultBootstrap);
      setBootstrap(cached);
      setBootstrapError(
        cached?.menu?.length
          ? "Offline mode: showing last synced content."
          : "Unable to load Vaal Vibes content right now.",
      );
    } finally {
      setBootstrapLoading(false);
    }
  };

  const logoutCustomer = useCallback((silent = false) => {
    setCustomerToken("");
    setCustomerUser(null);
    removeStorage(CUSTOMER_USER_KEY);
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    if (!silent) {
      toast.success("Customer session closed.");
      navigate("/");
    }
  }, [navigate]);

  const logoutAdmin = useCallback((silent = false) => {
    setAdminToken("");
    setAdminUser(null);
    removeStorage(ADMIN_USER_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    if (!silent) {
      toast.success("Admin session closed.");
      navigate("/admin/login");
    }
  }, [navigate]);

  const loadCustomerData = useCallback(async (token = customerToken) => {
    if (!token) {
      setCustomerProfile(null);
      setWallet([]);
      setCustomerRequests([]);
      return;
    }

    setCustomerLoading(true);
    try {
      const [profileResponse, walletResponse, requestsResponse] = await Promise.all([
        api.get("/customer/profile", authConfig(token)),
        api.get("/customer/wallet", authConfig(token)),
        api.get("/customer/requests", authConfig(token)),
      ]);
      setCustomerProfile(profileResponse.data);
      setWallet(walletResponse.data);
      setCustomerRequests(requestsResponse.data);
    } catch (error) {
      logoutCustomer(true);
      toast.error("Your customer session expired. Please sign in again.");
    } finally {
      setCustomerLoading(false);
    }
  }, [customerToken, logoutCustomer]);

  const loadAdminData = useCallback(async (token = adminToken) => {
    if (!token) {
      setAdminDashboard(null);
      setAdminEvents([]);
      setAdminSpecials([]);
      setAdminMenu([]);
      setAdminGallery([]);
      setPromoPools([]);
      setIssuedPromos([]);
      setCampaigns([]);
      setAdminUsers([]);
      setAuditLogs([]);
      setAdminRequests([]);
      return;
    }

    setAdminLoading(true);
    try {
      const [
        dashboardResponse,
        eventsResponse,
        specialsResponse,
        menuResponse,
        galleryResponse,
        poolsResponse,
        promoCodesResponse,
        campaignsResponse,
        usersResponse,
        auditResponse,
        requestsResponse,
      ] = await Promise.all([
        api.get("/admin/dashboard", authConfig(token)),
        api.get("/admin/events", authConfig(token)),
        api.get("/admin/specials", authConfig(token)),
        api.get("/admin/menu/categories", authConfig(token)),
        api.get("/admin/gallery", authConfig(token)),
        api.get("/admin/promo-pools", authConfig(token)),
        api.get("/admin/promo-codes", authConfig(token)),
        api.get("/admin/campaigns", authConfig(token)),
        api.get("/admin/users", authConfig(token)),
        api.get("/admin/audit-logs", authConfig(token)),
        api.get("/admin/requests", authConfig(token)),
      ]);
      setAdminDashboard(dashboardResponse.data);
      setAdminEvents(eventsResponse.data);
      setAdminSpecials(specialsResponse.data);
      setAdminMenu(menuResponse.data);
      setAdminGallery(galleryResponse.data);
      setPromoPools(poolsResponse.data);
      setIssuedPromos(promoCodesResponse.data);
      setCampaigns(campaignsResponse.data);
      setAdminUsers(usersResponse.data);
      setAuditLogs(auditResponse.data);
      setAdminRequests(requestsResponse.data);
    } catch (error) {
      logoutAdmin(true);
      toast.error("Your admin session expired. Please sign in again.");
    } finally {
      setAdminLoading(false);
    }
  }, [adminToken, logoutAdmin]);

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const saveAdminSession = (payload) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, payload.access_token);
    writeStorage(ADMIN_USER_KEY, payload);
    setAdminToken(payload.access_token);
    setAdminUser(payload);
  };

  const addMenuItemToRequest = (item) => {
    setRequestDraft((current) => {
      const existing = current.items.find((entry) => entry.name === item.name);
      const items = existing
        ? current.items.map((entry) =>
            entry.name === item.name ? { ...entry, quantity: entry.quantity + 1 } : entry,
          )
        : [...current.items, { name: item.name, quantity: 1, price: item.price }];
      return { ...current, request_type: "order-intent", items };
    });
    setRequestStep(1);
    setRequestDrawerOpen(true);
    toast.success(`${item.name} added to request.`);
  };
  
  const saveCustomerSession = (payload) => {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, payload.access_token);
    writeStorage(CUSTOMER_USER_KEY, payload);
    setCustomerToken(payload.access_token);
    setCustomerUser(payload);
  };
  
  const openReservationRequest = (sourceLabel) => {
    setRequestDraft((current) => ({
      ...current,
      request_type: "reservation",
      notes: sourceLabel ? `Requesting a booking for ${sourceLabel}` : current.notes,
    }));
    setRequestStep(1);
    setRequestDrawerOpen(true);
  };

  const resetRequestDrawer = () => {
    setRequestDrawerOpen(false);
    setRequestStep(1);
    setRequestReference("");
    setRequestDraft(requestSeed);
  };

  const submitRequest = async () => {
    if (!customerToken) {
      toast.error("Please sign in first to send a request.");
      setRequestDrawerOpen(false);
      navigate("/login");
      return;
    }

    try {
      const payload = {
        request_type: requestDraft.request_type,
        date: buildIsoDateTime(requestDraft.selectedDate, requestDraft.selectedTime),
        guest_count: requestDraft.guest_count,
        notes: requestDraft.notes,
        items: requestDraft.items,
        contact_phone: requestDraft.contact_phone || customerProfile?.phone || customerUser?.phone || "",
      };
      const response = await api.post("/customer/requests", payload, authConfig(customerToken));
      if (FORMSPREE_ENDPOINT) {
        axios.post(FORMSPREE_ENDPOINT, {
          _subject: `New ${payload.request_type} — ${response.data.reference_id}`,
          reference_id: response.data.reference_id,
          request_type: payload.request_type,
          date: formatDateTime(payload.date),
          guest_count: payload.guest_count,
          phone: payload.contact_phone || "Not provided",
          items: payload.items?.map((i) => `${i.name} x${i.quantity}`).join(", ") || "None",
          notes: payload.notes || "None",
        }).catch(() => {});
      }
      setRequestReference(response.data.reference_id);
      setRequestStep(4);
      toast.success("Request sent successfully.");
      loadCustomerData(customerToken);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Unable to send request right now.");
    }
  };

  if (isAdminRoute && location.pathname === "/admin/login") {
    return (
      <>
        <Toaster position="top-right" visibleToasts={3} closeButton />
        {isOffline && <OfflineBanner />}
        <AdminLoginPage onLogin={saveAdminSession} />
      </>
    );
  }

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-background text-foreground vv-admin-grid">
        <Toaster position="top-right" visibleToasts={3} closeButton />
        {isOffline && <OfflineBanner />}
        <AdminFrame
          adminUser={adminUser}
          logoutAdmin={logoutAdmin}
          adminSheetOpen={adminSheetOpen}
          setAdminSheetOpen={setAdminSheetOpen}
          theme={theme}
          setTheme={setTheme}
        >
          <Routes>
            <Route
              path="/admin"
              element={
                adminToken ? (
                  <AdminDashboardPage dashboard={adminDashboard} requests={adminRequests} loading={adminLoading} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/events"
              element={
                adminToken ? (
                  <AdminEventsPage token={adminToken} events={adminEvents} refresh={loadAdminData} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/specials"
              element={
                adminToken ? (
                  <AdminSpecialsPage token={adminToken} specials={adminSpecials} refresh={loadAdminData} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/menu"
              element={
                adminToken ? (
                  <AdminMenuPage token={adminToken} categories={adminMenu} refresh={loadAdminData} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/gallery"
              element={
                adminToken ? (
                  <AdminGalleryPage token={adminToken} photos={adminGallery} refresh={loadAdminData} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/promo"
              element={
                adminToken ? (
                  <AdminPromoPage token={adminToken} promoPools={promoPools} issuedPromos={issuedPromos} refresh={loadAdminData} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/campaigns"
              element={
                adminToken ? (
                  <AdminCampaignsPage token={adminToken} campaigns={campaigns} refresh={loadAdminData} />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/users"
              element={adminToken ? <AdminUsersPage users={adminUsers} loading={adminLoading} /> : <Navigate to="/admin/login" replace />}
            />
            <Route
              path="/admin/audit"
              element={adminToken ? <AdminAuditPage logs={auditLogs} loading={adminLoading} /> : <Navigate to="/admin/login" replace />}
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AdminFrame>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" visibleToasts={3} closeButton />
      {isOffline && <OfflineBanner />}
      <CustomerFrame customerUser={customerUser} theme={theme} setTheme={setTheme} logoutCustomer={logoutCustomer}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                bootstrap={bootstrap}
                loading={bootstrapLoading}
                error={bootstrapError}
                onOpenRequest={openReservationRequest}
                onOpenSpecial={setSelectedSpecial}
              />
            }
          />
          <Route
            path="/menu"
            element={
              <MenuPage
                bootstrap={bootstrap}
                loading={bootstrapLoading}
                onAddToRequest={addMenuItemToRequest}
              />
            }
          />
          <Route
            path="/events"
            element={
              <EventsPage
                events={bootstrap.events}
                loading={bootstrapLoading}
                onOpenRequest={openReservationRequest}
              />
            }
          />
          <Route
            path="/gallery"
            element={<GalleryPage photos={bootstrap.gallery || []} loading={bootstrapLoading} />}
          />
          <Route path="/birthdays" element={<BirthdayPage />} />
          <Route path="/wallet" element={<Navigate to="/profile?tab=wallet" replace />} />
          <Route
            path="/profile"
            element={
              customerToken ? (
                <ProfilePage
                  token={customerToken}
                  profile={customerProfile}
                  requests={customerRequests}
                  refresh={loadCustomerData}
                  logoutCustomer={logoutCustomer}
                  wallet={wallet}
                  customerLoading={customerLoading}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<CustomerLoginPage onLogin={saveCustomerSession} />} />
          <Route path="/register" element={<CustomerRegisterPage onRegister={saveCustomerSession} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CustomerFrame>

      <SpecialDialog special={selectedSpecial} onOpenChange={setSelectedSpecial} onRequest={() => openReservationRequest(selectedSpecial?.title)} />
      <RequestBuilderDrawer
        open={requestDrawerOpen}
        onOpenChange={setRequestDrawerOpen}
        requestDraft={requestDraft}
        setRequestDraft={setRequestDraft}
        step={requestStep}
        setStep={setRequestStep}
        total={requestTotal}
        referenceId={requestReference}
        onSubmit={submitRequest}
        onReset={resetRequestDrawer}
        customerProfile={customerProfile}
      />
    </div>
  );
}

function BrandBadge() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-badge">
      <img src={FULL_LOGO_IMAGE} alt="Vaal Vibes logo" className="h-11 w-auto object-contain" />
      <div>
        <p className="font-display text-xl leading-none text-white">Vaal Vibes</p>
        <p className="text-xs text-muted-foreground">Premium nightlife web experience</p>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-11 w-11 border-white/10 bg-card/70 backdrop-blur-md transition-colors hover:border-primary/50 hover:bg-card"
      data-testid="theme-toggle-button"
    >
      {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function OfflineBanner() {
  return (
    <div className="sticky top-0 z-[300] px-4 pt-4">
      <Alert className="mx-auto max-w-5xl border-primary/20 bg-card/95 backdrop-blur-md">
        <WifiOff className="h-4 w-4 text-primary" />
        <AlertTitle data-testid="offline-banner-title">Offline shell active</AlertTitle>
        <AlertDescription data-testid="offline-banner-description">
          You are viewing cached Vaal Vibes content in your browser. New requests and edits need a connection before they can sync.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function CustomerFrame({ children, customerUser, theme, setTheme, logoutCustomer }) {
  return (
    <div className="pb-28">
      <header className="sticky top-0 z-[120] border-b border-white/5 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[560px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandBadge />
          <div className="flex items-center gap-2">
            {customerUser ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logoutCustomer()}
                className="h-11 w-11 rounded-full bg-white/5 hover:bg-white/10"
                data-testid="customer-logout-header-button"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button asChild variant="outline" className="h-11 border-primary/25 bg-card/70 text-white hover:bg-primary hover:text-primary-foreground" data-testid="customer-login-header-link">
                <Link to="/login">Login</Link>
              </Button>
            )}
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[560px] px-4 py-6 sm:px-6">{children}</main>
      <CustomerBottomNav />
    </div>
  );
}

function CustomerBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[140] border-t border-white/10 bg-[#111111]/92 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]" data-testid="customer-bottom-nav">
      <div
        className="mx-auto grid max-w-[560px] gap-1 px-2 py-2"
        style={{ gridTemplateColumns: `repeat(${customerLinks.length}, minmax(0, 1fr))` }}
      >
        {customerLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-12 flex-col items-center justify-center rounded-2xl border px-2 py-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
                }`
              }
              data-testid={`bottom-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="mb-1 h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function AdminFrame({ children, adminUser, logoutAdmin, adminSheetOpen, setAdminSheetOpen, theme, setTheme }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 border-r border-white/5 bg-card/80 p-6 backdrop-blur-xl lg:block">
        <div className="vv-noise rounded-3xl border border-primary/15 bg-[#151515] p-5">
          <BrandBadge />
          <p className="mt-4 text-sm text-muted-foreground">Admin console for content, promo validation, campaigns, and audit trails.</p>
        </div>
        <div className="mt-6 space-y-2">{adminLinks.map((link) => <AdminNavLink key={link.to} link={link} />)}</div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-[120] border-b border-white/5 bg-background/85 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Sheet open={adminSheetOpen} onOpenChange={setAdminSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden" data-testid="admin-mobile-menu-button">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[86%] border-white/10 bg-card text-left">
                  <SheetHeader>
                    <SheetTitle>Admin navigation</SheetTitle>
                    <SheetDescription>Quick links for the Vaal Vibes operations console.</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">{adminLinks.map((link) => <AdminNavLink key={link.to} link={link} onNavigate={() => setAdminSheetOpen(false)} />)}</div>
                </SheetContent>
              </Sheet>
              <div>
                <p className="font-display text-3xl text-white">Operations Console</p>
                <p className="text-xs text-muted-foreground">Vaal Vibes Operations Console</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="border-primary/25 bg-primary/10 px-3 py-1 text-primary" data-testid="admin-user-role-badge">
                {adminUser?.role || "admin"}
              </Badge>
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <Button variant="ghost" size="icon" onClick={() => logoutAdmin()} data-testid="admin-logout-button">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({ link, onNavigate }) {
  const Icon = link.icon;
  return (
    <NavLink
      to={link.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
          isActive
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-white/5 bg-white/5 text-muted-foreground hover:border-white/10 hover:bg-white/10 hover:text-white"
        }`
      }
      data-testid={`admin-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Icon className="h-4 w-4" />
      <span>{link.label}</span>
    </NavLink>
  );
}

function HeroActions({ onOpenRequest }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button asChild className="h-12 px-5" data-testid="hero-view-menu-button">
        <Link to="/menu">View menu</Link>
      </Button>
      <Button variant="outline" className="h-12 border-primary/25 bg-black/35 text-white hover:bg-primary hover:text-primary-foreground" onClick={() => onOpenRequest("Tonight at Vaal Vibes")} data-testid="hero-reserve-button">
        Reserve now
      </Button>
      <Button asChild variant="ghost" className="h-12 text-white hover:bg-white/10" data-testid="hero-events-button">
        <Link to="/events">Browse events</Link>
      </Button>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.28em] text-primary">{eyebrow}</p> : null}
        <h2 className="font-display text-3xl leading-none text-white sm:text-4xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function HomePage({ bootstrap, loading, error, onOpenRequest, onOpenSpecial }) {
  if (loading) {
    return <SkeletonPanel />;
  }

  return (
    <div className="space-y-8" data-testid="customer-home-page">
      {error ? (
        <Alert className="border-primary/20 bg-card/80">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertTitle data-testid="bootstrap-error-title">Sync notice</AlertTitle>
          <AlertDescription data-testid="bootstrap-error-description">{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-black" data-testid="home-hero-section">
        <div className="p-6 sm:p-8">
          {/* Mobile: badge+logo on left, image on right. Desktop: all text left, image right */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <Badge className="w-fit border-primary/25 bg-primary/15 px-3 py-1 text-primary" data-testid="hero-brand-badge">
                Premium venue • Pay at venue
              </Badge>
              <img src={FULL_LOGO_IMAGE} alt="Vaal Vibes full logo" className="h-16 w-auto max-w-full object-contain sm:h-24 lg:h-28" data-testid="hero-logo-image" />
              {/* Description + buttons shown inside left column on lg+ only */}
              <div className="hidden lg:block space-y-4">
                <p className="max-w-md text-sm text-white/75" data-testid="hero-description">
                  Browse the menu, book your table, and send order requests directly from your browser — all wrapped in the Vaal Vibes black-and-gold experience.
                </p>
                <HeroActions onOpenRequest={onOpenRequest} />
              </div>
            </div>
            <div className="rounded-[26px] border border-primary/15 bg-[#050505] p-2 sm:p-3">
              <div className="overflow-hidden rounded-[22px] bg-black">
                <img src={HERO_IMAGE} alt="Vaal Vibes welcome shots" className="h-[240px] w-full vv-image-cover scale-[1.05] sm:h-[300px] lg:h-[360px] lg:scale-[1.15]" data-testid="hero-feature-image" />
              </div>
            </div>
          </div>
          {/* Description + buttons shown below grid on mobile only */}
          <div className="mt-5 space-y-3 lg:hidden">
            <p className="text-sm text-white/75" data-testid="hero-description">
              Browse the menu, book your table, and send order requests directly from your browser — all wrapped in the Vaal Vibes black-and-gold experience.
            </p>
            <HeroActions onOpenRequest={onOpenRequest} />
          </div>
        </div>
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="vv-divider mb-5" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Menu categories", value: bootstrap.menu.length },
              { label: "Upcoming events", value: bootstrap.events.length },
              { label: "Live specials", value: bootstrap.specials.length },
              { label: "Service note", value: "10% fee" },
            ].map((item) => (
              <Card key={item.label} className="border-white/10 bg-[#0a0a0a] backdrop-blur-md">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white" data-testid={`hero-stat-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Tonight"
          title="Specials that set the tone"
          description="Signature specials, VIP packages, and limited-run deals — all available for request at the venue."
          action={
            <Button asChild variant="ghost" className="text-primary hover:bg-primary/10" data-testid="home-menu-link-button">
              <Link to="/menu">Open menu <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bootstrap.specials.map((special) => {
            const specialImage = getSpecialFeatureImage(special);
            return (
            <Card key={special.id} className="group overflow-hidden border-white/10 bg-card transition-colors hover:border-primary/40" data-testid="special-card">
              <div className="relative h-44 overflow-hidden">
                <img src={specialImage} alt={special.title} className="h-full w-full vv-image-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white" data-testid={`special-title-${special.id}`}>{special.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{special.description}</p>
                  </div>
                  <Badge className="border-primary/20 bg-primary/10 text-primary">{special.price_label}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {special.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/10 bg-transparent text-muted-foreground">{tag}</Badge>
                  ))}
                </div>
                <Button variant="outline" className="w-full border-primary/25 bg-transparent text-white hover:bg-primary hover:text-primary-foreground" onClick={() => onOpenSpecial(special)} data-testid={`special-open-button-${special.id}`}>
                  View special
                </Button>
              </CardContent>
            </Card>
          );
          })}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Line-up" title="Upcoming events" description="Request a booking, RSVP intent, or booth reservation before the venue fills up." />
        <div className="space-y-4">
          {bootstrap.events.map((event) => (
            <Card key={event.id} className="overflow-hidden border-white/10 bg-card transition-colors hover:border-primary/35" data-testid="event-card">
              <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                <div className="flex items-center justify-center bg-black/40">
                  <img src={getEventFeatureImage(event)} alt={event.title} className="h-auto max-h-[520px] w-full object-contain" />
                </div>
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Badge className="border-primary/20 bg-primary/10 text-primary">{formatDate(event.date)}</Badge>
                      <h3 className="mt-3 font-display text-3xl leading-none text-white">{event.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge variant="outline" className="border-white/10 bg-transparent text-white">{event.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-primary" />{formatDateTime(event.date)}</span>
                    <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{event.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(event.lineup || []).map((artist) => (
                      <Badge key={artist} variant="outline" className="border-white/10 bg-white/5 text-white">{artist}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button className="h-11" onClick={() => onOpenRequest(event.title)} data-testid={`event-request-button-${event.id}`}>
                      {event.cta_label || "Request booking"}
                    </Button>
                    <Button asChild variant="ghost" className="text-primary hover:bg-primary/10" data-testid={`event-menu-link-${event.id}`}>
                      <Link to="/menu">Pair with menu</Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-card">
        <div className="overflow-hidden border-b border-primary/15 bg-black">
          <img src="/partybook.jpg" alt="Birthday celebration at Vaal Vibes" className="h-[220px] w-full vv-image-cover sm:h-[280px]" data-testid="birthday-section-image" />
        </div>
        <div className="p-6 sm:p-8">
          <SectionHeading
            eyebrow="Celebrate"
            title="Birthday bookings at Vaal Vibes"
            description="Planning a birthday turn-up? Send your date, guest count, budget, and arrival time so the team can shape a booth, bottle, and food setup around your vibe."
            action={
              <Button asChild className="h-11" data-testid="birthday-section-cta-button">
                <Link to="/birthdays">Plan your birthday</Link>
              </Button>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "VIP booths and bottle service options",
              "Budget-aware planning for groups",
              "Arrival-time coordination with the venue team",
              "Space for decor, cake, and shout-out notes",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-white">Promo wallet preview</CardTitle>
            <CardDescription>Sign in to receive a welcome promo and track active venue rewards.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">Welcome reward</p>
                  <p className="mt-2 text-3xl font-semibold text-white" data-testid="wallet-preview-discount">To be announced soon.</p>
                </div>
                <Ticket className="h-8 w-8 text-primary" />
              </div>
            </div>
            <Button asChild className="h-12" data-testid="wallet-preview-login-button">
              <Link to="/login">Unlock your wallet</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-white/10 bg-card">
          <div className="relative h-40 overflow-hidden border-b border-white/10 bg-black">
            <img src={VENUE_FEATURE_IMAGE} alt="Vaal Vibes bar scene" className="h-full w-full vv-image-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/45 to-transparent" />
            <img src={FULL_LOGO_IMAGE} alt="Vaal Vibes logo" className="absolute bottom-4 left-4 h-10 w-auto object-contain" />
          </div>
          <CardHeader>
            <CardTitle className="font-display text-3xl text-white">Hours & location</CardTitle>
            <CardDescription>{bootstrap.service_note}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="hours" className="w-full">
              <AccordionItem value="hours" className="border-white/10">
                <AccordionTrigger className="text-white">Operating schedule</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {(bootstrap.venue_hours || []).map((row) => (
                      <li key={row} className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 text-primary" />{row}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="address" className="border-white/10">
                <AccordionTrigger className="text-white">Venue experience</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">Where Luxury Lifestyle meets exceptional Vibes — matte-black surfaces, gold highlights, and premium bottle moments.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MenuPage({ bootstrap, loading, onAddToRequest }) {
  if (loading) {
    return <SkeletonPanel />;
  }

  return (
    <div className="space-y-6" data-testid="menu-page">
      <SectionHeading eyebrow="Digital menu" title="Browse by category" description="Use the menu to build an order request. No online payment in MVP — your request is confirmed for pay-at-venue handling." />
      <Card className="border-primary/15 bg-card/90">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <BellRing className="mt-0.5 h-4 w-4 text-primary" />
            <p data-testid="menu-service-note">{bootstrap.service_note}</p>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue={bootstrap.menu?.[0]?.slug || "food"} className="w-full">
        <div className="sticky top-20 z-20 overflow-x-auto rounded-2xl border border-white/5 bg-background/90 p-2 backdrop-blur-md vv-scrollbar">
          <TabsList className="inline-flex h-auto min-w-full justify-start gap-2 bg-transparent p-0" data-testid="menu-category-tabs">
            {(bootstrap.menu || []).map((category) => (
              <TabsTrigger
                key={category.slug}
                value={category.slug}
                className="rounded-2xl border border-white/10 bg-card px-4 py-2 text-sm text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {(bootstrap.menu || []).map((category) => {
          const groups = (category.items || []).reduce((acc, item) => {
            const key = item.subcategory || "All items";
            acc[key] = acc[key] || [];
            acc[key].push(item);
            return acc;
          }, {});

          return (
            <TabsContent key={category.slug} value={category.slug} className="mt-5">
              <Card className="border-white/10 bg-card">
                <CardHeader>
                  <CardTitle className="font-display text-3xl text-white">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" defaultValue={Object.keys(groups).map((groupName) => `${category.slug}-${groupName}`)} className="w-full space-y-3">
                    {Object.entries(groups).map(([groupName, items]) => (
                      <AccordionItem key={groupName} value={`${category.slug}-${groupName}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 px-4">
                        <AccordionTrigger className="text-base text-white">{groupName}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {items.map((item) => (
                              <div key={item.id} className="rounded-2xl border border-white/5 bg-card/60 p-4" data-testid={`menu-item-${item.id}`}>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-medium text-white">{item.name}</p>
                                      {item.featured ? <Badge className="border-primary/20 bg-primary/10 text-primary">Featured</Badge> : null}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {(item.tags || []).map((tag) => (
                                        <Badge key={tag} variant="outline" className="border-white/10 bg-transparent text-muted-foreground">{tag}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:text-right">
                                    <p className="text-lg font-semibold text-white">{item.price_label}</p>
                                    <Button size="sm" className="sm:mt-3" onClick={() => onAddToRequest(item)} data-testid={`menu-item-request-button-${item.id}`}>
                                      Request order
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

const DRIVE_FILE_ID_REGEX = /\/d\/([a-zA-Z0-9_-]+)|[?&]id=([a-zA-Z0-9_-]+)/;

const extractDriveFileId = (input = "") => {
  if (!input) return "";
  const match = input.match(DRIVE_FILE_ID_REGEX);
  if (match) {
    return match[1] || match[2] || "";
  }
  return input.trim();
};

const driveThumbnailUrl = (fileId, size = "w1600") =>
  fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}` : "";

function GalleryPage({ photos, loading }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [removalOpen, setRemovalOpen] = useState(false);
  const list = Array.isArray(photos) ? photos : [];

  if (loading) {
    return <SkeletonPanel />;
  }

  const openLightbox = (photo) => {
    setActivePhoto(photo);
  };

  const closeLightbox = (open) => {
    if (!open) {
      setActivePhoto(null);
    }
  };

  const openRemoval = () => {
    setRemovalOpen(true);
  };

  return (
    <div className="space-y-6" data-testid="gallery-page">
      <SectionHeading
        eyebrow="Memories"
        title="Vaal Vibes gallery"
        description="A taste of nights past — line-ups, plates, and the crowd that makes the venue tick."
      />
      {list.length === 0 ? (
        <EmptyState
          title="No gallery photos yet."
          body="Once the team uploads memories, they will appear right here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="gallery-grid">
          {list.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openLightbox(photo)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-card text-left transition-colors hover:border-primary/40"
              data-testid={`gallery-tile-${photo.id}`}
            >
              <img
                loading="lazy"
                src={driveThumbnailUrl(photo.drive_file_id, "w1600")}
                alt={photo.caption || "Vaal Vibes gallery photo"}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {photo.caption ? (
                <div className="border-t border-white/5 px-4 py-3 text-sm text-muted-foreground">
                  {photo.caption}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      )}
      <Dialog open={Boolean(activePhoto)} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-3xl border-white/10 bg-card">
          {activePhoto ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-white">
                  {activePhoto.caption || "Vaal Vibes gallery"}
                </DialogTitle>
                <DialogDescription>
                  Spot yourself? Request removal and the team will take it down.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <img
                  src={driveThumbnailUrl(activePhoto.drive_file_id, "w2400")}
                  alt={activePhoto.caption || "Vaal Vibes gallery photo"}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-3">
                <Button
                  variant="outline"
                  onClick={openRemoval}
                  data-testid="gallery-request-removal-button"
                >
                  Request removal
                </Button>
              </div>
              <RemovalRequestDialog
                open={removalOpen}
                onOpenChange={setRemovalOpen}
                photo={activePhoto}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RemovalRequestDialog({ open, onOpenChange, photo }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setReason("");
      setSubmitting(false);
    }
  }, [open]);

  const submit = async () => {
    if (!photo) return;
    if (!name.trim() || !email.trim() || !reason.trim()) {
      toast.error("Please fill in your name, email, and reason.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(FORMSPREE_ENDPOINT, {
        _subject: `Gallery removal request — photo ${photo.drive_file_id}`,
        photo_id: photo.id,
        drive_file_id: photo.drive_file_id,
        caption: photo.caption || "",
        name,
        email,
        reason,
      });
      toast.success("Removal request sent. The team will be in touch.");
      onOpenChange(false);
    } catch (error) {
      toast.error("Could not send removal request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-card">
        <DialogHeader>
          <DialogTitle>Request photo removal</DialogTitle>
          <DialogDescription>
            Share your details and we will follow up within one business day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Your name" testId="removal-form-name-input">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Email" testId="removal-form-email-input">
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Reason" testId="removal-form-reason-input">
            <Textarea
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Let us know why you would like the photo removed."
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={submitting}
              data-testid="removal-form-submit-button"
            >
              {submitting ? "Sending..." : "Send request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EventsPage({ events, loading, onOpenRequest }) {
  const [filter, setFilter] = useState("week");
  const filtered = getEventFilter(events || [], filter);

  if (loading) {
    return <SkeletonPanel />;
  }

  return (
    <div className="space-y-6" data-testid="events-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading eyebrow="Bookings" title="Event calendar" description="Use quick filters to scan what is happening this week, this month, or across the full line-up." />
        <Button asChild variant="outline" size="sm" className="border-primary/25 bg-card/70 text-white hover:bg-primary hover:text-primary-foreground" data-testid="events-posters-link">
          <a href={POSTERS_FOLDER_URL} target="_blank" rel="noopener noreferrer">Download event posters</a>
        </Button>
      </div>
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid h-auto grid-cols-3 gap-2 bg-transparent p-0">
          <TabsTrigger value="week" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">This week</TabsTrigger>
          <TabsTrigger value="month" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">This month</TabsTrigger>
          <TabsTrigger value="all" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">All</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="space-y-4">
        {filtered.map((event) => (
          <Card key={event.id} className="overflow-hidden border-white/10 bg-card" data-testid={`events-list-card-${event.id}`}>
            <div className="grid gap-4 md:grid-cols-[220px_120px_1fr_auto]">
              <div className="flex items-center justify-center bg-black/40">
                <img src={getEventFeatureImage(event)} alt={event.title} className="h-auto max-h-[520px] w-full object-contain" />
              </div>
              <CardContent className="flex items-center justify-center p-5 md:p-4">
                <div className="w-full rounded-2xl border border-primary/20 bg-primary/10 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">Date</p>
                  <p className="mt-3 font-display text-4xl text-white">{new Date(event.date).getDate()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleString("en-ZA", { month: "short" })}</p>
                </div>
              </CardContent>
              <CardContent className="flex flex-col justify-center gap-4 p-5">
                <div>
                  <h3 className="font-display text-3xl text-white">{event.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(event.lineup || []).map((artist) => (
                    <Badge key={artist} variant="outline" className="border-white/10 bg-white/5 text-white">{artist}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardContent className="flex flex-col justify-center gap-2 p-5 md:items-end">
                <Badge className="border-primary/20 bg-primary/10 text-primary">{formatDateTime(event.date)}</Badge>
                <Button onClick={() => onOpenRequest(event.title)} data-testid={`events-request-button-${event.id}`}>Request booking</Button>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BirthdayPage() {
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [formState, setFormState] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    celebration_date: new Date().toISOString().split("T")[0],
    arrival_time: "19:00",
    guest_count: 10,
    estimated_budget: 2500,
    seating_preference: "vip",
    bottle_service: true,
    notes: "",
  });

  const submitBirthdayRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const birthdayPayload = {
        full_name: formState.full_name,
        email: formState.email,
        phone: formState.phone,
        date_of_birth: formState.date_of_birth,
        celebration_date: buildIsoDateTime(new Date(formState.celebration_date), formState.arrival_time),
        arrival_time: formState.arrival_time,
        guest_count: Number(formState.guest_count),
        estimated_budget: Number(formState.estimated_budget),
        seating_preference: formState.seating_preference,
        bottle_service: formState.bottle_service,
        notes: formState.notes,
      };
      const response = await api.post("/public/birthday-requests", birthdayPayload);

      if (FORMSPREE_ENDPOINT) {
        axios.post(FORMSPREE_ENDPOINT, {
          _subject: `Birthday Booking — ${formState.full_name}`,
          name: formState.full_name,
          email: formState.email,
          phone: formState.phone,
          celebration_date: formState.celebration_date,
          guest_count: formState.guest_count,
          budget: `R${formState.estimated_budget}`,
          seating: formState.seating_preference,
          bottle_service: formState.bottle_service ? "Yes" : "No",
          notes: formState.notes || "None",
        }).catch(() => {});
      }

      setReferenceId(response.data.reference_id);
      toast.success("Birthday booking request sent.");
      setFormState({
        full_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        celebration_date: new Date().toISOString().split("T")[0],
        arrival_time: "19:00",
        guest_count: 10,
        estimated_budget: 2500,
        seating_preference: "vip",
        bottle_service: true,
        notes: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not send the birthday request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="birthday-page">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-card">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="space-y-4">
            <Badge className="w-fit border-primary/25 bg-primary/15 px-3 py-1 text-primary">Birthday bookings</Badge>
            <h1 className="font-display text-5xl leading-[0.92] text-white">Plan your birthday with the Vaal Vibes team</h1>
            <p className="text-sm text-white/75">
              Share your date of birth, celebration night, guest count, budget, and booth preferences. We will use it to plan a smooth birthday setup at the venue.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "VIP seating or standard indoor placement",
                "Bottle service preference",
                "Budget-friendly group planning",
                "Notes for cake, shout-outs, and decor",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-primary/15 bg-black">
            <img src="/partybook.jpg" alt="Birthday crowd at Vaal Vibes" className="h-[360px] w-full vv-image-cover" data-testid="birthday-page-image" />
          </div>
        </div>
      </section>

      <Card className="border-white/10 bg-card">
        <CardHeader>
          <CardTitle className="font-display text-4xl text-white">Birthday request form</CardTitle>
          <CardDescription>Fill in the details below and the venue team can plan your birthday booking around your budget and guest count.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={submitBirthdayRequest}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" testId="birthday-full-name-input-field">
                <Input data-testid="birthday-full-name-input" value={formState.full_name} onChange={(event) => setFormState((current) => ({ ...current, full_name: event.target.value }))} />
              </Field>
              <Field label="Phone" testId="birthday-phone-input-field">
                <Input data-testid="birthday-phone-input" value={formState.phone} onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))} />
              </Field>
              <Field label="Email" testId="birthday-email-input-field">
                <Input data-testid="birthday-email-input" value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} />
              </Field>
              <Field label="Date of birth" testId="birthday-dob-input-field">
                <Input data-testid="birthday-dob-input" value={formState.date_of_birth} onChange={(event) => setFormState((current) => ({ ...current, date_of_birth: event.target.value }))} placeholder="YYYY-MM-DD" />
              </Field>
              <Field label="Celebration date" testId="birthday-celebration-date-field">
                <Input data-testid="birthday-celebration-date-input" type="date" value={formState.celebration_date} onChange={(event) => setFormState((current) => ({ ...current, celebration_date: event.target.value }))} />
              </Field>
              <Field label="Arrival time" testId="birthday-arrival-time-input-field">
                <Input data-testid="birthday-arrival-time-input" value={formState.arrival_time} onChange={(event) => setFormState((current) => ({ ...current, arrival_time: event.target.value }))} placeholder="19:00" />
              </Field>
              <Field label="Number of guests" testId="birthday-guest-count-input-field">
                <Input data-testid="birthday-guest-count-input" value={formState.guest_count} onChange={(event) => setFormState((current) => ({ ...current, guest_count: event.target.value }))} />
              </Field>
              <Field label="Estimated budget (ZAR)" testId="birthday-budget-input-field">
                <Input data-testid="birthday-budget-input" value={formState.estimated_budget} onChange={(event) => setFormState((current) => ({ ...current, estimated_budget: event.target.value }))} />
              </Field>
              <Field label="Seating preference" testId="birthday-seating-select-field">
                <Select value={formState.seating_preference} onValueChange={(value) => setFormState((current) => ({ ...current, seating_preference: value }))}>
                  <SelectTrigger data-testid="birthday-seating-select"><SelectValue placeholder="Choose seating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="patio">Patio</SelectItem>
                    <SelectItem value="vip">VIP booth</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3" data-testid="birthday-bottle-service-switch-field">
                <div>
                  <p className="font-medium text-white">Bottle service interest</p>
                  <p className="text-xs text-muted-foreground">Let the team know if you want a bottle and booth setup.</p>
                </div>
                <Switch data-testid="birthday-bottle-service-switch" checked={formState.bottle_service} onCheckedChange={(checked) => setFormState((current) => ({ ...current, bottle_service: Boolean(checked) }))} />
              </div>
            </div>
            <Field label="Special requests" testId="birthday-notes-input-field">
              <Textarea data-testid="birthday-notes-input" rows={5} value={formState.notes} onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))} placeholder="Cake setup, decor colors, DJ shout-out, food platters, booth style, or anything else important." />
            </Field>
            {referenceId ? (
              <Card className="border-primary/20 bg-primary/10">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary">Birthday reference</p>
                  <p className="mt-2 text-3xl font-semibold text-white" data-testid="birthday-reference-id">{referenceId}</p>
                </CardContent>
              </Card>
            ) : null}
            <Button type="submit" className="h-12 w-full" disabled={submitting} data-testid="birthday-submit-button">
              {submitting ? "Sending request..." : "Send birthday request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function WalletPage({ wallet, requests, loading }) {
  if (loading) {
    return <SkeletonPanel />;
  }
  return (
    <div className="space-y-6" data-testid="wallet-page">
      <SectionHeading eyebrow="Your rewards" title="Promo wallet" description="Show your approved promo to staff for validation. Redemption happens on the admin side at the venue." />
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {(wallet || []).map((promo) => (
            <Card key={promo.id} className="border-primary/20 bg-gradient-to-br from-card to-[#161616]" data-testid={`wallet-promo-card-${promo.id}`}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-primary">Active promo</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{promo.code}</p>
                  </div>
                  <Ticket className="h-7 w-7 text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted-foreground">Discount</p>
                    <p className="mt-1 font-semibold text-white">{promo.discount_value}{promo.discount_type === "percentage" ? "%" : " ZAR"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-muted-foreground">Min spend</p>
                    <p className="mt-1 font-semibold text-white">{formatCurrency(promo.min_spend)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge className="border-primary/20 bg-primary/10 text-primary">Expires {formatDate(promo.expires_at)}</Badge>
                  <Badge variant="outline" className="border-white/10 bg-transparent text-white">{promo.status}</Badge>
                </div>
                <Card className="border-white/10 bg-black/30">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">QR display</p>
                    <p className="mt-2 text-sm text-white" data-testid="wallet-qr-mocked-label">Show the promo code to staff at the venue for validation.</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ))}
          {!wallet?.length ? <EmptyState title="No promos yet" body="Sign in again or ask venue staff to issue a promo after account verification." /> : null}
        </div>
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-white">Recent requests</CardTitle>
            <CardDescription>Keep track of your latest reservations and order intents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(requests || []).slice(0, 4).map((request) => (
              <div key={request.id} className="rounded-2xl border border-white/10 bg-black/20 p-4" data-testid={`wallet-request-card-${request.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{request.reference_id}</p>
                    <p className="text-xs text-muted-foreground">{request.request_type}</p>
                  </div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">{request.status}</Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(request.date)}</p>
              </div>
            ))}
            {!requests?.length ? <EmptyState title="No requests yet" body="Send a reservation or order request from the menu or event pages." compact /> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfilePage({ token, profile, requests, refresh, logoutCustomer, wallet, customerLoading }) {
  const navigate = useNavigate();
  const location = useLocation();
  const allowedTabs = ["wallet", "bookings", "settings"];
  const queryTab = new URLSearchParams(location.search).get("tab");
  const activeTab = allowedTabs.includes(queryTab) ? queryTab : "wallet";

  const handleTabChange = (value) => {
    navigate(`/profile?tab=${value}`, { replace: true });
  };

  const [formState, setFormState] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    password: "",
    dob: profile?.dob || "",
    dietary: profile?.preferences?.dietary || [],
    seating: profile?.preferences?.seating || "indoor",
    music_vibe: profile?.preferences?.music_vibe || "afro-house",
    marketing_opt_in: profile?.preferences?.marketing_opt_in ?? true,
  });

  useEffect(() => {
    setFormState({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      password: "",
      dob: profile?.dob || "",
      dietary: profile?.preferences?.dietary || [],
      seating: profile?.preferences?.seating || "indoor",
      music_vibe: profile?.preferences?.music_vibe || "afro-house",
      marketing_opt_in: profile?.preferences?.marketing_opt_in ?? true,
    });
  }, [profile]);

  const dietaryOptions = ["none", "halal", "vegetarian", "gluten-free"];

  const toggleDietary = (value) => {
    setFormState((current) => ({
      ...current,
      dietary: current.dietary.includes(value)
        ? current.dietary.filter((item) => item !== value)
        : [...current.dietary, value],
    }));
  };

  const saveProfile = async () => {
    try {
      await api.put(
        "/customer/profile",
        {
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          password: formState.password || "keep-current-password",
          dob: formState.dob,
          preferences: {
            dietary: formState.dietary,
            seating: formState.seating,
            music_vibe: formState.music_vibe,
            marketing_opt_in: formState.marketing_opt_in,
          },
        },
        authConfig(token),
      );
      toast.success("Profile updated.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not update your profile.");
    }
  };

  return (
    <div className="space-y-6" data-testid="profile-page">
      <SectionHeading eyebrow="Account" title="Your account" description="View your promo wallet, booking history, and preferences in one place." />
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid h-auto grid-cols-3 gap-2 bg-transparent p-0">
          <TabsTrigger value="wallet" data-testid="profile-tab-wallet" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Wallet</TabsTrigger>
          <TabsTrigger value="bookings" data-testid="profile-tab-bookings" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Bookings</TabsTrigger>
          <TabsTrigger value="settings" data-testid="profile-tab-settings" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="mt-6">
          <WalletPage wallet={wallet} loading={customerLoading} requests={requests} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card className="border-white/10 bg-card">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-white">My requests</CardTitle>
              <CardDescription>Recent bookings and order intents linked to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(requests || []).map((request) => (
                <div key={request.id} className="rounded-2xl border border-white/10 bg-black/20 p-4" data-testid={`profile-request-${request.id}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{request.reference_id}</p>
                      <p className="text-xs text-muted-foreground">{request.request_type}</p>
                    </div>
                    <Badge className="border-primary/20 bg-primary/10 text-primary">{request.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(request.date)}</p>
                </div>
              ))}
              {!requests?.length ? <EmptyState title="No saved requests yet" body="Visit the menu or events page to start one." compact /> : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="border-white/10 bg-card">
            <CardContent className="space-y-6 p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-primary/25">
                  <AvatarImage src="/logo.png" alt={profile?.name || "Customer avatar"} />
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials(profile?.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-white" data-testid="profile-name-display">{profile?.name}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" testId="profile-name-input">
                  <Input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} />
                </Field>
                <Field label="Phone" testId="profile-phone-input">
                  <Input value={formState.phone} onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))} />
                </Field>
                <Field label="Email" testId="profile-email-input">
                  <Input value={formState.email} disabled />
                </Field>
                <Field label="Date of birth" testId="profile-dob-input">
                  <Input value={formState.dob} onChange={(event) => setFormState((current) => ({ ...current, dob: event.target.value }))} placeholder="YYYY-MM-DD" />
                </Field>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Seating preference" testId="profile-seating-select">
                  <Select value={formState.seating} onValueChange={(value) => setFormState((current) => ({ ...current, seating: value }))}>
                    <SelectTrigger><SelectValue placeholder="Choose seating" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="patio">Patio</SelectItem>
                      <SelectItem value="vip">VIP booth</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Music vibe" testId="profile-vibe-select">
                  <Select value={formState.music_vibe} onValueChange={(value) => setFormState((current) => ({ ...current, music_vibe: value }))}>
                    <SelectTrigger><SelectValue placeholder="Choose vibe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="afro-house">Afro-house</SelectItem>
                      <SelectItem value="amapiano">Amapiano</SelectItem>
                      <SelectItem value="sunday-chill">Sunday chill</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-white">Dietary preferences</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dietaryOptions.map((option) => (
                    <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white" data-testid={`profile-dietary-${option}`}>
                      <Checkbox checked={formState.dietary.includes(option)} onCheckedChange={() => toggleDietary(option)} />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="font-medium text-white">Marketing opt-in</p>
                  <p className="text-xs text-muted-foreground">Email is the only live marketing channel for MVP.</p>
                </div>
                <Switch checked={formState.marketing_opt_in} onCheckedChange={(checked) => setFormState((current) => ({ ...current, marketing_opt_in: Boolean(checked) }))} data-testid="profile-marketing-switch" />
              </div>

              <Field label="Change password" testId="profile-password-input">
                <Input type="password" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} placeholder="Leave blank to keep current password" />
              </Field>

              <div className="flex flex-wrap gap-3">
                <Button onClick={saveProfile} data-testid="profile-save-button">Save changes</Button>
                <Button variant="outline" onClick={() => logoutCustomer()} data-testid="profile-logout-button">Logout</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CustomerLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/auth/login", formState);
      onLogin(response.data);
      toast.success("Welcome back to Vaal Vibes.");
      navigate("/wallet");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Customer login" description="Sign in to view your wallet, profile, and request history." dataTestId="customer-login-card">
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Email" testId="customer-login-email-input">
          <Input value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} />
        </Field>
        <Field label="Password" testId="customer-login-password-input">
          <Input type="password" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} />
        </Field>
        <Button type="submit" className="h-12 w-full" disabled={submitting} data-testid="customer-login-submit-button">
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
        <Button asChild variant="ghost" className="w-full text-primary hover:bg-primary/10" data-testid="customer-login-register-link">
          <Link to="/register">Create account</Link>
        </Button>
      </form>
    </AuthCard>
  );
}

function CustomerRegisterPage({ onRegister }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    dietary: [],
    seating: "indoor",
    music_vibe: "afro-house",
    marketing_opt_in: true,
  });

  const toggleDietary = (option) => {
    setFormState((current) => ({
      ...current,
      dietary: current.dietary.includes(option)
        ? current.dietary.filter((item) => item !== option)
        : [...current.dietary, option],
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/auth/register", {
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        password: formState.password,
        dob: formState.dob,
        preferences: {
          dietary: formState.dietary,
          seating: formState.seating,
          music_vibe: formState.music_vibe,
          marketing_opt_in: formState.marketing_opt_in,
        },
      });
      if (FORMSPREE_ENDPOINT) {
        axios.post(FORMSPREE_ENDPOINT, {
          _subject: `New Customer Registration — ${formState.name}`,
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          marketing_opt_in: formState.marketing_opt_in ? "Yes" : "No",
        }).catch(() => {});
      }
      onRegister(response.data);
      toast.success("Account created and welcome promo issued.");
      navigate("/wallet");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Create your Vaal Vibes account" description="Sign up once to unlock promos, request tracking, and venue-ready preferences." dataTestId="customer-register-card">
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" testId="customer-register-name-input">
            <Input value={formState.name} onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="Phone" testId="customer-register-phone-input">
            <Input value={formState.phone} onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))} />
          </Field>
          <Field label="Email" testId="customer-register-email-input">
            <Input value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} />
          </Field>
          <Field label="Date of birth" testId="customer-register-dob-input">
            <Input value={formState.dob} onChange={(event) => setFormState((current) => ({ ...current, dob: event.target.value }))} placeholder="YYYY-MM-DD" />
          </Field>
        </div>
        <Field label="Password" testId="customer-register-password-input">
          <Input type="password" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Seating" testId="customer-register-seating-select">
            <Select value={formState.seating} onValueChange={(value) => setFormState((current) => ({ ...current, seating: value }))}>
              <SelectTrigger><SelectValue placeholder="Choose seating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="patio">Patio</SelectItem>
                <SelectItem value="vip">VIP booth</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Music vibe" testId="customer-register-vibe-select">
            <Select value={formState.music_vibe} onValueChange={(value) => setFormState((current) => ({ ...current, music_vibe: value }))}>
              <SelectTrigger><SelectValue placeholder="Choose vibe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="afro-house">Afro-house</SelectItem>
                <SelectItem value="amapiano">Amapiano</SelectItem>
                <SelectItem value="sunday-chill">Sunday chill</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-white">Dietary preferences</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {["none", "halal", "vegetarian", "gluten-free"].map((option) => (
              <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white" data-testid={`customer-register-dietary-${option}`}>
                <Checkbox checked={formState.dietary.includes(option)} onCheckedChange={() => toggleDietary(option)} />
                {option}
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div>
            <p className="font-medium text-white">Marketing opt-in</p>
            <p className="text-xs text-muted-foreground">Receive specials and event alerts by email only.</p>
          </div>
          <Switch checked={formState.marketing_opt_in} onCheckedChange={(checked) => setFormState((current) => ({ ...current, marketing_opt_in: Boolean(checked) }))} data-testid="customer-register-marketing-switch" />
        </div>
        <Button type="submit" className="h-12 w-full" disabled={submitting} data-testid="customer-register-submit-button">
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}

function AuthCard({ title, description, children, dataTestId }) {
  return (
    <div className="flex min-h-[calc(100vh-13rem)] items-center justify-center">
      <Card className="vv-noise w-full max-w-xl border-primary/20 bg-card/95 vv-card-glow" data-testid={dataTestId}>
        <CardHeader>
          <CardTitle className="font-display text-4xl text-white">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function AdminLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [mfaSetup, setMfaSetup] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/admin/auth/login", formState);
      if (response.data?.mfa_setup_required) {
        setMfaSetup({
          provisioning_uri: response.data.provisioning_uri,
          secret: response.data.secret,
          issuer: response.data.issuer,
        });
        toast.message("Add the secret to your authenticator app, then enter the 6-digit code below.");
      } else {
        onLogin(response.data);
        toast.success("Admin access granted.");
        navigate("/admin");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Admin login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = async () => {
    if (!mfaSetup?.secret) return;
    try {
      await navigator.clipboard.writeText(mfaSetup.secret);
      toast.success("Secret copied.");
    } catch (_err) {
      toast.error("Could not copy. Select and copy manually.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] px-4 py-10">
      <Card className="vv-noise w-full max-w-lg border-primary/20 bg-card/95 vv-card-glow" data-testid="admin-login-card">
        <CardHeader>
          <div className="mb-3 h-px w-24 bg-primary/70" />
          <CardTitle className="font-display text-5xl text-white">Admin login</CardTitle>
          <CardDescription>Separate staff access for marketing, promo validation, and audit operations.</CardDescription>
        </CardHeader>
        <CardContent>
          {mfaSetup && (
            <div
              className="mb-5 space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-white/85"
              data-testid="admin-login-mfa-enrollment"
            >
              <p className="font-semibold text-white">Enroll your authenticator</p>
              <p className="text-white/75">
                Open Google Authenticator, Authy, or 1Password and add a new account using the secret below (or
                tap the otpauth link on a phone). The next code from the app completes login.
              </p>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-white/50">Manual entry secret</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded bg-black/40 px-2 py-1 font-mono text-xs text-primary">
                    {mfaSetup.secret}
                  </code>
                  <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={copySecret}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-white/50">
                  Issuer: {mfaSetup.issuer} · Account: {formState.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-white/50">Or open on this device</p>
                <a
                  className="break-all text-xs text-primary underline"
                  href={mfaSetup.provisioning_uri}
                  rel="noreferrer"
                >
                  {mfaSetup.provisioning_uri}
                </a>
              </div>
              <p className="text-xs text-white/50">
                The secret is shown once and never leaves your browser. If you lose access, ask the super admin to
                reset MFA enrollment.
              </p>
            </div>
          )}
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Admin email" testId="admin-login-email-input">
              <Input value={formState.email} onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value }))} />
            </Field>
            <Field label="Password" testId="admin-login-password-input">
              <Input type="password" value={formState.password} onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))} />
            </Field>
            <Field label={mfaSetup ? "Authenticator code (6 digits)" : "MFA code"} testId="admin-login-otp-input">
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder={mfaSetup ? "First code from your authenticator app" : "Leave blank if enrolling for the first time"}
                value={formState.otp}
                onChange={(event) => setFormState((current) => ({ ...current, otp: event.target.value }))}
              />
            </Field>
            <Button type="submit" className="h-12 w-full" disabled={submitting} data-testid="admin-login-submit-button">
              {submitting ? "Signing in..." : mfaSetup ? "Verify & enter console" : "Enter console"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function RequestBuilderDrawer({ open, onOpenChange, requestDraft, setRequestDraft, step, setStep, total, referenceId, onSubmit, onReset, customerProfile }) {
  const summaryItems = requestDraft.items || [];

  return (
    <Drawer open={open} onOpenChange={(next) => (next ? onOpenChange(next) : onReset())}>
      <DrawerContent className="border-white/10 bg-card pb-6">
        <DrawerHeader className="text-left">
          <DrawerTitle data-testid="request-drawer-title">Build your request</DrawerTitle>
          <DrawerDescription>
            Multi-step flow for reservation and order intent. Payment is settled at the venue.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <Progress value={(step / 4) * 100} className="h-2 bg-white/10" data-testid="request-drawer-progress" />
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-4 pt-5 vv-scrollbar">
          {step === 1 ? (
            <div className="space-y-4" data-testid="request-step-details">
              <Field label="Request type" testId="request-type-select">
                <Select value={requestDraft.request_type} onValueChange={(value) => setRequestDraft((current) => ({ ...current, request_type: value }))}>
                  <SelectTrigger><SelectValue placeholder="Choose request type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order-intent">Order intent</SelectItem>
                    <SelectItem value="reservation">Reservation</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Card className="border-white/10 bg-black/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">Selected items</CardTitle>
                  <CardDescription>Menu items can be reviewed or removed before you confirm.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {summaryItems.length ? summaryItems.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card/70 p-3" data-testid={`request-line-item-${item.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{formatCurrency(item.price * item.quantity)}</p>
                        <Button variant="ghost" size="icon" onClick={() => setRequestDraft((current) => ({ ...current, items: current.items.filter((entry) => entry.name !== item.name) }))} data-testid={`request-remove-item-${item.name.toLowerCase().replace(/\s+/g, "-")}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : <EmptyState title="No menu items yet" body="Add menu items from the menu page or continue with a reservation-only request." compact />}
                </CardContent>
              </Card>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4" data-testid="request-step-schedule">
              <DatePickerField
                label="Request date"
                value={requestDraft.selectedDate}
                onChange={(date) => setRequestDraft((current) => ({ ...current, selectedDate: date }))}
                testId="request-date-picker"
              />
              <Field label="Time" testId="request-time-input">
                <Input value={requestDraft.selectedTime} onChange={(event) => setRequestDraft((current) => ({ ...current, selectedTime: event.target.value }))} placeholder="19:00" />
              </Field>
              <Field label="Guest count" testId="request-guest-count-input">
                <Input value={requestDraft.guest_count} onChange={(event) => setRequestDraft((current) => ({ ...current, guest_count: Number(event.target.value) || 1 }))} />
              </Field>
              <Field label="Contact phone" testId="request-contact-phone-input">
                <Input value={requestDraft.contact_phone} onChange={(event) => setRequestDraft((current) => ({ ...current, contact_phone: event.target.value }))} placeholder={customerProfile?.phone || "+27 71 ..."} />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4" data-testid="request-step-confirm">
              <Field label="Extra notes" testId="request-notes-input">
                <Textarea value={requestDraft.notes} onChange={(event) => setRequestDraft((current) => ({ ...current, notes: event.target.value }))} rows={5} placeholder="Tell the team about booth preference, birthday setup, or platter timing." />
              </Field>
              <Card className="border-primary/15 bg-primary/10">
                <CardContent className="space-y-3 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Request type</span>
                    <span className="font-medium text-white">{requestDraft.request_type}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-white">{formatDate(buildIsoDateTime(requestDraft.selectedDate, requestDraft.selectedTime))}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Estimated basket</span>
                    <span className="font-medium text-white">{formatCurrency(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4 text-center" data-testid="request-step-success">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-4xl text-white">Request sent</p>
                <p className="mt-2 text-sm text-muted-foreground">Your reference ID is recorded below for follow-up.</p>
              </div>
              <Card className="border-primary/25 bg-primary/10">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-primary">Reference</p>
                  <p className="mt-3 text-3xl font-semibold text-white" data-testid="request-reference-id">{referenceId}</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
        <DrawerFooter>
          {step < 4 ? (
            <div className="flex w-full flex-col gap-2">
              <Button
                onClick={() => {
                  if (step === 3) {
                    onSubmit();
                    return;
                  }
                  setStep(step + 1);
                }}
                data-testid="request-next-step-button"
              >
                {step === 3 ? "Send request" : "Continue"}
              </Button>
              <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} data-testid="request-back-step-button">
                Back
              </Button>
            </div>
          ) : (
            <Button onClick={onReset} data-testid="request-close-button">Close</Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SpecialDialog({ special, onOpenChange, onRequest }) {
  return (
    <Dialog open={Boolean(special)} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="border-white/10 bg-card">
        {special ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-4xl text-white">{special.title}</DialogTitle>
              <DialogDescription>{special.price_label}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img src={special.image_url || "/vibes.jpeg"} alt={special.title} className="h-56 w-full rounded-3xl vv-image-cover" />
              <p className="text-sm text-muted-foreground">{special.description}</p>
              <div className="flex flex-wrap gap-2">
                {(special.tags || []).map((tag) => (
                  <Badge key={tag} variant="outline" className="border-white/10 bg-transparent text-white">{tag}</Badge>
                ))}
              </div>
              <Button className="w-full" onClick={() => { onRequest(); onOpenChange(null); }} data-testid="special-dialog-request-button">
                Request this special
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AdminDashboardPage({ dashboard, requests, loading }) {
  const chartWidth = Math.max(280, Math.min(560, (typeof window !== "undefined" ? window.innerWidth : 920) - 220));

  if (loading || !dashboard) {
    return <SkeletonPanel />;
  }

  return (
    <div className="space-y-6" data-testid="admin-dashboard-page">
      <SectionHeading eyebrow="Overview" title="Venue operations" description="Snapshot of customer demand, promo activity, and campaign momentum across the Vaal Vibes admin workspace." />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {(dashboard.kpis || []).map((item, index) => (
          <Card key={item.label} className="border-white/10 bg-card" data-testid={`admin-dashboard-kpi-${index}`}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-white">Redemptions over time</CardTitle>
          </CardHeader>
          <CardContent className="h-72 overflow-x-auto">
            <LineChart width={chartWidth} height={260} data={dashboard.redemptions_over_time}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#B5B5B5" fontSize={12} />
              <YAxis stroke="#B5B5B5" fontSize={12} />
              <ChartTooltip contentStyle={{ background: "#1A1A1A", borderColor: "#2A2A2A", borderRadius: 16, color: "#fff" }} />
              <Line type="monotone" dataKey="value" stroke="#F5C518" strokeWidth={3} dot={{ fill: "#F5C518" }} />
            </LineChart>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-white">Request breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72 overflow-x-auto">
            <BarChart width={chartWidth} height={260} data={dashboard.request_breakdown}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#B5B5B5" fontSize={12} />
              <YAxis stroke="#B5B5B5" fontSize={12} />
              <ChartTooltip contentStyle={{ background: "#1A1A1A", borderColor: "#2A2A2A", borderRadius: 16, color: "#fff" }} />
              <Bar dataKey="value" fill="#F5C518" radius={[10, 10, 0, 0]} />
            </BarChart>
          </CardContent>
        </Card>
      </div>
      <Card className="border-white/10 bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent requests</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table data-testid="admin-dashboard-requests-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(requests || []).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.reference_id}</TableCell>
                    <TableCell>{request.request_type}</TableCell>
                    <TableCell>{formatDateTime(request.date)}</TableCell>
                    <TableCell><Badge className="border-primary/20 bg-primary/10 text-primary">{request.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminEventsPage({ token, events, refresh }) {
  const initialForm = { title: "", date: new Date(), time: "20:00", description: "", lineup: "", image_url: "/vibes.jpeg", location: "Vaal Vibes", status: "scheduled", cta_label: "RSVP Intent" };
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formState, setFormState] = useState(initialForm);

  const filtered = (events || []).filter((event) => event.title.toLowerCase().includes(query.toLowerCase()));

  const openCreate = () => {
    setEditingEvent(null);
    setFormState(initialForm);
    setEditorOpen(true);
  };

  const openEdit = (event) => {
    const date = new Date(event.date);
    setEditingEvent(event);
    setFormState({
      title: event.title,
      date,
      time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
      description: event.description,
      lineup: (event.lineup || []).join(", "),
      image_url: event.image_url,
      location: event.location,
      status: event.status,
      cta_label: event.cta_label,
    });
    setEditorOpen(true);
  };

  const saveEvent = async () => {
    const payload = {
      title: formState.title,
      date: buildIsoDateTime(formState.date, formState.time),
      description: formState.description,
      lineup: formState.lineup.split(",").map((value) => value.trim()).filter(Boolean),
      image_url: formState.image_url,
      location: formState.location,
      status: formState.status,
      cta_label: formState.cta_label,
    };

    try {
      if (editingEvent) {
        await api.put(`/admin/events/${editingEvent.id}`, payload, authConfig(token));
        toast.success("Event updated.");
      } else {
        await api.post("/admin/events", payload, authConfig(token));
        toast.success("Event created.");
      }
      setEditorOpen(false);
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not save the event.");
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/admin/events/${eventId}`, authConfig(token));
      toast.success("Event deleted.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not delete the event.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-events-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading eyebrow="Content" title="Events management" description="Create, edit, schedule, or retire upcoming Vaal Vibes event moments." />
        <Button onClick={openCreate} data-testid="create-event-button"><Plus className="mr-2 h-4 w-4" />Create event</Button>
      </div>
      <Card className="border-white/10 bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" data-testid="events-search-input" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-card">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-testid="admin-events-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{formatDateTime(event.date)}</TableCell>
                    <TableCell><Badge className="border-primary/20 bg-primary/10 text-primary">{event.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(event)} data-testid={`edit-event-button-${event.id}`}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteEvent(event.id)} data-testid={`delete-event-button-${event.id}`}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-card sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingEvent ? "Edit event" : "Create event"}</SheetTitle>
            <SheetDescription>Use matte-black surfaces and gold accents per the design guidelines.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field label="Title" testId="event-form-title-input">
              <Input value={formState.title} onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <DatePickerField label="Event date" value={formState.date} onChange={(date) => setFormState((current) => ({ ...current, date }))} testId="event-form-date-picker" />
            <Field label="Time" testId="event-form-time-input">
              <Input value={formState.time} onChange={(event) => setFormState((current) => ({ ...current, time: event.target.value }))} />
            </Field>
            <Field label="Description" testId="event-form-description-input">
              <Textarea rows={4} value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} />
            </Field>
            <Field label="Line-up (comma separated)" testId="event-form-lineup-input">
              <Input value={formState.lineup} onChange={(event) => setFormState((current) => ({ ...current, lineup: event.target.value }))} />
            </Field>
            <Field label="Image URL" testId="event-form-image-input">
              <Input value={formState.image_url} onChange={(event) => setFormState((current) => ({ ...current, image_url: event.target.value }))} />
            </Field>
            <Field label="Status" testId="event-form-status-select">
              <Select value={formState.status} onValueChange={(value) => setFormState((current) => ({ ...current, status: value }))}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Button className="w-full" onClick={saveEvent} data-testid="save-event-button">Save event</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AdminSpecialsPage({ token, specials, refresh }) {
  const initialForm = { title: "", description: "", price_label: "", image_url: "/vibes.jpeg", date: new Date(), time: "23:59", status: "active", tags: "" };
  const [view, setView] = useState("grid");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState(null);
  const [formState, setFormState] = useState(initialForm);

  const openCreate = () => {
    setEditingSpecial(null);
    setFormState(initialForm);
    setEditorOpen(true);
  };

  const openEdit = (special) => {
    const date = new Date(special.available_until);
    setEditingSpecial(special);
    setFormState({
      title: special.title,
      description: special.description,
      price_label: special.price_label,
      image_url: special.image_url,
      date,
      time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
      status: special.status,
      tags: (special.tags || []).join(", "),
    });
    setEditorOpen(true);
  };

  const saveSpecial = async () => {
    const payload = {
      title: formState.title,
      description: formState.description,
      price_label: formState.price_label,
      image_url: formState.image_url,
      available_until: buildIsoDateTime(formState.date, formState.time),
      status: formState.status,
      tags: formState.tags.split(",").map((value) => value.trim()).filter(Boolean),
    };
    try {
      if (editingSpecial) {
        await api.put(`/admin/specials/${editingSpecial.id}`, payload, authConfig(token));
        toast.success("Special updated.");
      } else {
        await api.post("/admin/specials", payload, authConfig(token));
        toast.success("Special created.");
      }
      setEditorOpen(false);
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not save the special.");
    }
  };

  const deleteSpecial = async (specialId) => {
    try {
      await api.delete(`/admin/specials/${specialId}`, authConfig(token));
      toast.success("Special deleted.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not delete the special.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-specials-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading eyebrow="Menu moments" title="Specials management" description="Control signature menu offers and VIP package entries across the customer web app." />
        <Button onClick={openCreate} data-testid="create-special-button"><Plus className="mr-2 h-4 w-4" />Create special</Button>
      </div>
      <Tabs value={view} onValueChange={setView}>
        <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent p-0">
          <TabsTrigger value="grid" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Grid</TabsTrigger>
          <TabsTrigger value="table" className="border border-white/10 bg-card py-3 text-white data-[state=active]:border-primary/35 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Table</TabsTrigger>
        </TabsList>
        <TabsContent value="grid" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(specials || []).map((special) => (
              <Card key={special.id} className="overflow-hidden border-white/10 bg-card" data-testid={`admin-special-card-${special.id}`}>
                <img src={special.image_url || "/vibes.jpeg"} alt={special.title} className="h-48 w-full vv-image-cover" />
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{special.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{special.description}</p>
                    </div>
                    <Badge className="border-primary/20 bg-primary/10 text-primary">{special.price_label}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(special)} data-testid={`edit-special-button-${special.id}`}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteSpecial(special.id)} data-testid={`delete-special-button-${special.id}`}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <Card className="border-white/10 bg-card">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table data-testid="admin-specials-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Special</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(specials || []).map((special) => (
                      <TableRow key={special.id}>
                        <TableCell>{special.title}</TableCell>
                        <TableCell>{special.price_label}</TableCell>
                        <TableCell><Badge className="border-primary/20 bg-primary/10 text-primary">{special.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(special)}>Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteSpecial(special.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-card sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingSpecial ? "Edit special" : "Create special"}</SheetTitle>
            <SheetDescription>Use hosted image URLs for the special image field.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field label="Title" testId="special-form-title-input"><Input value={formState.title} onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))} /></Field>
            <Field label="Description" testId="special-form-description-input"><Textarea rows={4} value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} /></Field>
            <Field label="Price label" testId="special-form-price-input"><Input value={formState.price_label} onChange={(event) => setFormState((current) => ({ ...current, price_label: event.target.value }))} /></Field>
            <Field label="Image URL" testId="special-form-image-input"><Input value={formState.image_url} onChange={(event) => setFormState((current) => ({ ...current, image_url: event.target.value }))} /></Field>
            <DatePickerField label="Available until" value={formState.date} onChange={(date) => setFormState((current) => ({ ...current, date }))} testId="special-form-date-picker" />
            <Field label="Time" testId="special-form-time-input"><Input value={formState.time} onChange={(event) => setFormState((current) => ({ ...current, time: event.target.value }))} /></Field>
            <Field label="Tags" testId="special-form-tags-input"><Input value={formState.tags} onChange={(event) => setFormState((current) => ({ ...current, tags: event.target.value }))} placeholder="vip, share, signature" /></Field>
            <Field label="Status" testId="special-form-status-select">
              <Select value={formState.status} onValueChange={(value) => setFormState((current) => ({ ...current, status: value }))}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Button className="w-full" onClick={saveSpecial} data-testid="save-special-button">Save special</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AdminMenuPage({ token, categories, refresh }) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "" });
  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const initialItemForm = {
    name: "",
    description: "",
    price: 0,
    price_label: "R0.00",
    subcategory: "",
    featured: false,
    tags: "",
    image_url: "",
    auto_label: true,
  };
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [query, setQuery] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const resetMenuToDefaults = async () => {
    setResetSubmitting(true);
    try {
      const response = await api.post("/admin/menu/sync-defaults", {}, authConfig(token));
      const { categories: cats, items, previous_categories: prevCats, previous_items: prevItems } =
        response.data;
      toast.success(
        `Menu reset to defaults — ${cats} categories, ${items} items (was ${prevCats}, ${prevItems}).`,
      );
      setResetDialogOpen(false);
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not reset menu to defaults.");
    } finally {
      setResetSubmitting(false);
    }
  };

  useEffect(() => {
    const list = Array.isArray(categories) ? categories : [];
    if (list.length === 0) {
      setSelectedCategoryId(null);
      return;
    }
    setSelectedCategoryId((current) =>
      list.some((category) => category.id === current) ? current : list[0].id,
    );
  }, [categories]);

  const selectedCategory = safeCategories.find((category) => category.id === selectedCategoryId) || null;
  const filteredItems = (selectedCategory?.items || []).filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", description: "" });
    setCategorySheetOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
    });
    setCategorySheetOpen(true);
  };

  const saveCategory = async () => {
    const payload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim(),
      description: categoryForm.description,
    };
    if (!payload.name || !payload.slug) {
      toast.error("Category name and slug are required.");
      return;
    }
    try {
      if (editingCategory) {
        await api.put(`/admin/menu/categories/${editingCategory.id}`, payload, authConfig(token));
        toast.success("Category updated.");
      } else {
        await api.post("/admin/menu/categories", payload, authConfig(token));
        toast.success("Category created.");
      }
      setCategorySheetOpen(false);
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not save the category.");
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category? This will remove all of its items.")) {
      return;
    }
    try {
      await api.delete(`/admin/menu/categories/${categoryId}`, authConfig(token));
      toast.success("Category deleted.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not delete the category.");
    }
  };

  const openCreateItem = () => {
    if (!selectedCategory) {
      toast.error("Pick a category first.");
      return;
    }
    setEditingItem(null);
    setItemForm(initialItemForm);
    setItemSheetOpen(true);
  };

  const openEditItem = (item) => {
    const expectedAutoLabel = `R${Number(item.price || 0).toFixed(2)}`;
    setEditingItem(item);
    setItemForm({
      name: item.name || "",
      description: item.description || "",
      price: Number(item.price || 0),
      price_label: item.price_label || expectedAutoLabel,
      subcategory: item.subcategory || "",
      featured: Boolean(item.featured),
      tags: (item.tags || []).join(", "),
      image_url: item.image_url || "",
      auto_label: (item.price_label || expectedAutoLabel) === expectedAutoLabel,
    });
    setItemSheetOpen(true);
  };

  const updateItemForm = (patch) => {
    setItemForm((current) => {
      const next = { ...current, ...patch };
      if (next.auto_label) {
        next.price_label = `R${Number(next.price || 0).toFixed(2)}`;
      }
      return next;
    });
  };

  const saveItem = async () => {
    if (!selectedCategory) return;
    if (!itemForm.name.trim()) {
      toast.error("Item name is required.");
      return;
    }
    const payload = {
      name: itemForm.name.trim(),
      description: itemForm.description,
      price: Number(itemForm.price) || 0,
      price_label: itemForm.auto_label
        ? `R${(Number(itemForm.price) || 0).toFixed(2)}`
        : itemForm.price_label,
      category: selectedCategory.slug,
      subcategory: itemForm.subcategory,
      featured: Boolean(itemForm.featured),
      tags: itemForm.tags.split(",").map((value) => value.trim()).filter(Boolean),
      image_url: itemForm.image_url,
    };
    try {
      if (editingItem) {
        await api.put(`/admin/menu/items/${editingItem.id}`, payload, authConfig(token));
        toast.success("Menu item updated.");
      } else {
        await api.post(
          `/admin/menu/categories/${selectedCategory.id}/items`,
          payload,
          authConfig(token),
        );
        toast.success("Menu item created.");
      }
      setItemSheetOpen(false);
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not save the menu item.");
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this menu item?")) {
      return;
    }
    try {
      await api.delete(`/admin/menu/items/${itemId}`, authConfig(token));
      toast.success("Menu item deleted.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not delete the menu item.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-menu-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading
          eyebrow="Content"
          title="Menu management"
          description="Curate categories, items, prices, and tags for the digital menu."
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            data-testid="reset-menu-button"
          >
            Reset to default prices
          </Button>
          <Button onClick={openCreateCategory} data-testid="create-category-button">
            <Plus className="mr-2 h-4 w-4" />Category
          </Button>
        </div>
      </div>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="border-white/10 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset menu to default prices?</AlertDialogTitle>
            <AlertDialogDescription>
              This drops every category and item, then re-inserts the canonical
              menu defined in the backend (15 categories, ~50 items). Any custom
              categories or items added via this page will be lost. The change
              is immediate on the public site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={resetMenuToDefaults}
              disabled={resetSubmitting}
              data-testid="confirm-reset-menu-button"
            >
              {resetSubmitting ? "Resetting..." : "Yes, reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-white">Categories</CardTitle>
            <CardDescription>{safeCategories.length} total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {safeCategories.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No categories yet. Create one to get started.
              </p>
            ) : (
              safeCategories.map((category) => {
                const isActive = category.id === selectedCategoryId;
                return (
                  <div
                    key={category.id}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors ${
                      isActive
                        ? "border-primary/35 bg-primary/10"
                        : "border-white/5 bg-black/20 hover:border-white/15"
                    }`}
                    data-testid={`menu-category-row-${category.id}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(category.id)}
                      className="flex flex-1 items-center justify-between gap-2 text-left"
                    >
                      <div>
                        <p className="font-medium text-white">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.slug}</p>
                      </div>
                      <Badge className="border-primary/20 bg-primary/10 text-primary">
                        {(category.items || []).length}
                      </Badge>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditCategory(category)}
                      data-testid={`edit-category-button-${category.id}`}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteCategory(category.id)}
                      data-testid={`delete-category-button-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-white">
                  {selectedCategory ? selectedCategory.name : "Pick a category"}
                </CardTitle>
                <CardDescription>
                  {selectedCategory
                    ? selectedCategory.description || "Manage the items in this category."
                    : "Select a category from the left to manage its items."}
                </CardDescription>
              </div>
              {selectedCategory ? (
                <Button onClick={openCreateItem} data-testid="create-menu-item-button">
                  <Plus className="mr-2 h-4 w-4" />Item
                </Button>
              ) : null}
            </div>
            {selectedCategory ? (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search items"
                  data-testid="menu-items-search-input"
                />
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="p-0">
            {selectedCategory ? (
              <ScrollArea className="w-full">
                <Table data-testid="admin-menu-items-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          No items match your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{item.name}</span>
                              {item.featured ? (
                                <Badge className="border-primary/20 bg-primary/10 text-primary">
                                  Featured
                                </Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>{item.price_label || formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.subcategory || "—"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(item.tags || []).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="border-white/10 bg-transparent text-muted-foreground"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditItem(item)}
                                data-testid={`edit-menu-item-button-${item.id}`}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteItem(item.id)}
                                data-testid={`delete-menu-item-button-${item.id}`}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="p-6">
                <EmptyState
                  title="No category selected"
                  body="Choose a category on the left to view and edit its menu items."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-card sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingCategory ? "Edit category" : "Create category"}</SheetTitle>
            <SheetDescription>
              Categories appear as tabs on the public menu page.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field label="Name" testId="category-form-name-input">
              <Input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>
            <Field label="Slug" testId="category-form-slug-input">
              <Input
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, slug: event.target.value }))
                }
                placeholder="food, drinks, vip"
              />
            </Field>
            <Field label="Description" testId="category-form-description-input">
              <Textarea
                rows={3}
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </Field>
            <Button className="w-full" onClick={saveCategory} data-testid="save-category-button">
              Save category
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={itemSheetOpen} onOpenChange={setItemSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-card sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingItem ? "Edit menu item" : "Create menu item"}</SheetTitle>
            <SheetDescription>
              {selectedCategory ? `Adding to ${selectedCategory.name}.` : "Pick a category first."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field label="Name" testId="item-form-name-input">
              <Input
                value={itemForm.name}
                onChange={(event) => updateItemForm({ name: event.target.value })}
              />
            </Field>
            <Field label="Description" testId="item-form-description-input">
              <Textarea
                rows={3}
                value={itemForm.description}
                onChange={(event) => updateItemForm({ description: event.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price (ZAR)" testId="item-form-price-input">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(event) => updateItemForm({ price: Number(event.target.value) })}
                />
              </Field>
              <Field label="Price label" testId="item-form-price-label-input">
                <Input
                  value={itemForm.price_label}
                  disabled={itemForm.auto_label}
                  onChange={(event) => updateItemForm({ price_label: event.target.value })}
                />
              </Field>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
              <Switch
                checked={itemForm.auto_label}
                onCheckedChange={(checked) => updateItemForm({ auto_label: checked })}
                data-testid="item-form-auto-label-switch"
              />
              <Label className="text-sm text-white">Auto price label (R&lt;price&gt;.00)</Label>
            </div>
            <Field label="Subcategory" testId="item-form-subcategory-input">
              <Input
                value={itemForm.subcategory}
                onChange={(event) => updateItemForm({ subcategory: event.target.value })}
                placeholder="Starters, Mains, Bottle list..."
              />
            </Field>
            <Field label="Tags (comma separated)" testId="item-form-tags-input">
              <Input
                value={itemForm.tags}
                onChange={(event) => updateItemForm({ tags: event.target.value })}
                placeholder="signature, share, chef"
              />
            </Field>
            <Field label="Image URL" testId="item-form-image-url-input">
              <Input
                value={itemForm.image_url}
                onChange={(event) => updateItemForm({ image_url: event.target.value })}
                placeholder="https://..."
              />
            </Field>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
              <Switch
                checked={itemForm.featured}
                onCheckedChange={(checked) => updateItemForm({ featured: checked })}
                data-testid="item-form-featured-switch"
              />
              <Label className="text-sm text-white">Featured item</Label>
            </div>
            <Button className="w-full" onClick={saveItem} data-testid="save-menu-item-button">
              Save menu item
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AdminGalleryPage({ token, photos, refresh }) {
  const safePhotos = Array.isArray(photos) ? photos : [];
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const initialForm = { url_or_id: "", caption: "", sort_order: 0 };
  const [form, setForm] = useState(initialForm);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const openBulk = () => {
    setBulkText("");
    setBulkResult(null);
    setBulkOpen(true);
  };

  const submitBulk = async () => {
    if (!bulkText.trim()) {
      toast.error("Paste at least one Drive URL.");
      return;
    }
    setBulkSubmitting(true);
    setBulkResult(null);
    try {
      const response = await api.post(
        "/admin/gallery/bulk",
        { text: bulkText },
        authConfig(token),
      );
      setBulkResult(response.data);
      const { added, skipped_duplicates: skipped, failed } = response.data;
      if (added > 0) {
        toast.success(`Added ${added} photo${added === 1 ? "" : "s"}.`);
      }
      if (failed > 0) {
        toast.error(`${failed} URL${failed === 1 ? "" : "s"} could not be parsed.`);
      } else if (added === 0 && skipped > 0) {
        toast.info(`All ${skipped} URLs were already in the gallery.`);
      }
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Bulk import failed.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const openCreate = () => {
    setEditingPhoto(null);
    setForm(initialForm);
    setSheetOpen(true);
  };

  const openEdit = (photo) => {
    setEditingPhoto(photo);
    setForm({
      url_or_id: photo.drive_file_id || "",
      caption: photo.caption || "",
      sort_order: typeof photo.sort_order === "number" ? photo.sort_order : 0,
    });
    setSheetOpen(true);
  };

  const savePhoto = async () => {
    try {
      if (editingPhoto) {
        const payload = {
          caption: form.caption,
          sort_order: Number(form.sort_order) || 0,
        };
        await api.put(`/admin/gallery/${editingPhoto.id}`, payload, authConfig(token));
        toast.success("Photo updated.");
      } else {
        const fileId = extractDriveFileId(form.url_or_id);
        if (!fileId) {
          toast.error("Paste a valid Google Drive URL or file ID.");
          return;
        }
        const payload = {
          url_or_id: form.url_or_id,
          caption: form.caption,
          sort_order: Number(form.sort_order) || 0,
        };
        await api.post("/admin/gallery", payload, authConfig(token));
        toast.success("Photo added.");
      }
      setSheetOpen(false);
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not save the photo.");
    }
  };

  const deletePhoto = async (photoId) => {
    if (!window.confirm("Remove this photo from the gallery?")) {
      return;
    }
    try {
      await api.delete(`/admin/gallery/${photoId}`, authConfig(token));
      toast.success("Photo removed.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not delete the photo.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-gallery-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading
          eyebrow="Content"
          title="Gallery management"
          description="Add, caption, and order public gallery photos powered by Google Drive."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openBulk} data-testid="bulk-gallery-button">
            <Plus className="mr-2 h-4 w-4" />Bulk paste
          </Button>
          <Button onClick={openCreate} data-testid="create-gallery-photo-button">
            <Plus className="mr-2 h-4 w-4" />Add photo
          </Button>
        </div>
      </div>

      <Alert className="border-primary/20 bg-card/80">
        <Image className="h-4 w-4 text-primary" />
        <AlertTitle>Drive sharing tip</AlertTitle>
        <AlertDescription>
          Paste a Google Drive share URL (the file must be set to &quot;Anyone with the link can view&quot;). The thumbnail will appear automatically. Use <strong>Bulk paste</strong> for many photos at once — it accepts a list separated by commas or newlines (Drive&apos;s multi-select share output works directly).
        </AlertDescription>
      </Alert>

      {safePhotos.length === 0 ? (
        <EmptyState
          title="No gallery photos yet."
          body="Add your first Drive photo to get the public gallery rolling."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {safePhotos.map((photo) => (
            <Card
              key={photo.id}
              className="overflow-hidden border-white/10 bg-card"
              data-testid={`admin-gallery-card-${photo.id}`}
            >
              <img
                src={driveThumbnailUrl(photo.drive_file_id, "w1600")}
                alt={photo.caption || "Vaal Vibes gallery photo"}
                className="aspect-[4/3] w-full object-cover"
              />
              <CardContent className="space-y-3 p-4">
                <p className="text-sm text-white">
                  {photo.caption || <span className="text-muted-foreground">No caption</span>}
                </p>
                <p className="text-xs text-muted-foreground">Sort order: {photo.sort_order ?? 0}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(photo)}
                    data-testid={`edit-gallery-photo-button-${photo.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deletePhoto(photo.id)}
                    data-testid={`delete-gallery-photo-button-${photo.id}`}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={bulkOpen} onOpenChange={setBulkOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-card sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Bulk paste Drive URLs</SheetTitle>
            <SheetDescription>
              Paste multiple Google Drive share URLs (or file IDs) separated by commas, newlines, or both. Duplicates already in the gallery are skipped automatically.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Field label="Drive URLs" testId="bulk-gallery-textarea">
              <Textarea
                rows={10}
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                placeholder="https://drive.google.com/file/d/FILE_ID_A/view, https://drive.google.com/file/d/FILE_ID_B/view, ..."
                className="font-mono text-xs"
              />
            </Field>
            <Button
              className="w-full"
              onClick={submitBulk}
              disabled={bulkSubmitting}
              data-testid="submit-bulk-gallery-button"
            >
              {bulkSubmitting ? "Importing..." : "Import photos"}
            </Button>
            {bulkResult && (
              <Card className="border-white/10 bg-background/40">
                <CardContent className="space-y-2 p-4 text-sm">
                  <p>
                    <span className="text-primary font-semibold">{bulkResult.added}</span> added,{" "}
                    <span className="text-muted-foreground">{bulkResult.skipped_duplicates}</span> skipped (duplicates),{" "}
                    <span className={bulkResult.failed > 0 ? "text-destructive" : "text-muted-foreground"}>
                      {bulkResult.failed}
                    </span>{" "}
                    failed.
                  </p>
                  {bulkResult.errors?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Errors</p>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-destructive">
                        {bulkResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-card sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingPhoto ? "Edit gallery photo" : "Add gallery photo"}</SheetTitle>
            <SheetDescription>
              Photos render via Google Drive thumbnails. Public sharing is required.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {editingPhoto ? null : (
              <Field label="Drive share URL or file ID" testId="gallery-form-url-input">
                <Input
                  value={form.url_or_id}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, url_or_id: event.target.value }))
                  }
                  placeholder="https://drive.google.com/file/d/FILE_ID/view"
                />
              </Field>
            )}
            <Field label="Caption" testId="gallery-form-caption-input">
              <Input
                value={form.caption}
                onChange={(event) =>
                  setForm((current) => ({ ...current, caption: event.target.value }))
                }
                placeholder="Friday After Dark — main floor"
              />
            </Field>
            <Field label="Sort order" testId="gallery-form-sort-input">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sort_order: event.target.value }))
                }
              />
            </Field>
            <Button className="w-full" onClick={savePhoto} data-testid="save-gallery-photo-button">
              Save photo
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AdminPromoPage({ token, promoPools, issuedPromos, refresh }) {
  const [promoCode, setPromoCode] = useState("");
  const [billAmount, setBillAmount] = useState("1600");
  const [validation, setValidation] = useState(null);
  const [poolForm, setPoolForm] = useState({
    name: "",
    discount_type: "percentage",
    discount_value: 20,
    min_spend: 1500,
    start_date: new Date(),
    start_time: "18:00",
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    end_time: "23:59",
    active: false,
  });

  const validatePromo = async () => {
    try {
      const response = await api.post(
        "/admin/promo/validate",
        { code: promoCode, bill_amount: Number(billAmount), customer_phone: "" },
        authConfig(token),
      );
      setValidation(response.data);
      toast.success(response.data.reason);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not validate promo.");
    }
  };

  const redeemPromo = async () => {
    try {
      const response = await api.post(
        "/admin/promo/redeem",
        { code: promoCode, bill_amount: Number(billAmount), customer_phone: "" },
        authConfig(token),
      );
      setValidation(response.data);
      toast.success("Promo redeemed successfully.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not redeem promo.");
    }
  };

  const savePromoPool = async () => {
    try {
      await api.post(
        "/admin/promo-pools",
        {
          name: poolForm.name,
          discount_type: poolForm.discount_type,
          discount_value: Number(poolForm.discount_value),
          min_spend: Number(poolForm.min_spend),
          start_at: buildIsoDateTime(poolForm.start_date, poolForm.start_time),
          end_at: buildIsoDateTime(poolForm.end_date, poolForm.end_time),
          max_redemptions: 1,
          audience: "all",
          active: poolForm.active,
        },
        authConfig(token),
      );
      toast.success("Promo pool created.");
      setPoolForm({
        name: "",
        discount_type: "percentage",
        discount_value: 20,
        min_spend: 1500,
        start_date: new Date(),
        start_time: "18:00",
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        end_time: "23:59",
        active: false,
      });
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not create promo pool.");
    }
  };

  const deactivatePool = async (poolId) => {
    try {
      await api.post(`/admin/promo-pools/${poolId}/deactivate`, {}, authConfig(token));
      toast.success("Promo pool deactivated.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not deactivate pool.");
    }
  };

  const deletePool = async (poolId) => {
    try {
      await api.delete(`/admin/promo-pools/${poolId}`, authConfig(token));
      toast.success("Promo pool deleted.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not delete pool.");
    }
  };

  const revokeIssuedPromo = async (promoId) => {
    try {
      await api.post(`/admin/promo/revoke/${promoId}`, {}, authConfig(token));
      toast.success("Promo revoked.");
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not revoke promo.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-promo-page">
      <SectionHeading eyebrow="Promo desk" title="Validate and redeem" description="Fast staff-facing lookup for customer promo codes, spend thresholds, and redemption confirmation." />
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-white">Promo validation</CardTitle>
            <CardDescription>BR-1 enforced: 20% only applies above R1500.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Promo code" testId="promo-code-input"><Input value={promoCode} onChange={(event) => setPromoCode(event.target.value.toUpperCase())} placeholder="VV-XXXX1234" /></Field>
            <Field label="Bill amount" testId="promo-bill-amount-input"><Input value={billAmount} onChange={(event) => setBillAmount(event.target.value)} /></Field>
            <div className="flex flex-wrap gap-3">
              <Button onClick={validatePromo} data-testid="promo-validate-button">Validate</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" data-testid="promo-redeem-open-button">Redeem</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-white/10 bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Redeem this promo?</AlertDialogTitle>
                    <AlertDialogDescription>This action marks the promo as redeemed and writes to the audit log.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={redeemPromo} data-testid="promo-redeem-confirm-button">Redeem now</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {validation ? (
              <Card className={`border ${validation.approved ? "border-primary/30 bg-primary/10" : "border-destructive/30 bg-destructive/10"}`} data-testid="promo-validation-result-card">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-white">{validation.code}</p>
                    <Badge className={validation.approved ? "border-primary/20 bg-primary/10 text-primary" : "border-destructive/30 bg-destructive/10 text-white"}>{validation.status}</Badge>
                  </div>
                  <p className="text-sm text-white/80">{validation.reason}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-xs text-muted-foreground">Discount</p><p className="mt-1 font-medium text-white">{formatCurrency(validation.discount_amount || 0)}</p></div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-xs text-muted-foreground">Min spend</p><p className="mt-1 font-medium text-white">{formatCurrency(validation.min_spend || 0)}</p></div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-white">Create promo pool</CardTitle>
            <CardDescription>The active pool powers welcome promo issuance for new customer registrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Pool name" testId="promo-pool-name-input"><Input value={poolForm.name} onChange={(event) => setPoolForm((current) => ({ ...current, name: event.target.value }))} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Discount type" testId="promo-pool-type-select">
                <Select value={poolForm.discount_type} onValueChange={(value) => setPoolForm((current) => ({ ...current, discount_type: value }))}>
                  <SelectTrigger><SelectValue placeholder="Choose type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Discount value" testId="promo-pool-value-input"><Input value={poolForm.discount_value} onChange={(event) => setPoolForm((current) => ({ ...current, discount_value: event.target.value }))} /></Field>
            </div>
            <Field label="Minimum spend" testId="promo-pool-min-spend-input"><Input value={poolForm.min_spend} onChange={(event) => setPoolForm((current) => ({ ...current, min_spend: event.target.value }))} /></Field>
            <DatePickerField label="Start date" value={poolForm.start_date} onChange={(date) => setPoolForm((current) => ({ ...current, start_date: date }))} testId="promo-pool-start-date-picker" />
            <DatePickerField label="End date" value={poolForm.end_date} onChange={(date) => setPoolForm((current) => ({ ...current, end_date: date }))} testId="promo-pool-end-date-picker" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start time" testId="promo-pool-start-time-input"><Input value={poolForm.start_time} onChange={(event) => setPoolForm((current) => ({ ...current, start_time: event.target.value }))} /></Field>
              <Field label="End time" testId="promo-pool-end-time-input"><Input value={poolForm.end_time} onChange={(event) => setPoolForm((current) => ({ ...current, end_time: event.target.value }))} /></Field>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="font-medium text-white">Activate immediately</p>
                <p className="text-xs text-muted-foreground">This switches the active pool for new welcome promos.</p>
              </div>
              <Switch checked={poolForm.active} onCheckedChange={(checked) => setPoolForm((current) => ({ ...current, active: Boolean(checked) }))} data-testid="promo-pool-active-switch" />
            </div>
            <Button className="w-full" onClick={savePromoPool} data-testid="promo-pool-save-button">Save promo pool</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="border-white/10 bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-white">Existing promo pools</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-testid="promo-pools-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Spend</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(promoPools || []).map((pool) => (
                  <TableRow key={pool.id}>
                    <TableCell>{pool.name}</TableCell>
                    <TableCell>{pool.discount_value}{pool.discount_type === "percentage" ? "%" : " ZAR"}</TableCell>
                    <TableCell>{formatCurrency(pool.min_spend)}</TableCell>
                    <TableCell><Badge className={pool.active ? "border-primary/20 bg-primary/10 text-primary" : "border-white/10 bg-transparent text-white"}>{pool.active ? "active" : "inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {pool.active ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`promo-pool-deactivate-${pool.id}`}>Deactivate</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-white/10 bg-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate this promo pool?</AlertDialogTitle>
                                <AlertDialogDescription>New customers will stop receiving welcome promos from this pool. Existing issued codes are not affected.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deactivatePool(pool.id)} data-testid={`promo-pool-deactivate-confirm-${pool.id}`}>Deactivate</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" data-testid={`promo-pool-delete-${pool.id}`}>Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-white/10 bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this promo pool?</AlertDialogTitle>
                              <AlertDialogDescription>This permanently removes the pool. The request fails if any active codes were issued from it — revoke those first.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePool(pool.id)} data-testid={`promo-pool-delete-confirm-${pool.id}`}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-white">Issued promo codes</CardTitle>
          <CardDescription>Revoke a code to stop it from being redeemed at the desk.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-testid="issued-promos-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min spend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(issuedPromos || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No promo codes have been issued.</TableCell>
                  </TableRow>
                ) : (
                  (issuedPromos || []).map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-mono">{promo.code}</TableCell>
                      <TableCell>{promo.discount_value}{promo.discount_type === "percentage" ? "%" : " ZAR"}</TableCell>
                      <TableCell>{formatCurrency(promo.min_spend)}</TableCell>
                      <TableCell>
                        <Badge className={promo.status === "active" ? "border-primary/20 bg-primary/10 text-primary" : "border-white/10 bg-transparent text-white"}>{promo.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(promo.expires_at)}</TableCell>
                      <TableCell className="text-right">
                        {promo.status === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`issued-promo-revoke-${promo.id}`}>Revoke</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-white/10 bg-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke this code?</AlertDialogTitle>
                                <AlertDialogDescription>The customer will no longer be able to redeem {promo.code}. This is logged in the audit trail.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => revokeIssuedPromo(promo.id)} data-testid={`issued-promo-revoke-confirm-${promo.id}`}>Revoke</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminCampaignsPage({ token, campaigns, refresh }) {
  const [formState, setFormState] = useState({ subject: "", audience: "all-opted-in", body_html: "<h1>Weekend at Vaal Vibes</h1><p>See you at the venue.</p>" });

  const createCampaign = async () => {
    try {
      await api.post("/admin/campaigns", formState, authConfig(token));
      toast.success("Campaign created.");
      setFormState({ subject: "", audience: "all-opted-in", body_html: "<h1>Weekend at Vaal Vibes</h1><p>See you at the venue.</p>" });
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not create campaign.");
    }
  };

  const dispatchCampaign = async (campaignId) => {
    try {
      const response = await api.post(`/admin/campaigns/${campaignId}/dispatch`, {}, authConfig(token));
      toast.success(response.data.message);
      refresh(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not dispatch campaign.");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-campaigns-page">
      <SectionHeading eyebrow="Marketing" title="Campaign composer" description="Draft and dispatch email campaigns to opted-in customers and VIP segments." />
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-white">Create campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Subject" testId="campaign-subject-input"><Input value={formState.subject} onChange={(event) => setFormState((current) => ({ ...current, subject: event.target.value }))} /></Field>
            <Field label="Audience" testId="campaign-audience-select">
              <Select value={formState.audience} onValueChange={(value) => setFormState((current) => ({ ...current, audience: value }))}>
                <SelectTrigger><SelectValue placeholder="Choose audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-opted-in">All opted-in</SelectItem>
                  <SelectItem value="vip-segment">VIP segment</SelectItem>
                  <SelectItem value="new-customers">New customers</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Body HTML" testId="campaign-body-input"><Textarea rows={8} value={formState.body_html} onChange={(event) => setFormState((current) => ({ ...current, body_html: event.target.value }))} /></Field>
            <Button className="w-full" onClick={createCampaign} data-testid="campaign-create-button">Save campaign</Button>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-white">Campaign list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(campaigns || []).map((campaign) => (
              <div key={campaign.id} className="rounded-2xl border border-white/10 bg-black/20 p-4" data-testid={`campaign-card-${campaign.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{campaign.subject}</p>
                    <p className="text-xs text-muted-foreground">Audience: {campaign.audience}</p>
                  </div>
                  <Badge className="border-primary/20 bg-primary/10 text-primary">{campaign.status}</Badge>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-card/70 p-4 text-sm text-white/80" data-testid={`campaign-preview-${campaign.id}`}>
                  <div dangerouslySetInnerHTML={{ __html: campaign.body_html }} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => dispatchCampaign(campaign.id)} data-testid={`campaign-dispatch-button-${campaign.id}`}>Dispatch</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminUsersPage({ users, loading }) {
  if (loading) {
    return <SkeletonPanel />;
  }

  return (
    <div className="space-y-6" data-testid="admin-users-page">
      <SectionHeading eyebrow="Customers" title="Registered users" description="Quick-read list of venue customers captured through the Vaal Vibes web app." />
      <Card className="border-white/10 bg-card">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table data-testid="admin-users-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Opt-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users || []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell><Badge className={user.marketing_opt_in ? "border-primary/20 bg-primary/10 text-primary" : "border-white/10 bg-transparent text-white"}>{user.marketing_opt_in ? "opted-in" : "opted-out"}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAuditPage({ logs, loading }) {
  const [filter, setFilter] = useState("");
  const filtered = (logs || []).filter((log) => `${log.action} ${log.entity_type} ${log.summary}`.toLowerCase().includes(filter.toLowerCase()));

  if (loading) {
    return <SkeletonPanel />;
  }

  return (
    <div className="space-y-6" data-testid="admin-audit-page">
      <SectionHeading eyebrow="Compliance" title="Audit logs" description="Immutable-style log preview of admin actions captured in the MVP backend." />
      <Card className="border-white/10 bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter audit logs" data-testid="audit-filter-input" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {filtered.map((log) => (
          <Card key={log.id} className="border-white/10 bg-card" data-testid={`audit-log-card-${log.id}`}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{log.action} • {log.entity_type}</p>
                  <p className="text-sm text-muted-foreground">{log.summary}</p>
                </div>
                <Badge className="border-primary/20 bg-primary/10 text-primary">{log.actor_role}</Badge>
              </div>
              <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <span>Actor: {log.actor_id}</span>
                <span>Entity: {log.entity_id}</span>
                <span>{formatDateTime(log.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, body, compact = false }) {
  return (
    <Card className="border-dashed border-white/10 bg-black/20">
      <CardContent className={`${compact ? "p-4" : "p-6"} text-center`}>
        <p className="font-medium text-white">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function SkeletonPanel() {
  return (
    <div className="space-y-4" data-testid="loading-state">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-40 animate-pulse rounded-[24px] border border-white/10 bg-card/60" />
      ))}
    </div>
  );
}

function Field({ label, children, testId }) {
  const existingTestId = isValidElement(children) ? children.props?.["data-testid"] : undefined;
  const fieldChild = isValidElement(children)
    ? cloneElement(children, {
        "data-testid": existingTestId || testId,
      })
    : children;

  return (
    <div className="space-y-2">
      <Label className="text-sm text-white">{label}</Label>
      {fieldChild}
    </div>
  );
}

function DatePickerField({ label, value, onChange, testId, buttonTestId }) {
  return (
    <div className="space-y-2" data-testid={testId}>
      <Label className="text-sm text-white">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button data-testid={buttonTestId || testId} variant="outline" className="w-full justify-between border-white/10 bg-transparent text-left font-normal text-white hover:bg-white/5">
            <span>{value ? formatDate(value) : "Pick a date"}</span>
            <CalendarDays className="h-4 w-4 text-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-white/10 bg-card p-0" align="start">
          <Calendar mode="single" selected={value ? new Date(value) : undefined} onSelect={(date) => date && onChange(date)} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default App;
