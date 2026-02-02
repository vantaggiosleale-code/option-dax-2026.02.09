import React from 'react';
import { Lightbulb } from 'lucide-react';

export function ProposteView() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">
            Proposte e Segnalazioni
          </h1>
        </div>
        <p className="text-muted-foreground ml-13">
          Aiutaci a migliorare Option DAX! Segnala bug, proponi nuove funzionalità o suggerisci miglioramenti.
        </p>
      </div>

      {/* Google Form Container */}
      <div className="flex-1 overflow-hidden bg-background">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdzw52iwYenknu3r8Rn2q2BTdANSCoVxAXUFnxfDfn3o7xSlg/viewform?embedded=true"
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
