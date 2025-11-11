import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { OrdersModule } from './components/OrdersModule';
import { StatisticsModule } from './components/StatisticsModule';
import { NotesModule } from './components/NotesModule';
import { LogOut, ShoppingBag, TrendingUp, StickyNote } from 'lucide-react';

type Tab = 'orders' | 'statistics' | 'notes';

function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-slate-700" />
              <h1 className="ml-3 text-xl font-bold text-slate-800">
                Gestión de Negocio
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-slate-800 border-b-2 border-slate-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Encargos
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'statistics'
                  ? 'text-slate-800 border-b-2 border-slate-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'text-slate-800 border-b-2 border-slate-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <StickyNote className="w-5 h-5" />
              Notas
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'orders' && <OrdersModule />}
          {activeTab === 'statistics' && <StatisticsModule />}
          {activeTab === 'notes' && <NotesModule />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;
