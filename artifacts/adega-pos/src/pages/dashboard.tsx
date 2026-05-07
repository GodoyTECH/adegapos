import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useGetDashboardSummary,
  useGetSalesByHour,
  useGetTopProducts,
  useGetPaymentMethodsSummary,
  useGetSalesByCategory,
  useGetLowStockSummary,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, ShoppingCart, DollarSign, Activity, AlertTriangle, Package } from "lucide-react";

const BRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const COLORS = ["#f59e0b", "#7c3aed", "#22c55e", "#ef4444", "#3b82f6", "#ec4899"];

function pct(today: number, yesterday: number) {
  if (!yesterday) return null;
  return ((today - yesterday) / yesterday) * 100;
}

function KpiCard({
  label, value, sub, up, icon: Icon, color,
}: {
  label: string;
  value: string;
  sub?: string | null;
  up?: boolean | null;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {sub != null && (
        <div className={`text-xs flex items-center gap-1 ${up == null ? "text-muted-foreground" : up ? "text-green-500" : "text-destructive"}`}>
          {up != null && (up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          {sub}
        </div>
      )}
    </div>
  );
}

const HOUR_LABELS = ["0h","1h","2h","3h","4h","5h","6h","7h","8h","9h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h","20h","21h","22h","23h"];

export default function Dashboard() {
  const { data: summary } = useGetDashboardSummary();
  const { data: byHour } = useGetSalesByHour();
  const { data: topProducts } = useGetTopProducts({ limit: 5 });
  const { data: paymentMethods } = useGetPaymentMethodsSummary();
  const { data: byCategory } = useGetSalesByCategory();
  const { data: lowStock } = useGetLowStockSummary();

  const revPct = summary ? pct(summary.revenueToday, summary.revenueYesterday) : null;
  const salePct = summary ? pct(summary.salesCountToday, summary.salesCountYesterday) : null;
  const tickPct = summary ? pct(summary.avgTicketToday, summary.avgTicketYesterday) : null;

  const hourData = (byHour ?? []).map((h: any) => ({ name: HOUR_LABELS[h.hour], vendas: h.count, faturamento: h.revenue }));

  const methodData = (paymentMethods ?? []).map((m: any) => ({
    name: m.method === "cash" ? "Dinheiro" : m.method === "pix" ? "PIX" : m.method === "debit" ? "Débito" : m.method === "credit" ? "Crédito" : m.method,
    value: m.total,
    count: m.count,
  }));

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral do negócio — hoje</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Faturamento Hoje"
            value={BRL(summary?.revenueToday ?? 0)}
            sub={revPct != null ? `${revPct >= 0 ? "+" : ""}${revPct.toFixed(1)}% vs ontem` : "Sem dados de ontem"}
            up={revPct != null ? revPct >= 0 : null}
            icon={DollarSign}
            color="bg-primary/10 text-primary"
          />
          <KpiCard
            label="Vendas Realizadas"
            value={String(summary?.salesCountToday ?? 0)}
            sub={salePct != null ? `${salePct >= 0 ? "+" : ""}${salePct.toFixed(1)}% vs ontem` : "Sem dados de ontem"}
            up={salePct != null ? salePct >= 0 : null}
            icon={ShoppingCart}
            color="bg-secondary/10 text-secondary"
          />
          <KpiCard
            label="Ticket Médio"
            value={BRL(summary?.avgTicketToday ?? 0)}
            sub={tickPct != null ? `${tickPct >= 0 ? "+" : ""}${tickPct.toFixed(1)}% vs ontem` : "Sem dados de ontem"}
            up={tickPct != null ? tickPct >= 0 : null}
            icon={Activity}
            color="bg-green-500/10 text-green-500"
          />
          <KpiCard
            label="Lucro Estimado"
            value={BRL(summary?.estimatedProfit ?? 0)}
            sub={`${(summary?.lowStockCount ?? 0)} produtos com estoque baixo`}
            up={null}
            icon={TrendingUp}
            color="bg-amber-500/10 text-amber-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Vendas por Hora</h2>
            {hourData.filter((h: any) => h.vendas > 0).length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Nenhuma venda registrada hoje</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hourData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: any, name: string) => [name === "faturamento" ? BRL(value) : value, name === "faturamento" ? "Faturamento" : "Vendas"]}
                  />
                  <Bar dataKey="faturamento" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Por Forma de Pagamento</h2>
            {!methodData.length ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sem dados de hoje</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {methodData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => BRL(v)}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom row: top products + low stock */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Top 5 Produtos do Dia</h2>
            {!topProducts?.length ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Nenhuma venda hoje</div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p: any, i: number) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.productName}</div>
                      <div className="text-xs text-muted-foreground">{p.quantitySold} unid.</div>
                    </div>
                    <span className="text-sm font-bold text-primary">{BRL(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Alertas de Estoque</h2>
              {(summary?.lowStockCount ?? 0) > 0 && (
                <span className="text-xs text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {summary?.lowStockCount} atenção
                </span>
              )}
            </div>
            {!lowStock?.length ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Estoque normalizado
              </div>
            ) : (
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((item: any) => (
                  <div key={item.productId} className="flex items-center justify-between py-1.5">
                    <div className="text-sm truncate flex-1">{item.productName}</div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-sm font-bold">{item.stockQuantity}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "zero" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"}`}>
                        {item.status === "zero" ? "Zerado" : "Baixo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
