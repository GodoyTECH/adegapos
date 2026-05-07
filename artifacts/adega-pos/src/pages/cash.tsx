import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  useGetCurrentCashSession,
  useOpenCashSession,
  useCloseCashSession,
  useCreateCashMovement,
  getGetCurrentCashSessionQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Wallet, TrendingUp, TrendingDown, X } from "lucide-react";
import { format } from "date-fns";

const BRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function Cash() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: session, isLoading } = useGetCurrentCashSession({ query: { retry: false, queryKey: ["cash-current"] } } as any);
  const openSession = useOpenCashSession();
  const closeSession = useCloseCashSession();
  const createMovement = useCreateCashMovement();

  const [openAmount, setOpenAmount] = useState("0");
  const [closeAmount, setCloseAmount] = useState("");
  const [movementModal, setMovementModal] = useState<"sangria" | "suprimento" | null>(null);
  const [movementAmount, setMovementAmount] = useState("");
  const [movementReason, setMovementReason] = useState("");
  const [closeModal, setCloseModal] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: getGetCurrentCashSessionQueryKey() });

  const handleOpen = () => {
    openSession.mutate({ data: { openingAmount: parseFloat(openAmount.replace(",", ".")) || 0 } }, {
      onSuccess: () => { refresh(); toast({ title: "Caixa aberto com sucesso" }); },
      onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
    });
  };

  const handleClose = () => {
    if (!session) return;
    closeSession.mutate({ id: session.id, data: { closingAmount: parseFloat(closeAmount.replace(",", ".")) || 0 } }, {
      onSuccess: () => { refresh(); setCloseModal(false); toast({ title: "Caixa fechado" }); },
      onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
    });
  };

  const handleMovement = () => {
    if (!session || !movementAmount) return;
    const type = movementModal === "sangria" ? "withdrawal" : "supply";
    createMovement.mutate({
      id: session.id,
      data: {
        type,
        amount: parseFloat(movementAmount.replace(",", ".")),
        reason: movementReason || (movementModal === "sangria" ? "Sangria" : "Suprimento"),
      },
    }, {
      onSuccess: () => {
        setMovementModal(null); setMovementAmount(""); setMovementReason("");
        refresh(); toast({ title: movementModal === "sangria" ? "Sangria registrada" : "Suprimento registrado" });
      },
      onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nenhum caixa aberto</h2>
            <p className="text-muted-foreground text-sm mb-6">Abra um caixa para iniciar as operações do dia.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1.5">Valor inicial (troco)</label>
                <Input
                  value={openAmount}
                  onChange={e => setOpenAmount(e.target.value)}
                  placeholder="0,00"
                  className="text-center text-lg font-bold"
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleOpen} disabled={openSession.isPending}>
                {openSession.isPending ? "Abrindo..." : "Abrir Caixa"}
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Controle de Caixa</h1>
            <p className="text-muted-foreground text-sm">Aberto em {format(new Date(session.openedAt), "dd/MM/yyyy 'às' HH:mm")}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">Aberto</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Valor Inicial", value: BRL(session.openingAmount) },
            { label: "Total Vendas", value: BRL(session.totalSales ?? 0) },
            { label: "Qtd Vendas", value: String(session.salesCount ?? 0) },
            { label: "Operador", value: session.userName },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 text-amber-500 border-amber-500/30 hover:bg-amber-500/10" onClick={() => setMovementModal("sangria")}>
            <TrendingDown className="mr-2 h-4 w-4" /> Sangria
          </Button>
          <Button variant="outline" className="flex-1 text-green-500 border-green-500/30 hover:bg-green-500/10" onClick={() => setMovementModal("suprimento")}>
            <TrendingUp className="mr-2 h-4 w-4" /> Suprimento
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => setCloseModal(true)}>
            <X className="mr-2 h-4 w-4" /> Fechar Caixa
          </Button>
        </div>
      </div>

      {/* Movement Modal */}
      <Dialog open={!!movementModal} onOpenChange={() => setMovementModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{movementModal === "sangria" ? "Registrar Sangria" : "Registrar Suprimento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Valor (R$)</label>
              <Input value={movementAmount} onChange={e => setMovementAmount(e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Motivo</label>
              <Input value={movementReason} onChange={e => setMovementReason(e.target.value)} placeholder="Opcional" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMovementModal(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleMovement} disabled={createMovement.isPending}>
                {createMovement.isPending ? "Registrando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Modal */}
      <Dialog open={closeModal} onOpenChange={setCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Informe o valor físico encontrado no caixa ao fechar.</p>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Valor em caixa (R$)</label>
              <Input value={closeAmount} onChange={e => setCloseAmount(e.target.value)} placeholder="0,00" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setCloseModal(false)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={handleClose} disabled={closeSession.isPending}>
                {closeSession.isPending ? "Fechando..." : "Fechar Caixa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
