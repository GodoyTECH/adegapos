import { useState, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListProducts, useCreateSale, useGetCurrentCashSession } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Search, Camera, Trash2, Plus, Minus, CreditCard, Banknote, QrCode, Smartphone, CheckCircle, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const BRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

interface CartItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  productType: string;
}

type PaymentMethod = "cash" | "pix" | "debit_card" | "credit_card";

const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { method: "cash", label: "Dinheiro", icon: Banknote },
  { method: "pix", label: "PIX", icon: QrCode },
  { method: "debit_card", label: "Débito", icon: CreditCard },
  { method: "credit_card", label: "Crédito", icon: Smartphone },
];

export default function POS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState("");
  const [selectedPayments, setSelectedPayments] = useState<Set<PaymentMethod>>(new Set(["cash"]));
  const [cameraOpen, setCameraOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useListProducts({ active: true } as any);
  const { data: cashSession } = useGetCurrentCashSession();
  const createSale = useCreateSale();

  const filtered = (products ?? []).filter((p: any) =>
    p.productType !== "service" &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || "").includes(search))
  );

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, unitPrice: product.salePrice, quantity: 1, productType: product.productType }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeItem = (productId: number) => setCart(prev => prev.filter(i => i.productId !== productId));

  const clearCart = () => { setCart([]); setDiscount(""); };

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountVal = parseFloat(discount.replace(",", ".")) || 0;
  const total = Math.max(0, subtotal - discountVal);

  const handleBarcodeLookup = () => {
    if (!barcodeInput.trim()) return;
    const found = (products ?? []).find((p: any) => p.barcode === barcodeInput.trim());
    if (found) {
      addToCart(found);
      setBarcodeInput("");
    } else {
      toast({ title: "Produto não encontrado", description: `Código: ${barcodeInput}`, variant: "destructive" });
      setBarcodeInput("");
    }
  };

  const handleFinish = () => {
    if (!cart.length) { toast({ title: "Carrinho vazio", variant: "destructive" }); return; }

    createSale.mutate({
      data: {
        cashSessionId: cashSession?.id ?? undefined,
        discount: discountVal,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        payments: Array.from(selectedPayments).map(method => ({
          method,
          amount: total / selectedPayments.size,
        })),
      },
    }, {
      onSuccess: () => {
        clearCart();
        setSelectedPayments(new Set(["cash"]));
        setSuccessModal(true);
        queryClient.invalidateQueries();
      },
      onError: (err: any) => {
        toast({ title: "Erro ao finalizar venda", description: err?.message, variant: "destructive" });
      },
    });
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-4 -mt-2">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden min-w-0">
          <div className="p-3 border-b border-border flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
            </div>
            <Input
              ref={barcodeRef}
              placeholder="Código de barras"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleBarcodeLookup(); }}
              className="w-40 h-9 bg-background font-mono text-xs"
            />
            <Button variant="secondary" size="icon" className="h-9 w-9 shrink-0" onClick={() => setCameraOpen(true)}>
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">Nenhum produto encontrado</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="group bg-background border border-border rounded-lg p-3 text-left hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p className="text-xs font-medium leading-snug line-clamp-2">{p.name}</p>
                      {p.productType === "composite" && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">Mix</Badge>
                      )}
                    </div>
                    <p className="text-sm font-bold text-primary">{BRL(p.salePrice)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {p.stockQuantity > 0 ? `${p.stockQuantity} ${p.unitType}` : <span className="text-destructive">Sem estoque</span>}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel: Cart */}
        <div className="w-full lg:w-[380px] flex flex-col bg-card rounded-xl border border-border overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Carrinho</h2>
              {cart.length > 0 && (
                <Badge variant="secondary" className="text-xs">{cart.reduce((s, i) => s + i.quantity, 0)}</Badge>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>

          <ScrollArea className="flex-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Carrinho vazio
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-2 bg-background rounded-lg p-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-primary font-semibold">{BRL(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted/70">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, 1)} className="w-6 h-6 rounded bg-muted flex items-center justify-center hover:bg-muted/70">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-xs font-bold w-16 text-right shrink-0">{BRL(item.unitPrice * item.quantity)}</div>
                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{BRL(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Desconto (R$)</span>
              <Input
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                placeholder="0,00"
                className="w-24 h-7 text-right bg-background text-sm"
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold text-primary">{BRL(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_OPTIONS.map(({ method, label, icon: Icon }) => (
                <button
                  key={method}
                  onClick={() => setSelectedPayments(prev => {
                    const next = new Set(prev);
                    if (next.has(method)) { if (next.size > 1) next.delete(method); } else next.add(method);
                    return next;
                  })}
                  className={`h-12 rounded-lg border flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-all ${
                    selectedPayments.has(method)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={clearCart}>
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 font-bold"
                disabled={!cart.length || createSale.isPending}
                onClick={handleFinish}
              >
                {createSale.isPending ? "Processando..." : "Finalizar Venda"}
              </Button>
            </div>

            {!cashSession && (
              <p className="text-xs text-amber-500 text-center">Nenhum caixa aberto — a venda será registrada sem caixa</p>
            )}
          </div>
        </div>
      </div>

      {/* Camera/Barcode Modal */}
      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leitura de Código de Barras</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use o campo abaixo para inserir o código manualmente ou aguarde a leitura automática.
            </p>
            <Input
              placeholder="Insira o código de barras e pressione Enter"
              value={barcodeInput}
              autoFocus
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { handleBarcodeLookup(); setCameraOpen(false); }}}
              className="font-mono"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCameraOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={() => { handleBarcodeLookup(); setCameraOpen(false); }}>Buscar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModal} onOpenChange={setSuccessModal}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold">Venda Concluída!</h2>
            <p className="text-muted-foreground text-sm">A venda foi registrada com sucesso.</p>
            <Button className="w-full" onClick={() => setSuccessModal(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
