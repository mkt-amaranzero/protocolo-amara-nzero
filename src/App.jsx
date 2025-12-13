import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, CheckCircle, History, Download } from 'lucide-react';

const ProtocoloAmaraNzero = () => {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const anoAtual = new Date().getFullYear();

  // Logo Amara NZero
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

  // Carregar histórico
  useEffect(() => {
    carregarHistorico();
  }, []);

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
      dataGeracao: new Date().toISOString(),
      dataFormatada: hoje,
      nomeArquivo: formData.nomeArquivo || 'Sem nome',
      ...formData,
      documentos: documentos.map(d => d.descricao).filter(d => d)
    };

    try {
      await window.storage.set(`protocolo:${protocolo.id}`, JSON.stringify(protocolo));
      await carregarHistorico();
      alert('✅ Protocolo salvo no histórico!');
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
    alert('⚠ Por favor, preencha o nome do arquivo!');
    return;
  }
  
  await salvarNoHistorico();
  setMostrarPreview(true);
  
  // Aguardar renderização
  setTimeout(async () => {
    const elemento = document.getElementById('protocolo-print');
    
    try {
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const nomeArquivo = `PROTOCOLO - ${formData.setorEnvio} - ${formData.nomeArquivo}.pdf`;
      pdf.save(nomeArquivo);
      
      alert('✅ PDF salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF. Tente novamente.');
    }
  }, 500);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <style>{`
        @media print {
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
          }
          .no-print {
            display: none !important;
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
            <span>Data: <strong>{hoje}</strong> | Protocolo <strong>{anoAtual}</strong></span>
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
                        <h3 className="font-semibold text-lg">{p.nomeArquivo}</h3>
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
                📝 Nome do Arquivo (obrigatório) *
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
                📤 Dados de Envio
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
                📥 Dados de Destino
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
                  📄 Documentos
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
                Salvar como PDF (Imprimir)
              </button>
            </div>
          </div>
        ) : (
          /* Preview */
          <div>
            <div id="protocolo-print" className="bg-white rounded-lg shadow-lg p-8">
              <div className="border-4 border-gray-800 p-8 space-y-6">
                {/* Cabeçalho */}
               <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4">
  <img 
    src={LOGO_AMARA}
    alt="Amara nzero" 
    className="h-32 object-contain"
  />
  <div className="text-center">
    <h2 className="text-2xl font-bold text-gray-900">
      PROTOCOLO DE ENVIO DE DOCUMENTOS
    </h2>
  </div>
  <div className="text-center flex flex-col items-center">
    <div className="text-lg font-bold border-2 border-gray-800 px-4 py-2 mb-1 min-w-32 flex items-center justify-center">
      Protocolo {anoAtual}
    </div>
    <div className="text-sm font-medium text-gray-700">
      DESCRIÇÃO-MKT
    </div>
  </div>
</div>

                {/* Conteúdo */}
                <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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

                  <div className="border-t-2 border-gray-300 pt-4 mt-4">
                    <p className="text-sm text-gray-700 mb-3 font-medium">
                      Segue abaixo a relação dos documentos que estarão sendo enviados em anexo a este protocolo:
                    </p>
                   <div className="bg-gray-50 p-4 rounded border border-gray-300 grid grid-cols-2 gap-x-4">
  {documentos.filter(d => d.descricao).map((doc, index) => (
    <div key={doc.id} className="flex gap-3 text-sm mb-2">
                          <span className="font-bold" style={{color: '#00953b'}}>{index + 1}.</span>
                          <span className="font-medium">{doc.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded mt-4 flex items-center justify-center min-h-16">
  <p className="font-bold text-center text-base">
    DEVOLVER ESTE PROTOCOLO DEVIDAMENTE ASSINADO
  </p>
</div>

                  <div className="border-t-2 border-gray-300 pt-4 mt-4">
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

                  <div className="border-t-2 border-gray-300 pt-6 mt-6">
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

        {/* Instruções */}
        <div className="mt-6 rounded-lg p-4 text-sm no-print" style={{backgroundColor: '#e6f7ed', borderColor: '#00953b', borderWidth: '1px', color: '#00953b'}}>
          <p className="font-bold mb-2">💡 Como usar:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Preencha o <strong>nome do arquivo</strong></li>
            <li>Complete os dados de envio e destino</li>
            <li>Adicione os documentos</li>
            <li>Clique em <strong>"Salvar como PDF"</strong></li>
            <li>Na janela de impressão, escolha <strong>"Salvar como PDF"</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ProtocoloAmaraNzero;
