// Mapeamento direto: Nome do Time (como aparece na planilha) -> Arquivo de logo
export const LOGOS = {
  // Guarani
  'Guarani FC': '/club/escudoguarani.png',
  'Guarani': '/club/escudoguarani.png',
  
  // Adversários (Caminhos baseados na estrutura real do repositório)
  'Santos': '/club/logos/santos.png',
  'Palmeiras': '/club/logos/palmeiras.png',
  'Grêmio Novorizontino': '/club/logos/grêmio-novorizontino.png',
  'Novorizontino': '/club/logos/grêmio-novorizontino.png',
  'Ponte Preta': '/club/logos/ponte-preta.png',
  'Velo Clube': '/club/logos/velo-clube.png',
  'Portuguesa': '/club/logos/portuguesa.png',
  'Mirassol': '/club/logos/mirassol.png',
  'Botafogo-SP': '/club/logos/botafogo-sp.png',
  'Botafogo SP': '/club/logos/botafogo-sp.png',
  'EC Primavera': '/club/logos/primavera.png',
  'Primavera': '/club/logos/primavera.png',
  'São Bernardo': '/club/logos/são-bernardo.png',
  'São Bernardo FC': '/club/logos/são-bernardo.png',
}

export const DEFAULT_LOGO = 'https://www.sofascore.com/static/images/team-logo/football/default.png'

export const getLogo = (nomeTime) => {
  if (!nomeTime) return DEFAULT_LOGO
  
  const nomeNormalizado = String(nomeTime).trim()
  
  // Busca exata
  if (LOGOS[nomeNormalizado]) return LOGOS[nomeNormalizado]
  
  // Busca case-insensitive e parcial
  const chaveEncontrada = Object.keys(LOGOS).find(key => 
    key.toLowerCase() === nomeNormalizado.toLowerCase() ||
    nomeNormalizado.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(nomeNormalizado.toLowerCase())
  )
  
  return chaveEncontrada ? LOGOS[chaveEncontrada] : DEFAULT_LOGO
}
