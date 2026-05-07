import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetSalesReport, useGetProductsReport, useGetPaymentMethodsSummary } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const BRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const COLORS = ["#f59e0b", "#7c3aed", "#22c55e", "#ef4444", "#3b82f6"];

function today() { return format(new Date(), "yyyy-MM-dd"); }
function monthStart() {
  const d = new Date();
  d.setDate(1);
  return format(d, "yyyy-MM-dd");
}

export default function Reports() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [applied, setApplied] = useState({ from: monthStart(), to: today() });

  const apply = () => setApplied({ from, to });

  const { data: salesReport, isLoading: salesLoading } = useGetSalesReport({ from: applied.from, to: applied.to });
  const { data: productsReport, isLoading: productsLoading } = useGetProductsReport({ from: applied.from, to: applied.to });
  const { data: paymentMethods } = useGetPaymentMethodsSummary({ from: applied.from, to: applied.to });

  const methodData = (paymentMethods ?? []).map((m: any) => ({
    name: m.method === "cash" ? "Dinheiro" : m.method === "pix" ? "PIX" : m.method === "debit" ? "Débito" : m.method === "credit" ? "Crédito" : m.method,
    value: m.total,
    count: m.count,
  }));

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground text-sm">Análises do período selecionado</p>
        </div>

        <div className="flex items-end gap-3 bg-card border border-border rounded-xl p-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">De</label>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-8 text-sm w-36" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Até</label>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-8 text-sm w-36" />
          </div>
          <Button size="sm" onClick={apply}>Aplicar</Button>
        </div>

        <Tabs defaultValue="sales">
          <TabsList className="bg-muted">
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="payments">Formas de Pagamento</TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-4 mt-4">
            {salesLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Faturamento Total", value: BRL(salesReport?.totalRevenue ?? 0) },
                    { label: "Qtd Vendas", value: String(salesReport?.totalSales ?? 0) },
                    { label: "Ticket Médio", value: BRL(salesReport?.avgTicket ?? 0) },
                    { label: "Desconto Total", value: BRL(salesReport?.totalDiscount ?? 0) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className="text-lg font-bold">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Operador</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!salesReport?.sales?.length ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma venda no período</TableCell></TableRow>
                      ) : salesReport.sales.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-mono text-xs">#{s.id}</TableCell>
                          <TableCell className="text-sm">{format(new Date(s.createdAt), "dd/MM HH:mm")}</TableCell>
                          <TableCell className="text-sm">{s.userName}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {s.paymentMethods?.map((p: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-[10px] uppercase">{p.method}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold">{BRL(s.total)}</TableCell>
                          <TableCell>
                            <Badge variant={s.status === "completed" ? "default" : "destructive"}>
                              {s.status === "completed" ? "Concluída" : "Cancelada"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4">
            {productsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Qtd Vendida</TableHead>
                      <TableHead className="text-right">Faturamento</TableHead>
                      <TableHead className="text-right">Lucro Est.</TableHead>
                      <TableHead className="text-right">Margem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!productsReport?.length ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum produto vendido no período</TableCell></TableRow>
                    ) : productsReport.map((p: any, i: number) => (
                      <TableRow key={p.productId}>
                        <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                        <TableCell className="font-medium">{p.productName}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{p.categoryName ?? "-"}</TableCell>
                        <TableCell className="text-right">{p.quantitySold}</TableCell>
                        <TableCell className="text-right font-bold">{BRL(p.revenue)}</TableCell>
                        <TableCell className="text-right text-green-500">{BRL(p.estimatedProfit)}</TableCell>
                        <TableCell className="text-right">{p.marginPercentage != null ? `${p.marginPercentage.toFixed(1)}%` : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Distribuição por Forma de Pagamento</h3>
                {!methodData.length ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Sem dados no período</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={methodData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {methodData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => BRL(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">Detalhamento</h3>
                <div className="space-y-3">
                  {methodData.map((m: any, i: number) => (
                    <div key={m.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-sm">{m.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{BRL(m.value)}</div>
                        <div className="text-xs text-muted-foreground">{m.count} transações</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
