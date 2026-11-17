// Catálogo de material eléctrico de Obramat (precio de venta sin IVA, con el 10 % de margen).
// Los precios actualizados se guardan en las tarifas (almara-tarifas-v1, clave _obramat) y se sincronizan.
window.CATALOGO_OBRAMAT = [
 {id:"m_int",g:"Material eléctrico (Obramat)",c:"Interruptor / conmutador Schneider Asfora blanco",p:3.12,ref:"10515764"},
 {id:"m_dconm",g:"Material eléctrico (Obramat)",c:"Doble conmutador Schneider Asfora blanco",p:3.87,ref:"10515771"},
 {id:"m_cruz",g:"Material eléctrico (Obramat)",c:"Cruzamiento Schneider Asfora blanco",p:3.07},
 {id:"m_puls",g:"Material eléctrico (Obramat)",c:"Pulsador Schneider Asfora blanco",p:2.67},
 {id:"m_pulsl",g:"Material eléctrico (Obramat)",c:"Pulsador luminoso Schneider Asfora blanco",p:5.67},
 {id:"m_pers",g:"Material eléctrico (Obramat)",c:"Interruptor de persiana Schneider Asfora blanco",p:7.21,ref:"10767351"},
 {id:"m_ench",g:"Material eléctrico (Obramat)",c:"Enchufe schuko 16 A Schneider Asfora blanco",p:2.50},
 {id:"m_enchP",g:"Material eléctrico (Obramat)",c:"Enchufe schuko 16 A Schneider Asfora blanco (pack)",p:2.60,uds:5},
 {id:"m_est",g:"Material eléctrico (Obramat)",c:"Enchufe doble estanco IP54 para exterior",p:7.59},
 {id:"m_rj45",g:"Material eléctrico (Obramat)",c:"Toma de datos RJ45 Cat6 Schneider Asfora blanco",p:7.15},
 {id:"m_tv",g:"Material eléctrico (Obramat)",c:"Toma TV-R-SAT final Schneider Asfora blanco",p:10.76},
 {id:"m_tvi",g:"Material eléctrico (Obramat)",c:"Toma TV-SAT intermedia Schneider Asfora blanco",p:15.66},
 {id:"m_tel",g:"Material eléctrico (Obramat)",c:"Toma de teléfono RJ12 Schneider Asfora blanco",p:3.35},
 {id:"m_ciega",g:"Material eléctrico (Obramat)",c:"Tapa ciega Schneider Asfora blanco",p:2.02},
 {id:"m_m2",g:"Material eléctrico (Obramat)",c:"Marco doble Schneider Asfora blanco",p:0.74},
 {id:"m_m3",g:"Material eléctrico (Obramat)",c:"Marco triple Schneider Asfora blanco",p:1.45},
 {id:"m_m4",g:"Material eléctrico (Obramat)",c:"Marco cuádruple Schneider Asfora blanco",p:2.62},
 {id:"m_mg16",g:"Material eléctrico (Obramat)",c:"Magnetotérmico Schneider Resi9 1P+N 16 A",p:3.80},
 {id:"m_mg25",g:"Material eléctrico (Obramat)",c:"Magnetotérmico Schneider Resi9 1P+N 25 A",p:3.85},
 {id:"m_c15",g:"Material eléctrico (Obramat)",c:"Cable libre de halógenos H07Z1-K 1,5 mm2 (metros)",p:0.28},
 {id:"m_c25",g:"Material eléctrico (Obramat)",c:"Cable libre de halógenos H07Z1-K 2,5 mm2 (metros)",p:0.45},
 {id:"m_c4",g:"Material eléctrico (Obramat)",c:"Cable libre de halógenos H07Z1-K 4 mm2 (metros)",p:0.97},
 {id:"m_c6",g:"Material eléctrico (Obramat)",c:"Cable libre de halógenos H07Z1-K 6 mm2 (metros)",p:1.41},
 {id:"m_t16",g:"Material eléctrico (Obramat)",c:"Tubo corrugado 16 mm (metros)",p:0.16},
 {id:"m_t20",g:"Material eléctrico (Obramat)",c:"Tubo corrugado 20 mm (metros)",p:0.25},
 {id:"m_t25",g:"Material eléctrico (Obramat)",c:"Tubo corrugado reforzado 25 mm (metros)",p:0.35},
 {id:"m_caja",g:"Material eléctrico (Obramat)",c:"Caja de mecanismo universal para empotrar",p:0.14},
 {id:"m_cajap",g:"Material eléctrico (Obramat)",c:"Caja de mecanismo para tabique hueco (pladur)",p:0.55}
];
window.OBRAMAT_MARGEN = 1.10;
window.ventaObramat = (pvpIva, uds) => Math.round((pvpIva / (uds || 1)) / 1.21 * window.OBRAMAT_MARGEN * 100) / 100;
