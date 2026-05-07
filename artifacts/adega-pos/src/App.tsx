import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./lib/auth";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import POS from "./pages/pos";
import Products from "./pages/products";
import Stock from "./pages/stock";
import Sales from "./pages/sales";
import Cash from "./pages/cash";
import Reports from "./pages/reports";
import Users from "./pages/users";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse text-primary font-bold text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/">
        <Redirect to={user.role === "cashier" ? "/pos" : "/dashboard"} />
      </Route>
      <Route path="/login">
        <Redirect to={user.role === "cashier" ? "/pos" : "/dashboard"} />
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/pos" component={POS} />
      <Route path="/products" component={Products} />
      <Route path="/stock" component={Stock} />
      <Route path="/sales" component={Sales} />
      <Route path="/cash" component={Cash} />
      <Route path="/reports" component={Reports} />
      <Route path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
