import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Upload } from 'lucide-react';
import { Payment } from '../lib/supabase';

interface PaymentModalProps {
  orderId: string;
  orderTotal: number;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({
  orderId,
  orderTotal,
  customerName,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayments();
  }, [orderId]);

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('payment_date', { ascending: false });

    if (data) {
      setPayments(data);
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
  const remaining = orderTotal - totalPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('payments').insert([
        {
          order_id: orderId,
          user_id: user.id,
          amount,
          reference_number: referenceNumber,
          payment_image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      const newTotal = totalPaid + amount;
      if (newTotal >= orderTotal) {
        await supabase
          .from('orders')
          .update({ status: 'pagado' })
          .eq('id', orderId);
      }

      setAmount(0);
      setReferenceNumber('');
      setImageUrl('');
      await loadPayments();
      onSuccess();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error al guardar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Abonos - {customerName}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-700 font-medium">Total a Pagar:</span>
              <span className="text-slate-900 font-bold">${orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700 font-medium">Total Abonado:</span>
              <span className="text-green-600 font-bold">${totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-slate-700 font-medium">Restante:</span>
              <span className="text-red-600 font-bold">${remaining.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monto del Abono ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de Referencia
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                placeholder="Ej: 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL de la Imagen del Pago
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || amount <= 0}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Registrar Abono'}
            </button>
          </form>

          {payments.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-800 mb-3">Historial de Abonos</h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-slate-50 p-3 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        ${parseFloat(payment.amount.toString()).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(payment.payment_date).toLocaleString('es-VE')}
                      </p>
                      {payment.reference_number && (
                        <p className="text-xs text-slate-500">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                    </div>
                    {payment.payment_image_url && (
                      <a
                        href={payment.payment_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver comprobante
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
