import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoadingIndicator = () => (
  <motion.div 
    className="flex items-center text-sm text-slate-500 bg-white p-2 rounded-lg shadow-sm border border-slate-200"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
    <span>Generating response...</span>
  </motion.div>
);

export const ErrorMessage = ({ error }: { error: string }) => (
  <motion.div 
    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <AlertCircle className="h-4 w-4 text-red-500" />
    <div className="flex-1">
      <p>{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="text-xs flex items-center gap-1 text-red-600 hover:text-red-800 mt-1 underline"
      >
        <RotateCcw className="h-3 w-3" /> Try reloading
      </button>
    </div>
  </motion.div>
); 