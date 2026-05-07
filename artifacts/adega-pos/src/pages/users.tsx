import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListUsers, useCreateUser, useUpdateUser, useDisableUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, UserX } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth";

const ROLES: { value: string; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "cashier", label: "Caixa" },
];

interface UserForm { name: string; email: string; password: string; role: string; }

export default function Users() {
  const { toast } = useToast();
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const { data: users, isLoading } = useListUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const disableUser = useDisableUser();

  const [modal, setModal] = useState<{ open: boolean; editId?: number }>({ open: false });
  const [role, setRole] = useState("cashier");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserForm>();

  const refresh = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() });

  const openCreate = () => { reset(); setRole("cashier"); setModal({ open: true }); };
  const openEdit = (u: any) => {
    reset({ name: u.name, email: u.email, password: "", role: u.role });
    setRole(u.role);
    setModal({ open: true, editId: u.id });
  };

  const onSubmit = (data: UserForm) => {
    const payload = { ...data, role };
    if (modal.editId) {
      const updateData: any = { name: data.name, email: data.email, role };
      if (data.password) updateData.password = data.password;
      updateUser.mutate({ id: modal.editId, data: updateData }, {
        onSuccess: () => { setModal({ open: false }); refresh(); toast({ title: "Usuário atualizado" }); },
        onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
      });
    } else {
      createUser.mutate({ data: payload as any }, {
        onSuccess: () => { setModal({ open: false }); refresh(); toast({ title: "Usuário criado" }); },
        onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
      });
    }
  };

  const handleDisable = (id: number) => {
    if (!confirm("Desativar este usuário?")) return;
    disableUser.mutate({ id }, {
      onSuccess: () => { refresh(); toast({ title: "Usuário desativado" }); },
      onError: (err: any) => toast({ title: "Erro", description: err?.message, variant: "destructive" }),
    });
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-muted-foreground text-sm">Gerencie os operadores do sistema</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !users?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum usuário</TableCell></TableRow>
              ) : (
                users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}{u.id === me?.id && <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : u.role === "manager" ? "secondary" : "outline"}>
                        {u.role === "admin" ? "Admin" : u.role === "manager" ? "Gerente" : "Caixa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.active ? "default" : "destructive"}>{u.active ? "Ativo" : "Inativo"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {u.id !== me?.id && u.active && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDisable(u.id)}>
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={modal.open} onOpenChange={open => setModal({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal.editId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Nome</label>
              <Input {...register("name", { required: true })} placeholder="Nome completo" />
              {errors.name && <p className="text-destructive text-xs mt-1">Obrigatório</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">E-mail</label>
              <Input {...register("email", { required: true })} type="email" placeholder="email@adega.com" />
              {errors.email && <p className="text-destructive text-xs mt-1">Obrigatório</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">
                Senha {modal.editId && <span className="text-xs text-muted-foreground">(deixe em branco para manter)</span>}
              </label>
              <Input {...register("password", { required: !modal.editId })} type="password" placeholder="••••••" />
              {errors.password && <p className="text-destructive text-xs mt-1">Obrigatório</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Perfil</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setModal({ open: false })}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={createUser.isPending || updateUser.isPending}>
                {createUser.isPending || updateUser.isPending ? "Salvando..." : modal.editId ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
