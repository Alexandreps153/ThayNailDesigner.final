import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Edit2, ImagePlus, LoaderCircle, Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const EMPTY_SERVICE = { name: '', description: '', price: 0, duration_minutes: 60, image: '' };

async function prepareImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');
  if (file.size > 10 * 1024 * 1024) throw new Error('A foto deve ter no máximo 10 MB.');

  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Não foi possível ler a foto.')));
    reader.onerror = () => reject(new Error('Não foi possível ler a foto.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Esta foto não pôde ser aberta.'));
    element.src = source;
  });

  const maxSize = 1000;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível preparar a foto.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.78);
}

export default function AdminServices({ data }) {
  const { services, setServices, reload } = data;
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_SERVICE);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const startEdit = (service) => {
    setEditing(service.id);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes ?? 60,
      image: service.image,
    });
    setAdding(false);
    setSaved(false);
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setAdding(false);
    setEditForm(EMPTY_SERVICE);
    setError(null);
  };

  const saveEdit = async () => {
    const name = editForm.name.trim();
    const description = editForm.description.trim();
    if (!name || !description || !editForm.image) {
      setError('Preencha o nome, a descrição e escolha uma foto.');
      return;
    }
    if (!Number.isFinite(editForm.price) || editForm.price <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (!Number.isFinite(editForm.duration_minutes) || editForm.duration_minutes <= 0) {
      setError('Informe uma duração válida.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);
    const values = {
      name,
      description,
      price: editForm.price,
      duration_minutes: editForm.duration_minutes,
      image: editForm.image,
    };
    try {
      if (editing && editing !== 'new') {
        await api.updateService(editing, values);
      } else {
        await api.createService(values);
      }
    } catch {
      setSaving(false);
      setError('Não foi possível salvar o serviço. Tente novamente.');
      await reload();
      return;
    }

    await reload();
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      cancelEdit();
    }, 900);
  };

  const deleteService = async (service) => {
    if (!window.confirm(`Remover "${service.name}" do catálogo?`)) return;
    const previous = services;
    setServices(services.filter((item) => item.id !== service.id));
    try {
      await api.deleteService(service.id);
    } catch {
      setServices(previous);
      setError('Não foi possível remover o serviço. Tente novamente.');
      return;
    }
    await reload();
  };

  const moveService = async (service, direction) => {
    const sorted = [...services].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((item) => item.id === service.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const other = sorted[swapIndex];
    if (!other) return;
    try {
      await Promise.all([
        api.setServiceOrder(service.id, other.sort_order),
        api.setServiceOrder(other.id, service.sort_order),
      ]);
    } catch {
      setError('Não foi possível mudar a ordem. Tente novamente.');
    }
    await reload();
  };

  return (
    <div data-testid="admin-services">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-serif-display text-3xl text-deep-warm font-light">Serviços</h1>
          <p className="font-body text-sm text-warm-gray font-light">Edite o catálogo exibido no site</p>
        </div>
        <Button
          onClick={() => { setAdding(true); setEditing('new'); setEditForm(EMPTY_SERVICE); setError(null); }}
          data-testid="admin-service-add-button"
          className="btn-shine min-h-11 bg-rose-gold text-white hover:opacity-90"
        >
          <Plus /> Novo serviço
        </Button>
      </div>

      {error && (
        <div role="alert" data-testid="admin-services-error" className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {adding && editing === 'new' && (
          <div className="bg-off-white rounded-lg p-4 card-shadow border-2 border-rose-gold/30">
            <EditForm form={editForm} setForm={setEditForm} onSave={saveEdit} onCancel={cancelEdit} saving={saving} saved={saved} setError={setError} isNew />
          </div>
        )}

        {services.map((service, index) => (
          <div key={service.id} data-testid={`admin-service-${service.id}`} className="bg-off-white rounded-lg p-4 card-shadow">
            {editing === service.id ? (
              <EditForm form={editForm} setForm={setEditForm} onSave={saveEdit} onCancel={cancelEdit} saving={saving} saved={saved} setError={setError} />
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                {service.image && (
                  <img src={service.image} alt={service.name} className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif-display text-xl text-deep-warm font-medium">{service.name}</h3>
                    <span className="font-serif-display text-lg gold-text font-medium whitespace-nowrap">R$ {Number(service.price).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <p className="font-body text-sm text-warm-gray font-light mt-1 line-clamp-2">{service.description}</p>
                  <p className="font-body text-xs text-warm-gray mt-1">Duração: {service.duration_minutes ?? 60} min</p>
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Button variant="secondary" size="sm" data-testid={`admin-service-edit-${service.id}`} onClick={() => startEdit(service)}>
                      <Edit2 /> Editar
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`admin-service-up-${service.id}`} onClick={() => moveService(service, 'up')} disabled={index === 0} aria-label="Mover serviço para cima" title="Mover para cima">
                      <ArrowUp />
                    </Button>
                    <Button variant="outline" size="icon" data-testid={`admin-service-down-${service.id}`} onClick={() => moveService(service, 'down')} disabled={index === services.length - 1} aria-label="Mover serviço para baixo" title="Mover para baixo">
                      <ArrowDown />
                    </Button>
                    <Button variant="destructive" size="sm" data-testid={`admin-service-delete-${service.id}`} onClick={() => deleteService(service)} className="ml-auto">
                      <Trash2 /> Remover
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditForm({ form, setForm, onSave, onCancel, saving, saved, setError, isNew = false }) {
  const fileRef = useRef(null);
  const [preparingImage, setPreparingImage] = useState(false);

  const selectImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreparingImage(true);
    setError(null);
    try {
      const image = await prepareImage(file);
      setForm((current) => ({ ...current, image }));
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'Não foi possível preparar a foto.');
    } finally {
      setPreparingImage(false);
      event.target.value = '';
    }
  };

  const fieldClass = 'mt-1 min-h-11 w-full rounded-lg border border-rose-gold/20 bg-cream px-3 py-2 font-body text-base text-deep-warm focus:border-rose-gold focus:outline-none disabled:opacity-60';

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <div>
        <div className="aspect-[4/3] overflow-hidden rounded-lg border border-rose-gold/20 bg-cream">
          {form.image ? (
            <img src={form.image} alt="Prévia do serviço" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-warm-gray">
              <ImagePlus size={30} />
              <span className="font-body text-sm">Nenhuma foto</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} data-testid={isNew ? 'admin-service-new-image-input' : 'admin-service-edit-image-input'} className="sr-only" />
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={saving || preparingImage} data-testid={isNew ? 'admin-service-new-image-button' : 'admin-service-edit-image-button'} className="mt-3 min-h-11 w-full border-rose-gold/30">
          {preparingImage ? <LoaderCircle className="animate-spin" /> : <ImagePlus />}
          {form.image ? 'Trocar foto' : 'Escolher foto'}
        </Button>
        <p className="mt-2 text-center font-body text-xs text-warm-gray">JPG, PNG ou WEBP · até 10 MB</p>
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="font-body text-xs font-medium text-warm-gray">
            Nome do serviço
            <input type="text" value={form.name} disabled={saving} data-testid={isNew ? 'admin-service-new-name-input' : 'admin-service-edit-name-input'} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} />
          </label>
          <label className="font-body text-xs font-medium text-warm-gray">
            Valor (R$)
            <input type="number" min="0.01" step="0.01" value={form.price || ''} disabled={saving} data-testid={isNew ? 'admin-service-new-price-input' : 'admin-service-edit-price-input'} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} className={fieldClass} />
          </label>
        </div>
        <label className="block font-body text-xs font-medium text-warm-gray">
          Duração do atendimento (minutos)
          <input type="number" min="15" step="15" value={form.duration_minutes || ''} disabled={saving} data-testid={isNew ? 'admin-service-new-duration-input' : 'admin-service-edit-duration-input'} onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) })} className={fieldClass} />
        </label>
        <label className="block font-body text-xs font-medium text-warm-gray">
          Descrição
          <textarea value={form.description} disabled={saving} data-testid={isNew ? 'admin-service-new-description-input' : 'admin-service-edit-description-input'} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className={`${fieldClass} resize-none`} />
        </label>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={onSave} disabled={saving || preparingImage} data-testid={isNew ? 'admin-service-new-save-button' : 'admin-service-edit-save-button'} className="min-h-11 bg-rose-gold text-white hover:opacity-90">
            {saving ? <LoaderCircle className="animate-spin" /> : saved ? <Check /> : <Save />}
            {saving ? 'Salvando...' : saved ? 'Serviço salvo' : 'Salvar alterações'}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving} data-testid={isNew ? 'admin-service-new-cancel-button' : 'admin-service-edit-cancel-button'} className="min-h-11">
            <X /> Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
