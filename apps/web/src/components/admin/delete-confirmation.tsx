import { useState } from 'react';
import { Trash2, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from '@/components/ui/alert-dialog';
export function DeleteConfirmation({ title, description, onClose, onConfirm }: { title: string; description: string; onClose: () => void; onConfirm: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function confirm() { setPending(true); setError(false); try { await onConfirm(); toast.success('Conteúdo excluído com sucesso.'); onClose(); } catch { setError(true); } finally { setPending(false); } }
  return <AlertDialog open onOpenChange={open => { if (!open && !pending) onClose(); }}><AlertDialogContent className="atelier-modal"><span className="delete-icon"><Trash2 size={23} /></span><AlertDialogTitle className="modal-title">{title}</AlertDialogTitle><AlertDialogDescription className="modal-description">{description} Essa ação não pode ser desfeita.</AlertDialogDescription>{error && <p className="form-error" role="alert">Não foi possível excluir. Tente novamente.</p>}<div className="modal-actions"><AlertDialogCancel className="btn btn-secondary" disabled={pending}>Cancelar</AlertDialogCancel><button className="btn btn-danger" disabled={pending} onClick={confirm}>{pending ? <><LoaderCircle size={16} className="spin" /> Excluindo…</> : <><Trash2 size={16} /> Sim, excluir</>}</button></div></AlertDialogContent></AlertDialog>;
}
