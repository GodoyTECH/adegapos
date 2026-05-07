import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Boxes, 
  Receipt, 
  Wallet, 
  BarChart3, 
  Users, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager"] },
    { href: "/pos", label: "PDV (Caixa)", icon: ShoppingCart, roles: ["admin", "manager", "cashier"] },
    { href: "/products", label: "Produtos", icon: Package, roles: ["admin", "manager"] },
    { href: "/stock", label: "Estoque", icon: Boxes, roles: ["admin", "manager"] },
    { href: "/sales", label: "Vendas", icon: Receipt, roles: ["admin", "manager"] },
    { href: "/cash", label: "Caixa", icon: Wallet, roles: ["admin", "manager", "cashier"] },
    { href: "/reports", label: "Relatórios", icon: BarChart3, roles: ["admin", "manager"] },
    { href: "/users", label: "Usuários", icon: Users, roles: ["admin"] },
  ].filter(item => user && item.roles.includes(user.role));

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer ${
            location === item.href 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="font-bold text-xl text-primary tracking-tight">Adega<span className="text-foreground">POS</span></div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-card border-r border-border">
            <div className="p-6">
              <div className="font-bold text-2xl text-primary tracking-tight">Adega<span className="text-foreground">POS</span></div>
            </div>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              <NavLinks />
            </nav>
            <div className="p-4 border-t border-border">
              <div className="mb-4 px-4">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
              </div>
              <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[280px] flex-col bg-card border-r border-border h-screen sticky top-0">
        <div className="p-6">
          <div className="font-bold text-2xl text-primary tracking-tight">Adega<span className="text-foreground">POS</span></div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-border">
          <div className="mb-4 px-4">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Bar for Cashier */}
      {user?.role === "cashier" && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card flex justify-around p-2 pb-safe">
          <Link href="/pos" className={`flex flex-col items-center p-2 rounded-lg ${location === "/pos" ? "text-primary" : "text-muted-foreground"}`}>
            <ShoppingCart className="h-6 w-6" />
            <span className="text-[10px] mt-1">PDV</span>
          </Link>
          <Link href="/cash" className={`flex flex-col items-center p-2 rounded-lg ${location === "/cash" ? "text-primary" : "text-muted-foreground"}`}>
            <Wallet className="h-6 w-6" />
            <span className="text-[10px] mt-1">Caixa</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
