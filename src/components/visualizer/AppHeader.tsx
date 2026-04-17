import { TreeMode } from '@/lib/tree-types';
import { Moon, Sun, GitBranch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppHeaderProps {
  mode: TreeMode;
  onModeChange: (mode: TreeMode) => void;
}

export function AppHeader({ mode, onModeChange }: AppHeaderProps) {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const isTheory = location.pathname === '/theory';

  return (
    <header className="glass sticky top-0 z-50 px-3 md:px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Tree Visualizer
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => { onModeChange('btree'); if (isTheory) navigate('/'); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isTheory && mode === 'btree' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            B-Tree
          </button>
          <button
            onClick={() => { onModeChange('bplus'); if (isTheory) navigate('/'); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isTheory && mode === 'bplus' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            B+ Tree
          </button>
          <button
            onClick={() => navigate('/theory')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isTheory ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Theory
          </button>
        </div>

        <button
          onClick={() => setDark(d => !d)}
          className="ml-2 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
