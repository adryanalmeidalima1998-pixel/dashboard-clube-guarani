'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLogo, DEFAULT_LOGO } from '../logos'

// Mapeamento de logos dos campeonatos
const LOGOS_CAMPEONATOS = {
  'PAULISTA': '/competitions/paulista/logo.png',
  'PAULISTÃO': '/competitions/paulista/logo.png',
  'SÉRIE C': '/competitions/serie-b/logo.png',
  'BRASILEIRÃO SÉRIE C': '/competitions/serie-b/logo.png',
  'COPA DO BRASIL': '/competitions/copa-do-brasil/logo.png',
}

const getLogoCampeonato = (campeonato) => {
  if (!campeonato) return null
  const nomeComp = String(campeonato).toUpperCase()
  const chave = Object.keys(LOGOS_CAMPEONATOS).find(key => nomeComp.includes(key))
  return chave ? LOGOS_CAMPEONATOS[chave] : null
}

export default function AgendaPage() {
  const router = useRouter()
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [jogoSelecionado, setJogoSelecionado] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQfZDnuuVuLX87xTQyBEQM4E2Uqd2sH7r5HRqgUBKicRjoy7CXINhkMkPZpBam3a66vxkkN8TbVZb7f/pub?output=csv"
        const response = await fetch(url)
        const csvText = await response.text()
        
        const parseCSV = (text) => {
          const rows = [];
          let currentRow = [];
          let currentField = '';
          let inQuotes = false;

          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"' && inQuotes && nextChar === '"') {
              currentField += '"';
              i++;
            } else if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              currentRow.push(currentField.trim());
              currentField = '';
            } else if ((char === '\r' || char === '\n') && !inQuotes) {
              if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
              }
              if (char === '\r' && nextChar === '\n') i++;
            } else {
              currentField += char;
            }
          }
          if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            rows.push(currentRow);
          }
          return rows;
        };

        const rows = parseCSV(csvText);
        if (rows.length === 0) return;

        const headers = rows[0].map(h => h.trim());
        const dataRows = rows.slice(1);

        const parsedJogos = dataRows.map((row, index) => {
          const data = {};
          headers.forEach((header, i) => {
            data[header] = row[i] || "";
          });

          // Lidar com o espaço no cabeçalho 'Mandante '
          const mandante = data['Mandante'] || data['Mandante '] || "";
          const visitante = data['Visitante'] || "";
          
          return {
            id: index,
            data: data['Data'],
            hora: data['Horário'],
            mandante: mandante,
            visitante: visitante,
            golsMandanteNum: data['Gols Mandante'] || '0',
            golsVisitanteNum: data['Gols Visitante'] || '0',
            status: (data['Gols Mandante'] !== "" && data['Gols Mandante'] !== undefined) ? 'passado' : 'proximo',
            campeonato: data['Competição'],
            local: data['Estádio'] || "",
            escalaçaoIframe: data['código escalação'] || null,
            logoMandante: getLogo(mandante),
            logoVisitante: getLogo(visitante),
            logoCampeonato: getLogoCampeonato(data['Competição'])
          };
        });

        setJogos(parsedJogos);
      } catch (error) {
        console.error("Erro ao carregar agenda:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const renderIframe = (iframeString) => {
    if (!iframeString || iframeString.trim() === "") return null;
    const iframeMatch = iframeString.match(/<iframe.*<\/iframe>/i);
    let finalIframe = iframeMatch ? iframeMatch[0] : iframeString;
    finalIframe = finalIframe.replace(/style="[^"]*"/i, 'style="width:100%; height:600px; border:none;"');
    if (!finalIframe.includes('style=')) {
      finalIframe = finalIframe.replace('<iframe', '<iframe style="width:100%; height:600px; border:none;"');
    }
    return <div className="bg-white rounded-xl overflow-hidden min-h-[600px]" dangerouslySetInnerHTML={{ __html: finalIframe }} />;
  }

  const handleImageError = (e) => {
    e.target.src = DEFAULT_LOGO;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#062016] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Carregando Agenda...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#062016] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#062016]/80 backdrop-blur-xl border-b border-emerald-900/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')} 
              className="p-2.5 bg-[#0a2d1f]/50 hover:bg-emerald-800/50 rounded-xl transition-all duration-300 text-slate-400 hover:text-white hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Agenda de Jogos
              </h1>
              <p className="text-xs text-slate-500">{jogos.length} partidas registradas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid gap-4">
          {jogos.map((jogo) => (
            <div 
              key={jogo.id}
              onClick={() => setJogoSelecionado(jogo)}
              className="group relative bg-[#0a2d1f]/40 rounded-2xl border border-emerald-900/50 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative p-5">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Data e Hora */}
                  <div className="flex-shrink-0 text-center min-w-[80px]">
                    <div className="bg-[#062016]/60 rounded-xl px-3 py-2 border border-emerald-900/30">
                      <span className="block text-emerald-400 font-bold text-sm">{jogo.data}</span>
                      <span className="text-slate-500 text-xs">{jogo.hora || 'A definir'}</span>
                    </div>
                  </div>

                  {/* Confronto Principal */}
                  <div className="flex-1 flex items-center justify-center gap-3 md:gap-6">
                    {/* Time Mandante */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-semibold text-sm md:text-base text-right text-white/90 hidden sm:block">
                        {jogo.mandante}
                      </span>
                      <div className="relative">
                        <img 
                          src={jogo.logoMandante} 
                          alt={jogo.mandante} 
                          className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-lg" 
                          onError={handleImageError} 
                        />
                      </div>
                    </div>

                    {/* Placar / VS */}
                    <div className="flex-shrink-0">
                      {jogo.status === 'passado' ? (
                        <div className="flex items-center gap-2 bg-[#062016]/80 rounded-xl px-4 py-2 border border-emerald-900/30">
                          <span className="text-xl md:text-2xl font-black text-white">{jogo.golsMandanteNum}</span>
                          <span className="text-slate-500 text-sm">-</span>
                          <span className="text-xl md:text-2xl font-black text-white">{jogo.golsVisitanteNum}</span>
                        </div>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2">
                          <span className="text-emerald-400 font-bold text-sm">VS</span>
                        </div>
                      )}
                    </div>

                    {/* Time Visitante */}
                    <div className="flex items-center gap-3 flex-1 justify-start">
                      <div className="relative">
                        <img 
                          src={jogo.logoVisitante} 
                          alt={jogo.visitante} 
                          className="w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-lg" 
                          onError={handleImageError} 
                        />
                      </div>
                      <span className="font-semibold text-sm md:text-base text-left text-white/90 hidden sm:block">
                        {jogo.visitante}
                      </span>
                    </div>
                  </div>

                  {/* Info Campeonato */}
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <div className="text-right hidden md:block">
                      <span className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                        {jogo.campeonato}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {jogo.local}
                      </span>
                    </div>
                    {jogo.logoCampeonato && (
                      <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-lg border border-emerald-900/20">
                        <img src={jogo.logoCampeonato} alt={jogo.campeonato} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="p-1 text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes (Escalação) */}
      {jogoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0a2d1f] w-full max-w-4xl rounded-3xl border border-emerald-900/50 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between bg-[#062016]/50">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img src={jogoSelecionado.logoMandante} className="w-10 h-10 object-contain z-10" onError={handleImageError} />
                  <img src={jogoSelecionado.logoVisitante} className="w-10 h-10 object-contain" onError={handleImageError} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{jogoSelecionado.mandante} vs {jogoSelecionado.visitante}</h3>
                  <p className="text-xs text-slate-400">{jogoSelecionado.data} • {jogoSelecionado.campeonato}</p>
                </div>
              </div>
              <button 
                onClick={() => setJogoSelecionado(null)}
                className="p-2 hover:bg-emerald-800/50 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto bg-[#062016]">
              {jogoSelecionado.escalaçaoIframe ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-bold uppercase text-xs tracking-widest">Escalações e Estatísticas</span>
                  </div>
                  {renderIframe(jogoSelecionado.escalaçaoIframe)}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-900/30">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Informações Indisponíveis</h4>
                  <p className="text-slate-400 max-w-xs mx-auto">As escalações e estatísticas detalhadas para esta partida ainda não foram processadas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
