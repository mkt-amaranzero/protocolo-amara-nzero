import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, CheckCircle, History, Download } from 'lucide-react';

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
    { id: 2, descricao: '' },
    { id: 3, descricao: '' },
    { id: 4, descricao: '' }
  ]);

  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [numeroProtocolo, setNumeroProtocolo] = useState(null);

  // Carregar histórico
  useEffect(() => {
    carregarHistorico();
    gerarNumeroProtocolo();
  }, []);

  const gerarNumeroProtocolo = async () => {
    try {
      // Buscar o último número usado PARA ESTE ANO
      const chaveAno = `ultimo_numero_protocolo_${anoAtual}`;
      const result = await window.storage.get(chaveAno);
      let proximoNumero = 1;
      
      if (result && result.value) {
        proximoNumero = parseInt(result.value) + 1;
      }
      
      // Formatar: ANO-NÚMERO com 3 dígitos (ex: 2025-001)
      const numeroFormatado = `${anoAtual}-${proximoNumero.toString().padStart(3, '0')}`;
      setNumeroProtocolo(numeroFormatado);
      
      // Salvar o próximo número PARA ESTE ANO
      await window.storage.set(chaveAno, proximoNumero.toString());
    } catch (error) {
      // Se der erro, usar timestamp como fallback
      const numeroFallback = `${anoAtual}-${Date.now().toString().slice(-3)}`;
      setNumeroProtocolo(numeroFallback);
    }
  };

  const carregarHistorico = async () => {
    try {
      const keys = await window.storage.list('protocolo:');
      if (keys && keys.keys) {
        const protocolos = [];
        for (const key of keys.keys) {
          const result = await window.storage.get(key);
          if (result && result.value) {
            protocolos.push(JSON.parse(result.value));
          }
        }
        setHistorico(protocolos.sort((a, b) => new Date(b.dataGeracao) - new Date(a.dataGeracao)));
      }
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
    const novoId = Math.max(...documentos.map(d => d.id), 0) + 1;
    setDocumentos([...documentos, { id: novoId, descricao: '' }]);
  };

  const removerDoc = (id) => {
    if (documentos.length > 1) {
      setDocumentos(documentos.filter(doc => doc.id !== id));
    }
  };

  const salvarNoHistorico = async () => {
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
      await window.storage.set(`protocolo:${protocolo.id}`, JSON.stringify(protocolo));
      await carregarHistorico();
      alert('Protocolo salvo no histórico!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const excluirDoHistorico = async (id) => {
    try {
      await window.storage.delete(`protocolo:${id}`);
      await carregarHistorico();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
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

  const imprimirProtocolo = async () => {
    if (!formData.nomeArquivo.trim()) {
      alert('❌ Por favor, preencha o nome do arquivo!');
      return;
    }
    
    await salvarNoHistorico();
    setMostrarPreview(true);
    
    // Aguardar um momento para o preview renderizar
    setTimeout(() => {
      window.print();
      // Gerar novo número para o próximo protocolo
      gerarNumeroProtocolo();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <style>{`
        @media print {
          /* Forçar impressão de cores */
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
          }
          .no-print {
            display: none !important;
          }
          
          /* Configurar página A4 */
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 no-print">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" style={{color: '#00953b'}} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Automação de Protocolo
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
              <h2 className="text-2xl font-bold">📋 Histórico</h2>
              <button
                onClick={() => setMostrarHistorico(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
            {historico.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum protocolo ainda</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historico.map(p => (
                  <div key={p.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => carregarProtocolo(p)}
                          className="px-3 py-1 text-white text-sm rounded hover:opacity-90"
                          style={{backgroundColor: '#00953b'}}
                        >
                          Carregar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Excluir?')) excluirDoHistorico(p.id);
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                    placeholder="Ex: FILIAL SP"
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
                    placeholder="Ex: FINANCEIRO"
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
              <button
                onClick={imprimirProtocolo}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                <Download className="w-5 h-5" />
                Salvar como PDF
              </button>
            </div>
          </div>
        ) : (
          /* Preview */
          <div>
            <div id="protocolo-print" className="bg-white p-6">
              <div className="border-4 border-black p-6">
                {/* Cabeçalho CORRIGIDO */}
                <div className="flex items-start justify-between border-b-2 border-gray-400 pb-4 mb-4">
                  <img 
                    src={LOGO_AMARA}
                    alt="Amara NZero" 
                    className="h-20 object-contain"
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
    PROTOCOLO 2025
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
                    <p className="text-gray-600 font-semibold">Setor de Envio:</p>
                    <p className="font-bold">{formData.setorEnvio}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Unidade de Envio:</p>
                    <p className="font-bold">{formData.unidadeEnvio}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Unidade de Destino:</p>
                    <p className="font-bold">{formData.unidadeDestino || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Setor de Destino:</p>
                    <p className="font-bold">{formData.setorDestino || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600 font-semibold">Aos Cuidados de:</p>
                    <p className="font-bold">{formData.aosCuidadosDe || '-'}</p>
                  </div>
                </div>

                {/* Documentos */}
                <div className="border-t-2 border-gray-400 pt-4 mb-4">
                  <p className="text-sm mb-3">
                    Segue abaixo a relação dos documentos que estarão sendo enviados em anexo a este protocolo:
                  </p>
                  <div className="bg-gray-100 p-3 border border-gray-300 rounded">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {documentos.filter(d => d.descricao).map((doc, index) => (
                        <div key={doc.id} className="flex gap-2 text-sm">
                          <span className="font-bold" style={{color: '#00953b'}}>{index + 1}.</span>
                          <span>{doc.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Aviso Amarelo */}
                <div className="bg-yellow-100 border-2 border-yellow-500 p-3 my-4">
                  <p className="font-bold text-center text-sm">
                    DEVOLVER ESTE PROTOCOLO DEVIDAMENTE ASSINADO
                  </p>
                </div>

                {/* Datas */}
                <div className="border-t-2 border-gray-400 pt-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="font-semibold mb-1">DATA DE ENVIO</p>
                      <p className="font-bold">{hoje}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">DATA RECEBIMENTO</p>
                      <p>_____/_____/_____</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">HORÁRIO</p>
                      <p>_____:_____ hs</p>
                    </div>
                  </div>
                </div>

                {/* Assinaturas */}
                <div className="border-t-2 border-gray-400 pt-6">
                  <div className="grid grid-cols-2 gap-12">
                    <div className="text-center">
                      <div className="h-12 mb-2"></div>
                      <div className="border-t-2 border-black pt-2">
                        <p className="text-xs font-medium">Assinatura do Emitente</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="h-12 mb-2"></div>
                      <div className="border-t-2 border-black pt-2">
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
                Gerar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocoloAmaraNZero;
