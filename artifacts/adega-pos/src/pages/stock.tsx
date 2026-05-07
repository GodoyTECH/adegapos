import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListStock,
  useListProducts,
  useCreateStockMovement,
  StockEntry,
  CreateStockMovementBodyType,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingDown, ArrowUpDown, TrendingUp, Search, AlertTriangle } from "lucide-react";

type MovementType = "entry" | "manual_adjustment" | "loss";

interface MovementModal {
  open: boolean;
  type: MovementType;
  product?: StockEntry;
}

const TYPE_CONFIG: Record<MovementType, { label: string; description: string; apiType: string }> = {
  entry: { label: "Entrada de Estoque", description: "Registrar entrada de mercadoria", apiType: "entry" },
  manual_adjustment: { label: "Ajuste Manual", description: "Corrigir quantidade no estoque", apiType: "manual_adjustment" },
  loss: { label: "Perda / Quebra", description: "Registrar perda ou quebra de produto", apiType: "loss" },
};

export default function Stock() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<MovementModal>({ open: false, type: "entry" });
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const { data: stock, isLoading } = useListStock({ search });
  const { data: allProducts } = useListProducts({});
  const createMovement = useCreateStockMovement();

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["/api/stock"] });
    qc.invalidateQueries({ queryKey: ["/api/products"] });
  };

  const openModal = (type: MovementType, item?: StockEntry) => {
    setProductId(item ? String(item.productId) : "");
    setQuantity("");
    setReason("");
    setModal({ open: true, type, product: item });
  };

  const handleSubmit = () => {
    if (!productId || !quantity || Number(quantity) <= 0) {
      toast({ title: "Informe o produto e a quantidade", variant: "destructive" });
      return;
    }
    createMovement.mutate({
      data: {
        productId: Number(productId),
        type: TYPE_CONFIG[modal.type].apiType as any,
        quantity: Number(quantity),
        reason: reason || undefined,
      },
    }, {
      onSuccess: () => {
        setModal({ open: false, type: "entry" });
        refresh();
        toast({ title: "Movimentação registrada com sucesso" });
      },
      onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
    });
  };

  const statusBadge = (status: string) => {
    if (status === "normal") return <Badge variant="default">Normal</Badge>;
    if (status === "low") return <Badge variant="secondary" className="text-amber-400 border-amber-500/30 bg-amber-500/10"><AlertTriangle className="mr-1 h-3 w-3" />Baixo</Badge>;
    return <Badge variant="destructive">Zerado</Badge>;
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
            <p className="text-muted-foreground">Controle de inventário e movimentações.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-green-400 border-green-500/30 hover:bg-green-500/10" onClick={() => openModal("entry")}>
              <TrendingUp className="mr-2 h-4 w-4" /> Entrada
            </Button>
            <Button variant="outline" className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10" onClick={() => openModal("manual_adjustment")}>
              <ArrowUpDown className="mr-2 h-4 w-4" /> Ajuste
            </Button>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => openModal("loss")}>
              <TrendingDown className="mr-2 h-4 w-4" /> Perda/Quebra
            </Button>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Estoque Atual</TableHead>
                <TableHead className="text-right">Estoque Mín.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : !stock?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum item encontrado</TableCell>
                </TableRow>
              ) : stock.map((item) => (
                <TableRow key={item.productId} className={item.status !== "normal" ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.categoryName || "—"}</TableCell>
                  <TableCell className="text-right font-bold">{item.stockQuantity} {item.unitType}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.minStock} {item.unitType}</TableCell>
                  <TableCell>{statusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-7 px-2" onClick={() => openModal("entry", item)}>
                        <TrendingUp className="h-3 w-3 mr-1" />Entrada
                      </Button>
                      <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-7 px-2" onClick={() => openModal("manual_adjustment", item)}>
                        <ArrowUpDown className="h-3 w-3 mr-1" />Ajuste
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Movement Modal */}
      <Dialog open={modal.open} onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{TYPE_CONFIG[modal.type].label}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">{TYPE_CONFIG[modal.type].description}</p>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Produto *</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar produto" />
                </SelectTrigger>
                <SelectContent>
                  {allProducts?.filter((p) => p.productType === "simple").map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — {p.stockQuantity} {p.unitType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={modal.type === "manual_adjustment" ? "Nova quantidade total" : "Quantidade a movimentar"}
              />
              {modal.type === "manual_adjustment" && (
                <p className="text-xs text-muted-foreground">Informe a quantidade correta total em estoque.</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Motivo / Observação</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Opcional — descreva o motivo da movimentação"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModal((m) => ({ ...m, open: false }))}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMovement.isPending}
              className={modal.type === "loss" ? "bg-destructive hover:bg-destructive/90" : modal.type === "manual_adjustment" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              {createMovement.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
