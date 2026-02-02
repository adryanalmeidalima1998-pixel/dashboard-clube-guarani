// Mapeamento direto: Nome do Time (como aparece na planilha) -> Arquivo de logo
// Para adicionar um novo time, basta adicionar uma nova linha aqui

export const LOGOS = {
  // Guarani (sempre usar o escudo oficial)
  'Guarani FC': '/club/escudoguarani.png',
  'Guarani': '/club/escudoguarani.png',
  
  // Times do Paulistão e outras competições
  'Santos': '/club/logos/santos.png',
  'Palmeiras': '/club/logos/palmeiras.png',
  'Grêmio Novorizontino': '/club/logos/novorizontino.png',
  'Novorizontino': '/club/logos/novorizontino.png',
  'Mirassol': '/club/logos/mirassol.png',
  'Botafogo-SP': '/club/logos/botafogo-sp.png',
  'Botafogo SP': '/club/logos/botafogo-sp.png', // Variação sem hífen
  'EC Primavera': '/club/logos/primavera.png',
  'Primavera': '/club/logos/primavera.png', // Variação curta
  'São Bernardo': '/club/logos/são-bernardo.png',
  'São Bernardo FC': '/club/logos/são-bernardo.png',
  
  // Adicione mais times conforme necessário:
  // 'Nome do Time': '/club/logos/nome-do-arquivo.png',
}

// Logo padrão quando o time não está no mapeamento
export const DEFAULT_LOGO = 'https://www.sofascore.com/static/images/team-logo/football/default.png'

// Função para obter a logo de um time
export const getLogo = (nomeTime) => {
  if (!nomeTime) return DEFAULT_LOGO
  
  // Tenta encontrar o time no mapeamento (case-insensitive)
  const nomeNormalizado = nomeTime.trim()
  
  // Busca exata primeiro
  if (LOGOS[nomeNormalizado]) {
    return LOGOS[nomeNormalizado]
  }
  
  // Busca case-insensitive
  const chaveEncontrada = Object.keys(LOGOS).find(
    key => key.toLowerCase() === nomeNormalizado.toLowerCase()
  )
  
  if (chaveEncontrada) {
    return LOGOS[chaveEncontrada]
  }
  
  // Se não encontrar, retorna o padrão
  return DEFAULT_LOGO
}
