import React from 'react';
import { Clock } from 'lucide-react';

const History: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-[#1a1a1f] border border-[#2a2a2f] rounded-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                    <Clock className="w-8 h-8 text-sky-500" />
                    <h1 className="text-3xl font-bold text-white">Storico Operazioni</h1>
                </div>
                
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-sky-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Coming Soon</h2>
                    <p className="text-gray-400 text-center max-w-md">
                        Lo storico completo delle operazioni sarà disponibile a breve. 
                        Potrai analizzare tutte le tue transazioni passate con filtri avanzati.
                    </p>
                    <div className="mt-8 bg-[#0a0a0f] border border-[#2a2a2f] rounded-lg p-6 max-w-2xl">
                        <h3 className="text-lg font-semibold text-white mb-3">Funzionalità previste:</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start">
                                <span className="text-sky-500 mr-2">•</span>
                                <span>Timeline completa di tutte le operazioni</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sky-500 mr-2">•</span>
                                <span>Filtri per data, tipo di struttura, P/L</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sky-500 mr-2">•</span>
                                <span>Statistiche aggregate per periodo</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sky-500 mr-2">•</span>
                                <span>Export dati in CSV/Excel per analisi esterne</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
