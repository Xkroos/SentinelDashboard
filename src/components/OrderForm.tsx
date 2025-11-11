import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface OrderFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editOrder?: {
    id: string;
    order_date: string;
    customer_name: string;
    product_description: string;
    purchase_price: number;
    sale_price: number;
    status: string;
  } | null;
}

export function OrderForm({ onClose, onSuccess, editOrder }: OrderFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    order_date: editOrder?.order_date || new Date().toISOString().split('T')[0],
    customer_name: editOrder?.customer_name || '',
    product_description: editOrder?.product_description || '',
    purchase_price: editOrder?.purchase_price || 0,
    sale_price: editOrder?.sale_price || 0,
    status: editOrder?.status || 'pendiente',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (editOrder) {
        const { error } = await supabase
          .from('orders')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editOrder.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('orders').insert([
          {
            ...formData,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar el encargo');
    } finally {
      setLoading(false);
    }
  };

  const profit = formData.sale_price - formData.purchase_price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {editOrder ? 'Editar Encargo' : 'Nuevo Encargo'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={formData.order_date}
                onChange={(e) =>
                  setFormData({ ...formData, order_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción del Producto
            </label>
            <textarea
              value={formData.product_description}
              onChange={(e) =>
                setFormData({ ...formData, product_description: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Precio de Compra ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    purchase_price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Precio de Venta ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sale_price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-slate-700">
              Ganancia: ${profit.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : editOrder ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
