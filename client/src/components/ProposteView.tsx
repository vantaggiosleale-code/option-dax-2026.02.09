import React from 'react';
import { Lightbulb } from 'lucide-react';

export function ProposteView() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Proposte e Segnalazioni
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-13">
          Aiutaci a migliorare Option DAX! Segnala bug, proponi nuove funzionalità o suggerisci miglioramenti.
        </p>
      </div>

      {/* Google Form Container */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSeU6SV7tzrtX3Bsc_KqhLkP-yp70SfW_HD8vt7lj7GB9-8E6g/viewform?embedded=true"
          width="100%"
          height="100%"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          className="w-full h-full"
          title="Form Proposte e Segnalazioni"
        >
          Caricamento…
        </iframe>
      </div>
    </div>
  );
}
