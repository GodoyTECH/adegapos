import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useListProducts,
  useListCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  Product,
  CreateProductBodyProductType,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  barcode: "",
  categoryId: "",
  productType: "simple" as "simple" | "composite",
  costPrice: "",
  salePrice: "",
  stockQuantity: "",
  minStock: "",
  unitType: "un",
  active: true,
};

type FormState = typeof EMPTY_FORM;

export default function Products() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const { data: products, isLoading } = useListProducts({ search });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const refresh = () => qc.invalidateQueries({ queryKey: ["/api/products"] });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true });
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      barcode: p.barcode ?? "",
      categoryId: p.categoryId ? String(p.categoryId) : "",
      productType: (p.productType as "simple" | "composite") ?? "simple",
      costPrice: p.costPrice != null ? String(p.costPrice) : "",
      salePrice: String(p.salePrice),
      stockQuantity: String(p.stockQuantity),
      minStock: String(p.minStock),
      unitType: p.unitType ?? "un",
      active: p.active ?? true,
    });
    setModal({ open: true, product: p });
  };

  const handleSubmit = () => {
    if (!form.name || !form.salePrice) {
      toast({ title: "Preencha nome e preço de venda", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name,
      barcode: form.barcode || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      productType: form.productType as any,
      costPrice: form.costPrice ? Number(form.costPrice) : undefined,
      salePrice: Number(form.salePrice),
      stockQuantity: Number(form.stockQuantity) || 0,
      minStock: Number(form.minStock) || 0,
      unitType: form.unitType || "un",
      active: form.active,
    };

    if (modal.product) {
      updateProduct.mutate({ id: modal.product.id, data: payload }, {
        onSuccess: () => { setModal({ open: false }); refresh(); toast({ title: "Produto atualizado" }); },
        onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => { setModal({ open: false }); refresh(); toast({ title: "Produto criado" }); },
        onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
      });
    }
  };

  const handleDelete = (p: Product) => {
    deleteProduct.mutate({ id: p.id }, {
      onSuccess: () => { setDeleteConfirm(null); refresh(); toast({ title: "Produto removido" }); },
      onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
    });
  };

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo de produtos e composições.</p>
          </div>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
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
                <TableHead>Nome</TableHead>
                <TableHead>Cód. de Barras</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Venda</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                </TableRow>
              ) : !products?.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum produto encontrado</TableCell>
                </TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.barcode || "—"}</TableCell>
                  <TableCell>{p.categoryName || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={p.productType === "composite" ? "secondary" : "outline"}>
                      {p.productType === "composite" ? "Composto" : "Simples"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.costPrice != null ? fmt(p.costPrice) : "—"}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{fmt(p.salePrice)}</TableCell>
                  <TableCell className="text-right">{p.stockQuantity} {p.unitType}</TableCell>
                  <TableCell>
                    <Badge variant={p.active ? "default" : "destructive"}>
                      {p.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(p)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modal.open} onOpenChange={(o) => setModal({ open: o })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{modal.product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do produto" />
            </div>

            <div className="space-y-1">
              <Label>Código de Barras</Label>
              <Input value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} placeholder="EAN-13" />
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={form.productType} onValueChange={(v) => setForm((f) => ({ ...f, productType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simples</SelectItem>
                  <SelectItem value="composite">Composto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Categoria</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Preço de Custo (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))} placeholder="0,00" />
            </div>

            <div className="space-y-1">
              <Label>Preço de Venda (R$) *</Label>
              <Input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))} placeholder="0,00" />
            </div>

            <div className="space-y-1">
              <Label>Estoque Inicial</Label>
              <Input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))} placeholder="0" />
            </div>

            <div className="space-y-1">
              <Label>Estoque Mínimo</Label>
              <Input type="number" min="0" value={form.minStock} onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))} placeholder="0" />
            </div>

            <div className="space-y-1">
              <Label>Unidade</Label>
              <Select value={form.unitType} onValueChange={(v) => setForm((f) => ({ ...f, unitType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">un</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.active ? "active" : "inactive"} onValueChange={(v) => setForm((f) => ({ ...f, active: v === "active" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModal({ open: false })}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending}>
              {modal.product ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Tem certeza que deseja remover <strong className="text-foreground">{deleteConfirm?.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteProduct.isPending}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
