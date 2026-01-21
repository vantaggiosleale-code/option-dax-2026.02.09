import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { toast } from 'sonner';

interface GraphicModalProps {
    structureId: number;
    isOpen: boolean;
    onClose: () => void;
}

const GraphicModal: React.FC<GraphicModalProps> = ({ structureId, isOpen, onClose }) => {
    const [selectedType, setSelectedType] = useState<'apertura' | 'aggiustamento' | 'chiusura'>('apertura');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    
    const generateMutation = trpc.graphics.generate.useMutation({
        onSuccess: (data) => {
            setGeneratedImageUrl(data.imageUrl);
            toast.success('Grafica generata con successo!');
        },
        onError: (error) => {
            toast.error('Errore generazione grafica', { description: error.message });
        }
    });

    const handleGenerate = () => {
        setGeneratedImageUrl(null);
        generateMutation.mutate({ structureId, type: selectedType });
    };

    const handleDownload = () => {
        if (!generatedImageUrl) return;
        
        // Crea link temporaneo per download
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `grafica-${selectedType}-${structureId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Download avviato!');
    };

    const handleCopyLink = () => {
        if (!generatedImageUrl) return;
        
        navigator.clipboard.writeText(generatedImageUrl);
        toast.success('Link copiato negli appunti!');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <span>Genera Grafica Telegram</span>
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Tipo Grafica */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Tipo Grafica
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setSelectedType('apertura')}
                                className={`p-4 rounded-lg border-2 transition ${
                                    selectedType === 'apertura'
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🆕</div>
                                    <div className="font-semibold">Apertura</div>
                                    <div className="text-xs mt-1 opacity-75">Nuova operazione</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setSelectedType('aggiustamento')}
                                className={`p-4 rounded-lg border-2 transition ${
                                    selectedType === 'aggiustamento'
                                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">🔄</div>
                                    <div className="font-semibold">Aggiustamento</div>
                                    <div className="text-xs mt-1 opacity-75">Roll/Modifica</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setSelectedType('chiusura')}
                                className={`p-4 rounded-lg border-2 transition ${
                                    selectedType === 'chiusura'
                                        ? 'border-red-500 bg-red-500/10 text-red-400'
                                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="text-2xl mb-2">✅</div>
                                    <div className="font-semibold">Chiusura</div>
                                    <div className="text-xs mt-1 opacity-75">Risultato finale</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Preview Grafica */}
                    {generatedImageUrl && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">
                                Anteprima
                            </label>
                            <div className="bg-gray-800 rounded-lg p-4 flex justify-center">
                                <img 
                                    src={generatedImageUrl} 
                                    alt="Grafica generata" 
                                    className="max-w-full h-auto rounded shadow-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Pulsanti Azione */}
                    <div className="flex space-x-3">
                        {!generatedImageUrl ? (
                            <button
                                onClick={handleGenerate}
                                disabled={generateMutation.isPending}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
                            >
                                {generateMutation.isPending ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Generazione in corso...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                        <span>Genera Grafica</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span>Scarica</span>
                                </button>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                    </svg>
                                    <span>Copia Link</span>
                                </button>
                                <button
                                    onClick={() => setGeneratedImageUrl(null)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphicModal;
