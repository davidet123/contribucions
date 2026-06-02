// Transport technologies
export const TECNOLOGIES_TRANSPORT = [
  { value: 'ip_ftth', label: 'IP FTTH' },
  { value: 'ip_4g', label: 'IP 4G' },
  { value: 'starlink', label: 'Starlink' },
  { value: 'satellit', label: 'Satèl·lit (DSNG)' },
  { value: 'srt', label: 'SRT' },
  { value: 'sip', label: 'SIP/Telèfon' },
  { value: 'intercom', label: 'Intercom' },
  { value: 'tieline', label: 'Tieline' },
  { value: 'fibra', label: 'Fibra dedicada' },
]

// Equipment categories
export const CATEGORIES_EQUIP = [
  { value: 'nimbra', label: 'Nimbra (FC)', icon: 'mdi-server' },
  { value: 'makito_tx', label: 'Makito Tx', icon: 'mdi-video-wireless' },
  { value: 'makito_rx', label: 'Makito Rx', icon: 'mdi-video-wireless-outline' },
  { value: 'mochila_4g', label: 'Mochila 4G/Starlink', icon: 'mdi-backpack' },
  { value: 'dsng', label: 'DSNG / Satèl·lit', icon: 'mdi-satellite-uplink' },
  { value: 'streamhub', label: 'StreamHub', icon: 'mdi-hub' },
  { value: 'tieline', label: 'Tieline', icon: 'mdi-microphone' },
  { value: 'proveidor_extern', label: 'Proveïdor extern', icon: 'mdi-antenna' },
  { value: 'estudi_polivalent', label: 'Estudi Polivalent', icon: 'mdi-television-play' },
  { value: 'altre', label: 'Altre', icon: 'mdi-help-circle' },
]

// Signal types
export const TIPUS_SENYAL = [
  'PGM', 'CLEAN FEED', 'PGM BACKUP', 'POOL', 'POOL amb hashtag',
  'POOL sense hashtag', 'ISO DIRECTES INFORMATIUS', 'CONTINUÏTAT',
  'INTERCOM', 'N-1', 'IFB', 'ALTRE'
]

// Audio content types
export const CONTINGUTS_AUDIO = [
  'PGM L', 'PGM R', 'PGM mono', 'INTERNACIONAL L', 'INTERNACIONAL R',
  'INTERNACIONAL mono', 'REPORTER', 'INT. L', 'INT. R', 'N-1', '-', 'ALTRE'
]

// CCT destination types
export const TIPUS_DESTI_CCT = [
  { value: 'um', label: 'UM (Unitat de Mescla)' },
  { value: 'eng', label: 'ENG' },
  { value: 'avw', label: 'AVW (Aviwest)' },
  { value: 'rx', label: 'RX' },
  { value: 'prod', label: 'PROD' },
  { value: 'ingesta', label: 'INGESTA' },
  { value: 'continuitat', label: 'CONTINUÏTAT' },
  { value: 'estudi', label: 'ESTUDI' },
  { value: 'va6', label: 'VA6' },
  { value: 'makito_cct', label: 'Makito CCT' },
  { value: 'hero', label: 'HERO' },
  { value: 'url_externa', label: 'URL externa (SRT/HLS)' },
  { value: 'autre', label: 'Altre' },
]

// Communication resource types
export const TIPUS_RECURS_COM = [
  { value: 'intercom_cct', label: 'Intercom CCT' },
  { value: 'intercom_conti', label: 'Intercom CONTI' },
  { value: 'codec_ip', label: 'Codec IP' },
  { value: 'tieline_via', label: 'Tieline VIA' },
  { value: 'ifb', label: 'IFB' },
  { value: 'telf_sip', label: 'Telèfon SIP' },
  { value: 'telf_reporter', label: 'Telèfon Reporter' },
  { value: 'intercom_um', label: 'Intercom UM' },
]

// Communication locations
export const UBICACIONS_COM = [
  { value: 'cct', label: 'CCT' },
  { value: 'est2', label: 'Estudi 2' },
  { value: 'est3', label: 'Estudi 3' },
  { value: 'motxilles', label: 'Motxilles' },
  { value: 'conti', label: 'Continuïtat' },
  { value: 'um_camp', label: 'UM Camp' },
]

// Platforms
export const PLATAFORMES = ['TDT', 'WEB', 'TDT i WEB', 'YouTube', 'Altra']

// Default via template by equipment category
export const VIES_PER_DEFECTE = {
  nimbra: [
    { numero: 1, direccio: 'tx', etiqueta: 'PGM' },
    { numero: 2, direccio: 'tx', etiqueta: 'CLEAN FEED' },
    { numero: 3, direccio: 'rx', etiqueta: 'CONTINUÏTAT' },
  ],
  makito_tx: [
    { numero: 1, direccio: 'tx', etiqueta: 'PGM' },
    { numero: 2, direccio: 'tx', etiqueta: 'CLEAN FEED' },
    { numero: 3, direccio: 'tx', etiqueta: '-' },
  ],
  makito_rx: [
    { numero: 1, direccio: 'rx', etiqueta: 'PGM' },
    { numero: 2, direccio: 'rx', etiqueta: 'CLEAN FEED' },
    { numero: 3, direccio: 'rx', etiqueta: '-' },
  ],
  mochila_4g: [
    { numero: 1, direccio: 'tx', etiqueta: 'PGM BACKUP' },
  ],
  dsng: [
    { numero: 1, direccio: 'tx', etiqueta: 'PGM' },
  ],
  streamhub: [
    { numero: 1, direccio: 'rx', etiqueta: 'REPORTERS' },
  ],
  tieline: [
    { numero: 1, direccio: 'tx_rx', etiqueta: 'COORDINACIÓ' },
  ],
  proveidor_extern: [
    { numero: 1, direccio: 'tx', etiqueta: 'POOL PRINCIPAL' },
    { numero: 2, direccio: 'tx', etiqueta: 'POOL BACKUP' },
  ],
  estudi_polivalent: [
    { numero: 1, direccio: 'rx', etiqueta: 'EXT 1' },
    { numero: 2, direccio: 'rx', etiqueta: 'EXT 2' },
    { numero: 3, direccio: 'tx', etiqueta: 'PGM POL' },
    { numero: 4, direccio: 'tx', etiqueta: 'CLEAN POL' },
  ],
  altre: [
    { numero: 1, direccio: 'tx', etiqueta: '-' },
  ],
}
