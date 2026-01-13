import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, CheckCircle, History, Download, X, AlertCircle } from 'lucide-react';

// Componente Modal Customizado
const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />;
      case 'confirm':
        return <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />;
      default:
        return <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-fadeIn">
        <div className="p-6">
          {getIcon()}
          {title && <h3 className="text-xl font-bold text-gray-800 text-center mb-3">{title}</h3>}
          <p className="text-gray-600 text-center mb-6">{message}</p>
          
          <div className="flex gap-3">
            {type === 'confirm' ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                >
                  Confirmar
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium transition"
                style={{backgroundColor: '#00953b'}}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtocoloAmaraNZero = () => {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const anoAtual = new Date().getFullYear();

  // Logo Amara NZero (URL externa)
  const LOGO_AMARA = "https://i.imgur.com/BQEQiWL.png";
  
  const [formData, setFormData] = useState({
    setorEnvio: 'MARKETING',
    unidadeEnvio: 'MATRIZ',
    unidadeDestino: '',
    setorDestino: '',
    aosCuidadosDe: '',
    nomeArquivo: ''
  });

  const [documentos, setDocumentos] = useState([
    { id: 1, descricao: '' },
    { id: 2, descricao: '' }
  ]);

  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [numeroProtocolo, setNumeroProtocolo] = useState(null);
  const [protocolosSelecionados, setProtocolosSelecionados] = useState([]);
  const [modoSelecao, setModoSelecao] = useState(false);

  // Estado do Modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  // Funções para controlar o modal
  const showModal = (message, type = 'info', title = '', onConfirm = null) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  // Carregar histórico
  useEffect(() => {
    carregarHistorico();
    gerarNumeroProtocolo();
  }, []);

  const gerarNumeroProtocolo = () => {
    try {
      const chaveAno = `ultimo_numero_protocolo_${anoAtual}`;
      const ultimoNumero = localStorage.getItem(chaveAno);
      let proximoNumero = 1;
      
      if (ultimoNumero) {
        proximoNumero = parseInt(ultimoNumero) + 1;
      }
      
      const numeroFormatado = `${anoAtual}-${proximoNumero.toString().padStart(3, '0')}`;
      setNumeroProtocolo(numeroFormatado);
      
      localStorage.setItem(chaveAno, proximoNumero.toString());
    } catch (error) {
      const numeroFallback = `${anoAtual}-${Date.now().toString().slice(-3)}`;
      setNumeroProtocolo(numeroFallback);
    }
  };

  const carregarHistorico = () => {
    try {
      const protocolos = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('protocolo:')) {
          const value = localStorage.getItem(key);
          if (value) {
            protocolos.push(JSON.parse(value));
          }
        }
      }
      setHistorico(protocolos.sort((a, b) => new Date(b.dataGeracao) - new Date(a.dataGeracao)));
    } catch (error) {
      console.log('Sem histórico ainda');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocChange = (id, value) => {
    setDocumentos(documentos.map(doc => 
      doc.id === id ? { ...doc, descricao: value } : doc
    ));
  };

  const adicionarDoc = () => {
    if (documentos.length >= 8) {
      showModal('Máximo de 8 documentos por protocolo', 'warning', 'Limite Atingido');
      return;
    }
    const novoId = Math.max(...documentos.map(d => d.id), 0) + 1;
    setDocumentos([...documentos, { id: novoId, descricao: '' }]);
  };

  const removerDoc = (id) => {
    if (documentos.length > 1) {
      setDocumentos(documentos.filter(doc => doc.id !== id));
    }
  };

  const salvarNoHistorico = (mostrarAlerta = true) => {
    const protocolo = {
      id: Date.now(),
      numeroProtocolo: numeroProtocolo,
      dataGeracao: new Date().toISOString(),
      dataFormatada: hoje,
      nomeArquivo: formData.nomeArquivo || 'Sem nome',
      ...formData,
      documentos: documentos.map(d => d.descricao).filter(d => d)
    };

    try {
      localStorage.setItem(`protocolo:${protocolo.id}`, JSON.stringify(protocolo));
      carregarHistorico();
      if (mostrarAlerta) {
        showModal('Protocolo salvo no histórico!', 'success', 'Sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      if (mostrarAlerta) {
        showModal('Erro ao salvar no histórico', 'error', 'Erro');
      }
    }
  };

  const salvarSemImprimir = () => {
    if (!formData.nomeArquivo.trim()) {
      showModal('Por favor, preencha o nome do arquivo!', 'warning', 'Campo Obrigatório');
      return;
    }
    
    salvarNoHistorico(true);
    gerarNumeroProtocolo();
  };

  const excluirDoHistorico = (id) => {
    showModal(
      'Tem certeza que deseja excluir este protocolo?',
      'confirm',
      'Confirmar Exclusão',
      () => {
        try {
          localStorage.removeItem(`protocolo:${id}`);
          carregarHistorico();
        } catch (error) {
          console.error('Erro ao excluir:', error);
        }
      }
    );
  };

  const carregarProtocolo = (protocolo) => {
    setFormData({
      setorEnvio: protocolo.setorEnvio,
      unidadeEnvio: protocolo.unidadeEnvio,
      unidadeDestino: protocolo.unidadeDestino,
      setorDestino: protocolo.setorDestino,
      aosCuidadosDe: protocolo.aosCuidadosDe,
      nomeArquivo: protocolo.nomeArquivo
    });
    setDocumentos(protocolo.documentos.map((desc, idx) => ({ id: idx + 1, descricao: desc })));
    setMostrarHistorico(false);
  };

  const imprimirProtocolo = () => {
    if (!formData.nomeArquivo.trim()) {
      showModal('Por favor, preencha o nome do arquivo!', 'warning', 'Campo Obrigatório');
      return;
    }
    
    salvarNoHistorico(false);
    setMostrarPreview(true);
    
    setTimeout(() => {
      window.print();
      showModal('Protocolo salvo e enviado para impressão!', 'success', 'Sucesso');
      gerarNumeroProtocolo();
    }, 500);
  };

  const toggleSelecao = (id) => {
    if (protocolosSelecionados.includes(id)) {
      setProtocolosSelecionados(protocolosSelecionados.filter(pId => pId !== id));
    } else {
      setProtocolosSelecionados([...protocolosSelecionados, id]);
    }
  };

  const selecionarTodos = () => {
    if (protocolosSelecionados.length === historico.length) {
      setProtocolosSelecionados([]);
    } else {
      setProtocolosSelecionados(historico.map(p => p.id));
    }
  };

  const imprimirSelecionados = () => {
    if (protocolosSelecionados.length === 0) {
      showModal('Selecione pelo menos um protocolo!', 'warning', 'Atenção');
      return;
    }

    const protocolos = historico.filter(p => protocolosSelecionados.includes(p.id));
    
    // Criar conteúdo HTML com todos os protocolos
    let conteudoHTML = '';
    
    protocolos.forEach((protocolo, index) => {
      const docs = protocolo.documentos || [];
      const docsHTML = docs.map((doc, idx) => `
        <div style="display: flex; gap: 8px; font-size: 14px;">
          <span style="font-weight: bold; color: #00953b;">${idx + 1}.</span>
          <span>${doc}</span>
        </div>
      `).join('');

      conteudoHTML += `
  ${index > 0 ? '<div style="page-break-before: always;"></div>' : ''}
  <div style="border: 4px solid black; padding: 16px; margin-bottom: 20px; font-family: 'Lato', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #9ca3af; padding-bottom: 16px; margin-bottom: 16px;">
            <img src="${LOGO_AMARA}" style="height: 112px; object-fit: contain; margin-left: -24px;" />
            <div style="flex: 1; text-align: center; padding: 0 16px;">
              <h2 style="font-size: 20px; font-weight: bold; margin: 0;">PROTOCOLO DE ENVIO DE DOCUMENTOS</h2>
            </div>
            <div style="text-align: center;">
              <div style="width: 140px; height: 32px; border: 2px solid #1f2937; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;">
                PROTOCOLO 2026
              </div>
              <div style="font-size: 12px; font-weight: 500; color: #374151; margin-top: 4px;">DESCRIÇÃO-MKT</div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 32px; margin-bottom: 16px; font-size: 14px;">
            <div>
              <p style="color: #4b5563; font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">Setor de Envio:</p>
              <p style="font-weight: bold; margin: 0; font-size: 13px;">${protocolo.setorEnvio}</p>
            </div>
            <div>
              <p style="color: #4b5563; font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">Unidade de Envio:</p>
              <p style="font-weight: bold; margin: 0; font-size: 13px;">${protocolo.unidadeEnvio}</p>
            </div>
            <div>
              <p style="color: #4b5563; font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">Unidade de Destino:</p>
              <p style="font-weight: bold; margin: 0; font-size: 13px;">${protocolo.unidadeDestino || '-'}</p>
            </div>
            <div>
              <p style="color: #4b5563; font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">Setor de Destino:</p>
              <p style="font-weight: bold; margin: 0; font-size: 13px;">${protocolo.setorDestino || '-'}</p>
            </div>
            <div style="grid-column: span 2;">
              <p style="color: #4b5563; font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">Aos Cuidados de:</p>
              <p style="font-weight: bold; margin: 0; font-size: 13px;">${protocolo.aosCuidadosDe || '-'}</p>
            </div>
          </div>
          
          <div style="border-top: 2px solid #9ca3af; padding-top: 16px; margin-bottom: 16px;">
            <p style="font-size: 14px; margin-bottom: 12px;">Segue abaixo a relação dos documentos que estarão sendo enviados em anexo a este protocolo:</p>
            <div style="background: #f3f4f6; padding: 12px; border: 1px solid #d1d5db; border-radius: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px;">
              ${docsHTML}
            </div>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #eab308; padding: 16px; margin: 16px 0; border-radius: 4px; display: flex; align-items: center; justify-content: center; min-height: 64px;">
            <p style="font-weight: bold; text-align: center; font-size: 16px; margin: 0;">DEVOLVER ESTE PROTOCOLO DEVIDAMENTE ASSINADO</p>
          </div>
          
          <div style="border-top: 2px solid #9ca3af; padding-top: 16px; margin-bottom: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; text-align: center; font-size: 14px;">
              <div>
                <p style="font-weight: 600; margin-bottom: 4px;">DATA DE ENVIO</p>
                <p style="font-weight: bold; font-size: 18px;">${protocolo.dataFormatada}</p>
              </div>
              <div>
                <p style="font-weight: 600; margin-bottom: 4px;">DATA RECEBIMENTO</p>
                <p style="letter-spacing: 2px;">_____/_____/_____</p>
              </div>
              <div>
                <p style="font-weight: 600; margin-bottom: 4px;">HORÁRIO</p>
                <p style="letter-spacing: 2px;">_____:_____ hs</p>
              </div>
            </div>
          </div>
          
          <div style="border-top: 2px solid #9ca3af; padding-top: 24px; margin-top: 24px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
              <div style="text-align: center;">
                <div style="height: 64px; margin-bottom: 8px;"></div>
                <div style="border-top: 2px solid black; padding-top: 8px;">
                  <p style="font-size: 12px; font-weight: 500; margin: 0;">Assinatura do Emitente</p>
                </div>
              </div>
              <div style="text-align: center;">
                <div style="height: 64px; margin-bottom: 8px;"></div>
                <div style="border-top: 2px solid black; padding-top: 8px;">
                  <p style="font-size: 12px; font-weight: 500; margin: 0;">Assinatura do Receptor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // Criar janela temporária para impressão
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Protocolos - Impressão em Lote</title>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
        <style>
          * { font-family: 'Lato', sans-serif; }
          body { margin: 0; padding: 20px; }
          @media print {
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>${conteudoHTML}</body>
      </html>
    `);
    
    janelaImpressao.document.close();
    
    setTimeout(() => {
      janelaImpressao.print();
      showModal(`${protocolos.length} protocolo(s) enviado(s) para impressão!`, 'success', 'Sucesso');
    }, 500);
    
    setModoSelecao(false);
    setProtocolosSelecionados([]);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          #protocolo-print, #protocolo-print * {
            visibility: visible;
          }
         #protocolo-print {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  padding: 10mm;

  transform: scale(0.9);
  transform-origin: top center;
}

          .no-print {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      {/* Modal Component */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 no-print">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" style={{color: '#00953b'}} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Registro de Protocolo
                </h1>
                <p className="text-gray-600">Sistema Amara NZero</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarHistorico(!mostrarHistorico)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
              style={{backgroundColor: '#00953b'}}
            >
              <History className="w-5 h-5" />
              Histórico ({historico.length})
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm p-2 rounded" style={{backgroundColor: '#e6f7ed', color: '#00953b'}}>
            <CheckCircle className="w-4 h-4" />
            <span>Data: <strong>{hoje}</strong> | Protocolo <strong>{anoAtual}</strong> | Nº <strong>{numeroProtocolo || 'Gerando...'}</strong></span>
          </div>
        </div>

        {/* Histórico */}
        {mostrarHistorico && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 no-print">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Histórico</h2>
              <div className="flex gap-2">
                {!modoSelecao ? (
                  <>
                    <button
                      onClick={() => setModoSelecao(true)}
                      className="px-4 py-2 text-white rounded-md hover:opacity-90"
                      style={{backgroundColor: '#00953b'}}
                    >
                      Impressão em Lote
                    </button>
                    <button
                      onClick={() => setMostrarHistorico(false)}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Fechar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={selecionarTodos}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      {protocolosSelecionados.length === historico.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </button>
                    <button
                      onClick={imprimirSelecionados}
                      className="px-4 py-2 text-white rounded-md hover:opacity-90"
                      style={{backgroundColor: '#00953b'}}
                    >
                      Imprimir ({protocolosSelecionados.length})
                    </button>
                    <button
                      onClick={() => {
                        setModoSelecao(false);
                        setProtocolosSelecionados([]);
                      }}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
            {historico.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum protocolo ainda</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historico.map(p => (
                  <div key={p.id} className={`border rounded-lg p-4 transition ${
                    protocolosSelecionados.includes(p.id) ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      {modoSelecao && (
                        <input
                          type="checkbox"
                          checked={protocolosSelecionados.includes(p.id)}
                          onChange={() => toggleSelecao(p.id)}
                          className="mt-1 mr-3 w-5 h-5 cursor-pointer"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{p.nomeArquivo}</h3>
                          <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                            #{p.numeroProtocolo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {p.setorEnvio} → {p.unidadeDestino || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{p.dataFormatada}</p>
                      </div>
                      {!modoSelecao && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => carregarProtocolo(p)}
                            className="px-3 py-1 text-white text-sm rounded hover:opacity-90"
                            style={{backgroundColor: '#00953b'}}
                          >
                            Carregar
                          </button>
                          <button
                            onClick={() => excluirDoHistorico(p.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulário */}
        {!mostrarPreview ? (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 no-print">
            {/* Nome do Arquivo */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Nome do Arquivo (obrigatório) *
              </label>
              <input
                type="text"
                name="nomeArquivo"
                value={formData.nomeArquivo}
                onChange={handleInputChange}
                placeholder="Ex: Contrato Social, NF 1234, etc"
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-md focus:ring-2 focus:ring-yellow-500 font-medium"
              />
              <p className="text-xs text-gray-600 mt-2">
                Arquivo: <strong>PROTOCOLO - {formData.setorEnvio} - {formData.nomeArquivo || '[NOME]'}.pdf</strong>
              </p>
            </div>

            {/* Dados de Envio */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Dados de Envio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setor de Envio
                  </label>
                  <input
                    type="text"
                    name="setorEnvio"
                    value={formData.setorEnvio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade de Envio
                  </label>
                  <input
                    type="text"
                    name="unidadeEnvio"
                    value={formData.unidadeEnvio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Dados de Destino */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Dados de Destino
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade de Destino
                  </label>
                  <input
                    type="text"
                    name="unidadeDestino"
                    value={formData.unidadeDestino}
                    onChange={handleInputChange}
                    placeholder="Ex: Filial SP"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Setor de Destino
                  </label>
                  <input
                    type="text"
                    name="setorDestino"
                    value={formData.setorDestino}
                    onChange={handleInputChange}
                    placeholder="Ex: Financeiro"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aos Cuidados de
                  </label>
                  <input
                    type="text"
                    name="aosCuidadosDe"
                    value={formData.aosCuidadosDe}
                    onChange={handleInputChange}
                    placeholder="Nome do destinatário"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                  Documentos
                </h2>
                <button
                  onClick={adicionarDoc}
                  className="flex items-center gap-2 px-3 py-1 text-white rounded-md hover:opacity-90 text-sm"
                  style={{backgroundColor: '#00953b'}}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              <div className="space-y-3">
                {documentos.map((doc, index) => (
                  <div key={doc.id} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center rounded font-semibold text-white" style={{backgroundColor: '#00953b'}}>
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={doc.descricao}
                      onChange={(e) => handleDocChange(doc.id, e.target.value)}
                      placeholder="Descrição do documento"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    {documentos.length > 1 && (
                      <button
                        onClick={() => removerDoc(doc.id)}
                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => setMostrarPreview(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 font-medium"
                style={{backgroundColor: '#00953b'}}
              >
                <Eye className="w-5 h-5" />
                Visualizar Protocolo
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={salvarSemImprimir}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <History className="w-5 h-5" />
                  Salvar no Histórico
                </button>
                
                <button
                  onClick={imprimirProtocolo}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  <Download className="w-5 h-5" />
                  Salvar como PDF
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="mt-6 rounded-lg p-4 text-sm" style={{backgroundColor: '#e6f7ed', borderColor: '#00953b', borderWidth: '1px', color: '#00953b'}}>
              <p className="font-bold mb-2">Como usar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>"Visualizar Protocolo"</strong> - Ver como ficará antes de salvar</li>
                <li><strong>"Salvar no Histórico"</strong> - Apenas salva localmente (sem imprimir)</li>
                <li><strong>"Salvar como PDF"</strong> - Salva no histórico e já abre para impressão</li>
              </ol>
              <p className="mt-3 text-xs bg-yellow-50 border border-yellow-300 rounded p-2" style={{color: '#92400e'}}>
                <strong>Importante:</strong> Os dados ficam salvos apenas neste navegador. Se limpar o cache ou usar outro computador, não verá o histórico.
              </p>
            </div>
          </div>
        ) : (
          /* Preview */
          <div>
            <div id="protocolo-print" className="bg-white p-6">
              <div className="border-4 border-black p-6">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between border-b-2 border-gray-400 pb-4 mb-4">
                  <img 
                    src={LOGO_AMARA}
                    alt="Amara NZero" 
                    className="h-28 object-contain -ml-6"
                  />
                  <div className="flex-1 text-center px-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      PROTOCOLO DE ENVIO DE DOCUMENTOS
                    </h2>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      style={{
                        width: '140px',
                        height: '32px',
                        border: '2px solid #1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '700',
                        boxSizing: 'border-box'
                      }}
                    >
                      PROTOCOLO 2026
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        marginTop: '4px'
                      }}
                    >
                      DESCRIÇÃO-MKT
                    </div>
                  </div>
                </div>

                {/* Dados em Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-600" style={{fontSize: '14px'}}>Setor de Envio:</p>
                    <p className="font-bold" style={{fontSize: '13px'}}>{formData.setorEnvio}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600" style={{fontSize: '14px'}}>Unidade de Envio:</p>
                    <p className="font-bold" style={{fontSize: '13px'}}>{formData.unidadeEnvio}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600" style={{fontSize: '14px'}}>Unidade de Destino:</p>
                    <p className="font-bold" style={{fontSize: '13px'}}>{formData.unidadeDestino || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600" style={{fontSize: '14px'}}>Setor de Destino:</p>
                    <p className="font-bold" style={{fontSize: '13px'}}>{formData.setorDestino || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-semibold text-gray-600" style={{fontSize: '14px'}}>Aos Cuidados de:</p>
                    <p className="font-bold" style={{fontSize: '13px'}}>{formData.aosCuidadosDe || '-'}</p>
                  </div>
                </div>

                {/* Documentos */}
                <div className="border-t-2 border-gray-400 pt-4 mb-4">
                  <p className="text-sm mb-3">
                    Segue abaixo a relação dos documentos que estarão sendo enviados em anexo a este protocolo:
                  </p>
                  <div className="bg-gray-100 p-3 border border-gray-300 rounded grid grid-cols-2 gap-x-4">
                    {documentos.filter(d => d.descricao).map((doc, index) => (
                      <div key={doc.id} className="flex gap-2 text-sm mb-2">
                        <span className="font-bold" style={{color: '#00953b'}}>{index + 1}.</span>
                        <span className="font-medium">{doc.descricao}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aviso Amarelo */}
                <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded mt-4 flex items-center justify-center min-h-16">
                  <p className="font-bold text-center text-base">
                    DEVOLVER ESTE PROTOCOLO DEVIDAMENTE ASSINADO
                  </p>
                </div>

                {/* Datas */}
                <div className="border-t-2 border-gray-400 pt-4 mt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-700 font-semibold mb-1">DATA DE ENVIO</p>
                      <p className="font-bold text-lg">{hoje}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 font-semibold mb-1">DATA RECEBIMENTO</p>
                      <p className="text-gray-500 tracking-widest">_____/_____/_____</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 font-semibold mb-1">HORÁRIO</p>
                      <p className="text-gray-500 tracking-widest">_____:_____ hs</p>
                    </div>
                  </div>
                </div>

                {/* Assinaturas */}
                <div className="border-t-2 border-gray-400 pt-6 mt-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="h-16"></div>
                      <div className="border-t-2 border-gray-700 pt-2">
                        <p className="text-xs font-medium">Assinatura do Emitente</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="h-16"></div>
                      <div className="border-t-2 border-gray-700 pt-2">
                        <p className="text-xs font-medium">Assinatura do Receptor</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões Preview */}
            <div className="flex gap-3 mt-6 no-print">
              <button
                onClick={() => setMostrarPreview(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                ← Editar
              </button>
              <button
                onClick={imprimirProtocolo}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                <Download className="w-5 h-5" />
                Salvar como PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocoloAmaraNZero;
