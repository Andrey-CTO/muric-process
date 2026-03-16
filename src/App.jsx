import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, CheckCircle, AlertTriangle, ChevronRight, ChevronLeft, 
  Server, Activity, Download, Clock, RefreshCw, Lock, ArrowRight, ShieldCheck,
  CheckCircle2, Terminal, FileJson, Database, FileSpreadsheet, FileSignature, 
  Scissors, Key, CheckSquare, Zap, FileText, FileArchive, Search, Calendar,
  RotateCcw, Filter, PieChart, Users, ListFilter, Shield, Layers, Eye, X, Link
} from 'lucide-react';

const App = () => {
  // Generación de data mock adicional para el histórico (> 15 registros)
  const lotesIniciales = [
    { id: 'C-202603', period: '2026-03', label: 'Marzo 2026', source: 'db', sourceLabel: 'Generación TÓTAL SÚPERVISION®', records: 2510000, estadoDatos: 'Aprobada', fechaAprobacion: '15/03/2026 08:30 AM', estadoAvro: 'Pendiente', estadoTransmision: 'Pendiente', fechaTransmision: '-', canal: '-', archivos: [], respuesta: '-' },
    { id: 'C-202602', period: '2026-02', label: 'Febrero 2026', source: 'db', sourceLabel: 'Generación TÓTAL SÚPERVISION®', records: 2504120, estadoDatos: 'Aprobada', fechaAprobacion: '12/02/2026 09:15 AM', estadoAvro: 'Generado', estadoTransmision: 'Transmitido', fechaTransmision: '14/02/2026 11:20 AM', canal: 'REST API', archivos: [{nombre: 'muric_part1.avro.pgp', peso: '100 MB'}, {nombre: 'muric_part2.avro.pgp', peso: '100 MB'}, {nombre: 'muric_part3.avro.pgp', peso: '50 MB'}], respuesta: '200 OK - Lote Aceptado' },
    { id: 'C-202602-B', period: '2026-02', label: 'Febrero 2026 (Corrección)', source: 'db', sourceLabel: 'Generación TÓTAL SÚPERVISION®', records: 150000, estadoDatos: 'Aprobada', fechaAprobacion: '28/02/2026 10:00 AM', estadoAvro: 'Pendiente', estadoTransmision: 'Pendiente', fechaTransmision: '-', canal: '-', archivos: [], respuesta: '-' },
    { id: 'C-202601', period: '2026-01', label: 'Enero 2026', source: 'excel', sourceLabel: 'Carga Manual', records: 2498500, estadoDatos: 'En Revisión', fechaAprobacion: '-', estadoAvro: 'Pendiente', estadoTransmision: 'Pendiente', fechaTransmision: '-', canal: '-', archivos: [], respuesta: '-' },
    { id: 'C-202512', period: '2025-12', label: 'Diciembre 2025', source: 'db', sourceLabel: 'Generación TÓTAL SÚPERVISION®', records: 2501000, estadoDatos: 'Aprobada', fechaAprobacion: '10/01/2026 14:05 PM', estadoAvro: 'Generado', estadoTransmision: 'Transmitido', fechaTransmision: '12/01/2026 16:45 PM', canal: 'SFTP Contingencia', archivos: [{nombre: 'muric_202512.avro.pgp', peso: '245 MB'}], respuesta: 'SFTP - Depositado Exitosamente' }
  ];

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const lotesHistoricos = Array.from({length: 12}).map((_, i) => {
    const monthIndex = 10 - i; 
    const year = monthIndex < 0 ? 2024 : 2025;
    const trueMonth = monthIndex < 0 ? 12 + monthIndex : monthIndex + 1;
    const period = `${year}-${trueMonth.toString().padStart(2, '0')}`;
    return {
      id: `C-${year}${trueMonth.toString().padStart(2, '0')}`,
      period,
      label: `${meses[trueMonth-1]} ${year}`,
      source: 'db',
      sourceLabel: 'Generación TÓTAL SÚPERVISION®',
      records: 2450000 + Math.floor(Math.random() * 50000),
      estadoDatos: 'Aprobada',
      fechaAprobacion: `10/${trueMonth.toString().padStart(2, '0')}/${year} 08:00 AM`,
      estadoAvro: 'Generado',
      estadoTransmision: 'Transmitido',
      fechaTransmision: `12/${trueMonth.toString().padStart(2, '0')}/${year} 10:30 AM`,
      canal: i % 4 === 0 ? 'SFTP Contingencia' : 'REST API',
      archivos: i % 4 === 0 
        ? [{nombre: `muric_${year}${trueMonth.toString().padStart(2, '0')}.avro.pgp`, peso: '245 MB'}] 
        : [{nombre: 'muric_part1.avro.pgp', peso: '100 MB'}, {nombre: 'muric_part2.avro.pgp', peso: '100 MB'}, {nombre: 'muric_part3.avro.pgp', peso: '45 MB'}],
      respuesta: i % 4 === 0 ? 'SFTP - Depositado Exitosamente' : '200 OK - Lote Aceptado'
    };
  });

  const [lotes, setLotes] = useState([...lotesIniciales, ...lotesHistoricos]);

  // Estado general del flujo
  const [step, setStep] = useState(0); 
  
  // Dashboard / Histórico
  const [histFilterPeriod, setHistFilterPeriod] = useState(''); 
  const [histFilterStatus, setHistFilterStatus] = useState('Todos');
  const [histCurrentPage, setHistCurrentPage] = useState(1);

  // 1. Esquema 
  const [schemaMode, setSchemaMode] = useState('select'); 
  const [selectedSchemaVersion, setSelectedSchemaVersion] = useState('v1.3');
  const [schemaValid, setSchemaValid] = useState(true);
  
  // 2. Selección de Corte y Otras Fuentes
  const [sourceTab, setSourceTab] = useState('cortes'); // 'cortes' | 'nuevas'
  const [newSourceType, setNewSourceType] = useState(null); // 'csv' | 'db'
  const [newSourceFile, setNewSourceFile] = useState(false);
  const [dbConfig] = useState({ host: '192.168.1.100', user: 'admin_muric', db: 'PRD_CARTERA_EXT' });

  const [dataSource, setDataSource] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [filterPeriod, setFilterPeriod] = useState('2026-02'); 
  const [filterStatus, setFilterStatus] = useState('Pendiente'); 
  const [selectedCorte, setSelectedCorte] = useState(null);
  const [extractCurrentPage, setExtractCurrentPage] = useState(1); 
  
  // 3. Revisión
  const [reviewTab, setReviewTab] = useState('resumen');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailFilter, setDetailFilter] = useState('');

  // Modales y Detalles Analíticos
  const [evidenceModalItem, setEvidenceModalItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [modalReviewTab, setModalReviewTab] = useState('resumen');
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalDetailFilter, setModalDetailFilter] = useState('');

  // 4. Canal de Transmisión
  const [channel, setChannel] = useState(null);

  // 5. Preparación
  const [preparing, setPreparing] = useState(false);
  const [isAvroGenerated, setIsAvroGenerated] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isPartitioned, setIsPartitioned] = useState(false);

  // 6. Transmisión
  const [transmitting, setTransmitting] = useState(false);
  const [transmitProgress, setTransmitProgress] = useState(0);
  const [transmitETA, setTransmitETA] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const FILE_SIZE_MB = 250; 
  const USUARIO_ACTUAL = "analista_regulatorio_01";
  
  // Datos simulados para pestañas de Detalle
  const [mockRecords] = useState(() => Array.from({ length: 150 }).map((_, i) => ({
    idInterno: i + 1,
    idObligacion: `OBL-${(i+1).toString().padStart(7, '0')}`,
    tipo: (i+1) % 3 !== 0 ? 'Comercial' : 'Consumo',
    saldo: 15000000 + (((i+1) * 250000) % 300000000),
    calificacion: (i+1) % 4 !== 0 ? 'A' : 'B'
  })));

  const filteredDetails = mockRecords.filter(r => 
    r.idObligacion.toLowerCase().includes(detailFilter.toLowerCase()) ||
    r.idInterno.toString().includes(detailFilter)
  );
  const TOTAL_RECORDS = selectedCorte ? selectedCorte.records : 2504120;
  const VIRTUAL_TOTAL_RECORDS = detailFilter ? filteredDetails.length : TOTAL_RECORDS;
  const TOTAL_PAGES = detailFilter ? Math.ceil(filteredDetails.length / 10) || 1 : Math.ceil(TOTAL_RECORDS / 10);
  const currentDetails = detailFilter ? filteredDetails.slice((currentPage - 1) * 10, currentPage * 10) : mockRecords.slice(0, 10).map((r, i) => ({
    ...r, idInterno: (currentPage - 1) * 10 + i + 1, idObligacion: `OBL-${((currentPage - 1) * 10 + i + 1).toString().padStart(7, '0')}`
  }));

  // Paginación para el Modal Analítico
  const modalFilteredDetails = mockRecords.filter(r => 
    r.idObligacion.toLowerCase().includes(modalDetailFilter.toLowerCase()) ||
    r.idInterno.toString().includes(modalDetailFilter)
  );
  const MODAL_TOTAL_RECORDS = detailModalItem ? detailModalItem.records : 0;
  const MODAL_VIRTUAL_TOTAL = modalDetailFilter ? modalFilteredDetails.length : MODAL_TOTAL_RECORDS;
  const MODAL_TOTAL_PAGES = modalDetailFilter ? Math.ceil(modalFilteredDetails.length / 10) || 1 : Math.ceil(MODAL_TOTAL_RECORDS / 10);
  const modalCurrentDetails = modalDetailFilter ? modalFilteredDetails.slice((modalCurrentPage - 1) * 10, modalCurrentPage * 10) : mockRecords.slice(0, 10).map((r, i) => ({
    ...r, idInterno: (modalCurrentPage - 1) * 10 + i + 1, idObligacion: `OBL-${((modalCurrentPage - 1) * 10 + i + 1).toString().padStart(7, '0')}`
  }));

  const steps = [
    "Esquema", "Cortes Aprobados", "Revisión", "Canal", "Preparación", "Transmisión", "Resultado"
  ];

  const handleRestart = () => {
    setStep(0);
    setSchemaMode('select');
    setSelectedSchemaVersion('v1.3');
    setSchemaValid(true);
    
    // Reset Fuentes
    setSourceTab('cortes');
    setNewSourceType(null);
    setNewSourceFile(false);
    
    setDataSource(null);
    setSelectedCorte(null);
    setExtracting(false);
    setExtractProgress(0);
    setExtractCurrentPage(1); 
    setReviewTab('resumen');
    setCurrentPage(1);
    setDetailFilter('');
    setFilterStatus('Todos');
    setFilterPeriod('');
    setHistFilterPeriod('');
    setHistFilterStatus('Todos');
    setHistCurrentPage(1);
    setChannel(null);
    setPreparing(false);
    setIsAvroGenerated(false);
    setIsSigned(false);
    setIsPartitioned(false);
    setTransmitting(false);
    setTransmitProgress(0);
    setTransmitETA(0);
    setDownloaded(false);
  };

  const handleSchemaSelection = (version) => {
    setSelectedSchemaVersion(version);
    setSchemaValid(false);
    if (version) setTimeout(() => setSchemaValid(true), 600);
  };

  const handleUploadSchema = () => {
    setSelectedSchemaVersion('new');
    setTimeout(() => setSchemaValid(true), 1200); 
  };

  const handleExtract = () => {
    if (sourceTab === 'nuevas') {
      const isCsv = newSourceType === 'csv';
      const fakeCorte = {
        id: `EXT-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        period: '2026-04',
        label: isCsv ? 'Importación Externa (CSV)' : 'Extracción DB Externa',
        source: isCsv ? 'excel' : 'db',
        sourceLabel: isCsv ? 'Carga Manual CSV' : 'Conexión Directa DB',
        records: Math.floor(Math.random() * 500000) + 150000,
        estadoDatos: 'Aprobada',
        fechaAprobacion: new Date().toLocaleString(),
        estadoAvro: 'Pendiente',
        estadoTransmision: 'Pendiente',
        fechaTransmision: '-',
        canal: '-',
        archivos: [],
        respuesta: '-'
      };
      setSelectedCorte(fakeCorte);
      setDataSource(fakeCorte.source);
      setLotes(prev => [fakeCorte, ...prev]);
    }

    setExtracting(true);
    setExtractProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setExtractProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setExtracting(false);
      }
    }, 120);
  };

  const handlePreparePackage = () => {
    setPreparing(true);
    setTimeout(() => {
      setIsAvroGenerated(true);
      setTimeout(() => {
        setIsSigned(true);
        setTimeout(() => {
          setIsPartitioned(true);
          setPreparing(false);
        }, 1200); 
      }, 1200);
    }, 1500);
  };

  const handleTransmit = () => {
    setTransmitting(true);
    setTransmitProgress(0);
    let p = 0;
    let timeRemaining = channel === 'REST' ? 8 : 12; 
    setTransmitETA(timeRemaining);

    const interval = setInterval(() => {
      p += (100 / timeRemaining); 
      timeRemaining -= 1;
      
      if (p >= 100 || timeRemaining <= 0) {
        p = 100;
        clearInterval(interval);
        
        const fechaActual = new Date().toLocaleString();
        
        const updatedItem = {
          ...selectedCorte,
          estadoAvro: 'Generado',
          estadoTransmision: 'Transmitido',
          fechaTransmision: fechaActual,
          canal: channel === 'REST' ? 'REST API' : 'SFTP Contingencia',
          respuesta: channel === 'REST' ? '200 OK - Lote Aceptado' : 'SFTP - Depositado Exitosamente',
          archivos: channel === 'REST' 
            ? [{nombre: 'muric_part1.avro.pgp', peso: '100 MB'}, {nombre: 'muric_part2.avro.pgp', peso: '100 MB'}, {nombre: 'muric_part3.avro.pgp', peso: '50 MB'}]
            : [{nombre: `muric_${selectedCorte.period.replace('-','')}.avro.pgp`, peso: `${FILE_SIZE_MB} MB`}]
        };

        setSelectedCorte(updatedItem);
        setLotes(prev => prev.map(l => l.id === selectedCorte.id ? updatedItem : l));

        setTimeout(() => {
          setTransmitting(false);
          setStep(7); 
        }, 800);
      }
      setTransmitProgress(Math.min(p, 100));
      setTransmitETA(Math.max(timeRemaining, 0));
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDownloadPDF = async (itemData) => {
    const item = itemData || selectedCorte;
    if (!item) return;

    setDownloaded('loading');
    try {
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      const primaryColor = [15, 23, 42]; 
      const emeraldColor = [16, 185, 129];
      const blueColor = [37, 99, 235];
      
      // Cargar Logo Oficial TÓTAL REPORT con manejo robusto CORS
      const logoUrl = 'https://totalreport.com.co/wp-content/uploads/2024/11/totalreport1300.png';
      let logoDataUrl = null;
      
      try {
        const response = await fetch(logoUrl, { mode: 'cors' });
        const blob = await response.blob();
        logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("CORS evitó cargar la imagen en Base64. Se omitirá en el PDF para evitar solapamientos.");
      }

      // --- CONSTRUCCIÓN DEL PDF ---
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 42, 'F');
      
      if (logoDataUrl) {
         doc.addImage(logoDataUrl, 'PNG', 12, 12, 45, 12);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Evidencia de Transmisión Ecosistema TÓTAL REPORT®", 200, 20, null, null, "right");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Módulo de Reporte MURIC - Superintendencia Financiera", 200, 28, null, null, "right");
      
      // Badge Estado Exitoso
      doc.setFillColor(...emeraldColor);
      doc.roundedRect(165, 48, 30, 7, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(item.estadoTransmision.toUpperCase(), 180, 53, null, null, "center");

      doc.setTextColor(...blueColor);
      doc.setFontSize(12);
      doc.text("1. Información del Lote y Aprobación", 15, 58);
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 63, 180, 38, 2, 2, 'FD');
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("ID de Proceso:", 20, 71);
      doc.setFont("helvetica", "normal");
      doc.text(`TX-MUR-${item.id.replace('C-', '').replace('EXT-','')}-26`, 60, 71);
      
      doc.setFont("helvetica", "bold");
      doc.text("Período de Corte:", 115, 71);
      doc.setFont("helvetica", "normal");
      doc.text(item.label, 150, 71);

      doc.setFont("helvetica", "bold");
      doc.text("Gen. de Datos:", 20, 79);
      doc.setFont("helvetica", "normal");
      doc.text(item.fechaAprobacion, 60, 79);

      doc.setFont("helvetica", "bold");
      doc.text("Estado Datos:", 115, 79);
      doc.setFont("helvetica", "normal");
      doc.text(item.estadoDatos, 150, 79);

      doc.setFont("helvetica", "bold");
      doc.text("Total Registros:", 20, 87);
      doc.setFont("helvetica", "normal");
      doc.text(item.records.toLocaleString(), 60, 87);

      doc.setFont("helvetica", "bold");
      doc.text("Usuario Creador:", 115, 87);
      doc.setFont("helvetica", "normal");
      doc.text(USUARIO_ACTUAL, 150, 87);

      doc.setFont("helvetica", "bold");
      doc.text("Esquema Base:", 20, 95);
      doc.setFont("helvetica", "normal");
      doc.text(`MURIC_CARTERA_${selectedSchemaVersion}.avsc`, 60, 95);

      doc.setTextColor(...blueColor);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("2. Trazabilidad de Transmisión", 15, 111);
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 115, 180, 38, 2, 2, 'FD');
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Fecha Transmisión:", 20, 123);
      doc.setFont("helvetica", "normal");
      doc.text(item.fechaTransmision, 60, 123);

      doc.setFont("helvetica", "bold");
      doc.text("Estado Trans.:", 115, 123);
      doc.setFont("helvetica", "normal");
      doc.text(item.estadoTransmision, 150, 123);
      
      doc.setFont("helvetica", "bold");
      doc.text("Canal Destino:", 20, 131);
      doc.setFont("helvetica", "normal");
      doc.text(item.canal, 60, 131);
      
      doc.setFont("helvetica", "bold");
      doc.text("Respuesta Ente:", 20, 139);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(22, 163, 74); 
      doc.text(item.respuesta, 60, 139);
      doc.setTextColor(50, 50, 50);

      doc.setFont("helvetica", "bold");
      doc.text("Firma Validada:", 20, 147);
      doc.setFont("helvetica", "normal");
      doc.text("CERT_OFICIAL_CUMP_2026", 60, 147);

      doc.setTextColor(...blueColor);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("3. Detalle de Archivos Transmitidos", 15, 163);

      doc.setFillColor(...primaryColor);
      doc.rect(15, 167, 180, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("Nombre del Archivo", 20, 171.5);
      doc.text("Peso Estimado", 150, 171.5);

      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      let startY = 178;
      
      if (item.archivos && item.archivos.length > 0) {
        item.archivos.forEach((file, idx) => {
          doc.text(`[${idx+1}] ${file.nombre}`, 20, startY);
          doc.text(file.peso, 150, startY);
          doc.setDrawColor(220, 220, 220);
          doc.line(15, startY + 2, 195, startY + 2);
          startY += 7;
        });
      } else {
        doc.text("Información de particiones no disponible.", 20, startY);
        startY += 7;
      }

      // SELLO CRIPTOGRÁFICO
      const selloY = Math.max(193, startY + 5);

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(15, selloY, 180, 85, 2, 2, 'FD');

      doc.setFillColor(...primaryColor);
      doc.roundedRect(15, selloY, 180, 9, 2, 2, 'F');
      doc.rect(15, selloY + 4, 180, 5, 'F'); 

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("SELLO CRIPTOGRÁFICO AVANZADO - INTEGRIDAD Y NO REPUDIO", 105, selloY + 6, null, null, "center");

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      let sy = selloY + 16;

      doc.setFont("helvetica", "bold");
      doc.text("Hash del Documento (SHA-256):", 20, sy);
      sy += 4;
      doc.setFont("courier", "normal");
      doc.text("C9F2A1F4B13E5A7C7D4E8F6D1A8A9F43B7D0E5C4A2F6A3B9D7E1C2F3A4B5D6E7", 20, sy);

      sy += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Hash del Archivo Transmitido (SHA-256):", 20, sy);
      sy += 4;
      doc.setFont("courier", "normal");
      doc.text("A7F5F35426B927411FC9231B56382173B0BEB8F9D1FCEBB6F3EAD7B32A67F8A4", 20, sy);

      sy += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Firma Digital Institucional:", 20, sy);
      sy += 4;
      doc.setFont("helvetica", "normal");
      doc.text("Algoritmo: RSA-SHA256   |   Certificado: Certicámara   |   Serial: 3F4A8C9B1123", 20, sy);

      sy += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Marca de Tiempo (TSA - UTC):", 20, sy);
      doc.text("ID de Transmisión:", 100, sy);

      sy += 4;
      doc.setFont("courier", "normal");
      const currentIso = new Date().toISOString();
      doc.text(currentIso.replace(/\.\d{3}Z$/, 'Z'), 20, sy);
      doc.text(`MURIC-${item.period.replace('-', '')}-000184`, 100, sy);

      sy += 8;
      doc.setFont("helvetica", "bold");
      doc.text("Canal de Transmisión:", 20, sy);
      doc.text("Estado de Verificación:", 100, sy);

      sy += 4;
      doc.setFont("helvetica", "normal");
      doc.text(item.canal, 20, sy);
      doc.setTextColor(22, 163, 74);
      doc.setFont("helvetica", "bold");
      doc.text("✔ Integridad y Origen Verificados", 100, sy);

      doc.save(`Evidencia_MURIC_${item.period}.pdf`);
      
      setDownloaded('success');
      setTimeout(() => setDownloaded(false), 2500);
    } catch (e) {
      console.error("Error al generar PDF:", e);
      setDownloaded(false);
      alert("Hubo un error al generar el PDF de evidencia.");
    }
  };

  const renderStatusCell = (c) => (
    <td className="px-6 py-4">
      {c.estadoTransmision === 'Transmitido' ? (
        <button 
          onClick={() => setEvidenceModalItem(c)}
          className="flex flex-col text-left group hover:-translate-y-0.5 transition-transform"
        >
          <span className="text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-bold group-hover:bg-blue-100 flex items-center shadow-sm">
            <CheckCircle2 size={12} className="mr-1"/> {c.estadoTransmision}
            <Eye size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"/>
          </span>
          <span className="text-[10px] text-slate-400 mt-1">{c.fechaTransmision}</span>
        </button>
      ) : (
        <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs font-bold w-max flex items-center shadow-sm">
          <Clock size={12} className="mr-1"/> {c.estadoTransmision}
        </span>
      )}
    </td>
  );

  // --- RENDERIZADO DE PANTALLAS ---

  const renderDashboardHistorico = () => {
    const filteredLotes = lotes.filter(c => {
      const matchPeriod = histFilterPeriod === '' || c.period === histFilterPeriod;
      const matchStatus = histFilterStatus === 'Todos' || c.estadoTransmision === histFilterStatus;
      return matchPeriod && matchStatus;
    });

    const ITEMS_PER_PAGE = 7;
    const totalHistPages = Math.ceil(filteredLotes.length / ITEMS_PER_PAGE) || 1;
    const currentHistLotes = filteredLotes.slice((histCurrentPage - 1) * ITEMS_PER_PAGE, histCurrentPage * ITEMS_PER_PAGE);

    return (
      <div className="stage-transition space-y-6">
        <div className="bg-gradient-to-r from-[#0b1120] to-blue-900 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 transform transition-all hover:shadow-2xl">
          <div>
            <img src="https://totalreport.com.co/wp-content/uploads/2024/11/totalreport1300.png" alt="TÓTAL REPORT Logo" className="h-12 mb-3 object-contain" />
            <p className="text-blue-200">Gestión y Transmisión de Reporte MURIC a la Superintendencia Financiera.</p>
          </div>
          <button 
            onClick={() => setStep(1)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all flex items-center shrink-0"
          >
            <Zap size={18} className="mr-2" /> Nueva Transmisión
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-700">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Calendar size={20} className="mr-2 text-slate-400"/> Histórico de Cortes y Transmisiones
            </h3>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1.5 px-3 shadow-sm hover:border-blue-300 transition-colors">
                 <Filter size={14} className="text-slate-400" />
                 <input type="month" value={histFilterPeriod} onChange={(e) => {setHistFilterPeriod(e.target.value); setHistCurrentPage(1);}} className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer" />
               </div>
               <div className="bg-white border border-slate-200 rounded-lg p-1.5 px-3 shadow-sm hover:border-blue-300 transition-colors">
                 <select value={histFilterStatus} onChange={(e) => {setHistFilterStatus(e.target.value); setHistCurrentPage(1);}} className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer">
                   <option value="Todos">Todos los Estados</option>
                   <option value="Transmitido">Transmitidos</option>
                   <option value="Pendiente">Pendientes</option>
                 </select>
               </div>
               {(histFilterPeriod || histFilterStatus !== 'Todos') && (
                 <button onClick={() => {setHistFilterPeriod(''); setHistFilterStatus('Todos'); setHistCurrentPage(1);}} className="text-xs text-blue-600 font-bold hover:text-blue-800 whitespace-nowrap transition-colors">Limpiar</button>
               )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 text-xs uppercase border-b border-slate-200">
                 <tr>
                   <th className="px-6 py-4 font-bold">Lote / ID</th>
                   <th className="px-6 py-4 font-bold">Período</th>
                   <th className="px-6 py-4 font-bold">Estado Datos</th>
                   <th className="px-6 py-4 font-bold">Estado Transmisión</th>
                   <th className="px-6 py-4 font-bold text-right">Acciones</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {currentHistLotes.length > 0 ? currentHistLotes.map((c, idx) => (
                    <tr key={c.id} className="alternating-row hover:bg-slate-50/80 transition-colors fill-mode-both" style={{ animationDelay: `${idx * 80}ms` }}>
                       <td className="px-6 py-4 font-mono text-slate-800 font-medium">{c.id}</td>
                       <td className="px-6 py-4 font-bold text-slate-700">{c.label}</td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`${c.estadoDatos === 'Aprobada' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'} px-2 py-1 rounded text-xs font-bold w-max shadow-sm`}>{c.estadoDatos}</span>
                            <span className="text-[10px] text-slate-400 mt-1">{c.fechaAprobacion}</span>
                          </div>
                       </td>
                       {renderStatusCell(c)}
                       <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => {setDetailModalItem(c); setModalReviewTab('resumen'); setModalCurrentPage(1); setModalDetailFilter('');}} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:-translate-y-0.5 transition-all inline-flex items-center shadow-sm">
                            <Eye size={14} className="mr-1"/> Detalle
                          </button>
                          {c.estadoTransmision === 'Transmitido' && (
                            <button onClick={() => setEvidenceModalItem(c)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:-translate-y-0.5 transition-all inline-flex items-center border border-blue-100 shadow-sm">
                              <FileText size={14} className="mr-1"/> Evidencia
                            </button>
                          )}
                       </td>
                    </tr>
                 )) : (
                   <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No hay registros que coincidan con los filtros.</td></tr>
                 )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Mostrando {currentHistLotes.length} de {filteredLotes.length}</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setHistCurrentPage(p => Math.max(1, p - 1))} disabled={histCurrentPage === 1} className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-100 hover:shadow-sm disabled:opacity-50 disabled:shadow-none text-xs font-bold transition-all">Anterior</button>
              <span className="text-xs font-bold text-slate-700 mx-2">Pág {histCurrentPage} de {totalHistPages}</span>
              <button onClick={() => setHistCurrentPage(p => Math.min(totalHistPages, p + 1))} disabled={histCurrentPage === totalHistPages} className="px-2 py-1 border border-slate-300 rounded bg-white text-blue-600 hover:bg-blue-50 hover:shadow-sm text-xs font-bold disabled:opacity-50 disabled:shadow-none transition-all">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderScreenConfig = () => (
    <div className="stage-transition space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">1. Configuración del Esquema</h3>
          <p className="text-sm text-slate-500">Defina la estructura técnica base para validar el reporte.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 shadow-inner">
          <button onClick={() => { setSchemaMode('select'); setSchemaValid(true); setSelectedSchemaVersion('v1.3'); }} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${schemaMode === 'select' ? 'bg-white shadow-sm text-blue-700 scale-100' : 'text-slate-500 hover:text-slate-700 scale-95'}`}>Esquemas Previos</button>
          <button onClick={() => { setSchemaMode('upload'); setSchemaValid(false); setSelectedSchemaVersion(''); }} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${schemaMode === 'upload' ? 'bg-white shadow-sm text-blue-700 scale-100' : 'text-slate-500 hover:text-slate-700 scale-95'}`}>Cargar Nuevo</button>
        </div>
      </div>

      {schemaMode === 'select' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <label className="block text-sm font-bold text-slate-700 mb-2">Seleccione la versión del esquema AVRO:</label>
          <select className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-medium transition-all hover:bg-white" value={selectedSchemaVersion} onChange={(e) => handleSchemaSelection(e.target.value)}>
            <option value="">-- Despliegue para seleccionar --</option>
            <option value="v1.3">MURIC_CARTERA v1.3 (Vigente, Recomendado)</option>
            <option value="v1.2">MURIC_CARTERA v1.2 (Obsoleto)</option>
          </select>
          {selectedSchemaVersion === 'v1.2' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm flex items-start shadow-inner animate-in zoom-in-95 duration-300">
              <AlertTriangle size={20} className="mr-3 shrink-0 text-amber-500" />
              <p className="font-medium">Está seleccionando una versión de esquema obsoleta. La Superintendencia Financiera podría rechazar la transmisión.</p>
            </div>
          )}
        </div>
      )}

      {schemaMode === 'upload' && !selectedSchemaVersion && (
        <div onClick={handleUploadSchema} className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 p-12 text-center hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer group">
          <UploadCloud size={56} className="mx-auto text-blue-300 group-hover:text-blue-500 group-hover:scale-110 group-hover:-translate-y-1 mb-4 transition-all duration-300" />
          <p className="text-slate-800 font-bold text-lg">Arrastre aquí el nuevo esquema AVRO (.avsc)</p>
          <p className="text-sm text-slate-500 mt-2">El sistema validará la estructura automáticamente</p>
        </div>
      )}

      {selectedSchemaVersion && schemaValid && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm flex items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mr-4 shadow-inner"><CheckCircle2 size={24} /></div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-emerald-900">Esquema válido y compatible</h4>
            <p className="text-sm text-emerald-700 mt-0.5">Versión: <span className="font-bold">{selectedSchemaVersion === 'new' ? '1.4' : selectedSchemaVersion}</span> • Formato: Apache Avro</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderScreenOriginExtraction = () => {
    const filteredCortes = lotes.filter(c => {
      const matchPeriod = filterPeriod === '' || c.period === filterPeriod;
      const matchStatus = filterStatus === 'Todos' || c.estadoTransmision === filterStatus;
      return matchPeriod && matchStatus;
    });

    const ITEMS_PER_PAGE_EXTRACT = 5;
    const totalExtractPages = Math.ceil(filteredCortes.length / ITEMS_PER_PAGE_EXTRACT) || 1;
    const currentExtractLotes = filteredCortes.slice((extractCurrentPage - 1) * ITEMS_PER_PAGE_EXTRACT, extractCurrentPage * ITEMS_PER_PAGE_EXTRACT);

    return (
    <div className="stage-transition space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">2. Selección de Corte y otras fuentes</h3>
        <p className="text-sm text-slate-500">Seleccione un corte de información aprobado o importe datos desde otras fuentes para el armado AVRO.</p>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 shadow-inner w-max mb-2">
        <button onClick={() => setSourceTab('cortes')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${sourceTab === 'cortes' ? 'bg-white shadow-sm text-blue-700 scale-100' : 'text-slate-500 hover:text-slate-700 scale-95'}`}>Cortes Aprobados</button>
        <button onClick={() => setSourceTab('nuevas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${sourceTab === 'nuevas' ? 'bg-white shadow-sm text-blue-700 scale-100' : 'text-slate-500 hover:text-slate-700 scale-95'}`}>Otras Fuentes (CSV / BD)</button>
      </div>

      {!extracting && extractProgress === 0 ? (
        <div className="animate-in fade-in mt-4">
          
          {/* TAB 1: CORTES EXISTENTES */}
          {sourceTab === 'cortes' && (
            <>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 hover:shadow-md transition-shadow">
                 <div className="flex items-center text-slate-500 pl-2"><Filter size={18} /></div>
                 <div className="flex-1 w-full sm:w-auto">
                   <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Período de Corte (Mes/Año)</label>
                   <input type="month" value={filterPeriod} onChange={(e) => {setFilterPeriod(e.target.value); setExtractCurrentPage(1);}} className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors" />
                 </div>
                 <div className="w-full h-px sm:w-px sm:h-8 bg-slate-200"></div>
                 <div className="flex-1 w-full sm:w-auto">
                   <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Estado de Transmisión</label>
                   <select value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setExtractCurrentPage(1);}} className="w-full text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                     <option value="Todos">Todos</option>
                     <option value="Pendiente">Pendientes</option>
                     <option value="Transmitido">Transmitidos</option>
                   </select>
                 </div>
                 {(filterPeriod || filterStatus !== 'Todos') && (
                   <button onClick={() => {setFilterPeriod(''); setFilterStatus('Todos'); setExtractCurrentPage(1);}} className="text-xs text-blue-600 font-bold hover:text-blue-800 px-3 border-l border-slate-200 whitespace-nowrap mt-3 sm:mt-0 transition-colors">Limpiar Filtros</button>
                 )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                     <tr>
                       <th className="px-6 py-4 font-bold">Lote / ID</th>
                       <th className="px-6 py-4 font-bold">Origen</th>
                       <th className="px-6 py-4 font-bold">Estado Datos</th>
                       <th className="px-6 py-4 font-bold">Estado Transmisión</th>
                       <th className="px-6 py-4 font-bold text-right">Acción</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {currentExtractLotes.length > 0 ? currentExtractLotes.map((c, idx) => (
                        <tr key={c.id} className={`alternating-row transition-colors fill-mode-both ${selectedCorte?.id === c.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`} style={{ animationDelay: `${idx * 80}ms` }}>
                           <td className="px-6 py-4">
                             <div className="font-mono text-slate-800 font-bold">{c.id}</div>
                             <div className="text-[10px] text-slate-500 uppercase">{c.label}</div>
                           </td>
                           <td className="px-6 py-4 text-slate-600">
                             <div className="flex items-center text-xs">
                               {c.source === 'db' ? <Database size={12} className="mr-1 text-emerald-500"/> : <FileSpreadsheet size={12} className="mr-1 text-indigo-500"/>}
                               {c.sourceLabel}
                             </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`${c.estadoDatos === 'Aprobada' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'} px-2 py-1 rounded text-xs font-bold block w-max shadow-sm`}>{c.estadoDatos}</span>
                              <span className="text-[9px] text-slate-400">{c.fechaAprobacion}</span>
                           </td>
                           {renderStatusCell(c)}
                           <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => { 
                                  if (selectedCorte?.id === c.id) {
                                    setSelectedCorte(null); 
                                    setDataSource(null);
                                  } else {
                                    setSelectedCorte(c); 
                                    setDataSource(c.source);
                                  }
                                }} 
                                disabled={c.estadoTransmision === 'Transmitido'}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 ${selectedCorte?.id === c.id ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg'}`}>
                                {selectedCorte?.id === c.id ? 'Quitar Selección' : 'Seleccionar'}
                              </button>
                           </td>
                        </tr>
                     )) : (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No se encontraron cortes que coincidan con los filtros.</td></tr>
                     )}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-xl">
                <span className="text-xs text-slate-500 font-medium">Mostrando {currentExtractLotes.length} de {filteredCortes.length}</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setExtractCurrentPage(p => Math.max(1, p - 1))} disabled={extractCurrentPage === 1} className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50 text-xs font-bold transition-all">Anterior</button>
                  <span className="text-xs font-bold text-slate-700 mx-2">Pág {extractCurrentPage} de {totalExtractPages}</span>
                  <button onClick={() => setExtractCurrentPage(p => Math.min(totalExtractPages, p + 1))} disabled={extractCurrentPage === totalExtractPages} className="px-2 py-1 border border-slate-300 rounded bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold disabled:opacity-50 transition-all">Siguiente</button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: OTRAS FUENTES (CSV/DB) */}
          {sourceTab === 'nuevas' && (
            <div className="animate-in fade-in space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div onClick={() => {setNewSourceType('csv'); setNewSourceFile(false);}} className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${newSourceType === 'csv' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-4 ring-indigo-50' : 'border-slate-200 bg-white'}`}>
                   {newSourceType === 'csv' && <div className="absolute top-4 right-4 text-indigo-500 animate-in zoom-in duration-300"><CheckCircle size={24} /></div>}
                   <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm"><FileSpreadsheet size={24} /></div>
                   <h4 className="text-lg font-bold text-slate-800 mb-2">Importar Archivo CSV / Excel</h4>
                   <p className="text-sm text-slate-600">Cargue un archivo estructurado con la información requerida para el reporte.</p>
                </div>
                <div onClick={() => setNewSourceType('db')} className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${newSourceType === 'db' ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-4 ring-emerald-50' : 'border-slate-200 bg-white'}`}>
                   {newSourceType === 'db' && <div className="absolute top-4 right-4 text-emerald-500 animate-in zoom-in duration-300"><CheckCircle size={24} /></div>}
                   <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm"><Database size={24} /></div>
                   <h4 className="text-lg font-bold text-slate-800 mb-2">Conexión a Base de Datos</h4>
                   <p className="text-sm text-slate-600">Establezca una conexión externa directa para extraer la información.</p>
                </div>
              </div>

              {newSourceType === 'csv' && (
                 <div className="mt-6 animate-in slide-in-from-bottom-2">
                   {!newSourceFile ? (
                     <div onClick={() => setNewSourceFile(true)} className="border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50/50 p-10 text-center hover:bg-indigo-50 hover:border-indigo-400 transition-colors cursor-pointer group">
                        <UploadCloud size={48} className="mx-auto text-indigo-400 group-hover:text-indigo-600 group-hover:scale-110 group-hover:-translate-y-1 mb-4 transition-all duration-300" />
                        <p className="text-slate-800 font-bold text-lg">Arrastre aquí su archivo (.csv, .xlsx)</p>
                        <p className="text-sm text-slate-500 mt-2">El sistema validará las columnas en base al esquema seleccionado</p>
                     </div>
                   ) : (
                     <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 flex items-center shadow-sm">
                        <div className="bg-white p-2 rounded-lg border border-indigo-100 mr-4 shadow-sm"><FileSpreadsheet className="text-indigo-600" size={32}/></div>
                        <div className="flex-1">
                          <h4 className="font-bold text-indigo-900">datos_cartera_muric_externo.csv</h4>
                          <p className="text-xs text-indigo-700 mt-1">Archivo de datos cargado exitosamente. Listo para validación.</p>
                        </div>
                        <CheckCircle2 size={28} className="text-emerald-500"/>
                     </div>
                   )}
                 </div>
              )}

              {newSourceType === 'db' && (
                 <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-in slide-in-from-bottom-2">
                   <h4 className="font-bold text-slate-800 mb-4 flex items-center"><Link size={18} className="mr-2 text-slate-400"/> Parámetros de Conexión Externa</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Servidor / Host</label>
                        <input type="text" value={dbConfig.host} readOnly className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base de Datos</label>
                        <input type="text" value={dbConfig.db} readOnly className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label>
                        <input type="text" value={dbConfig.user} readOnly className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-600 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                        <input type="password" value="********" readOnly className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-600 outline-none" />
                      </div>
                   </div>
                   <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center">
                     <CheckCircle2 size={16} className="text-emerald-600 mr-2"/>
                     <span className="text-xs font-bold text-emerald-800">Conexión establecida correctamente con el origen de datos.</span>
                   </div>
                 </div>
              )}
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-md text-center transform scale-100 animate-in zoom-in-95 duration-500">
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <svg className="w-full h-full text-slate-200" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={extractProgress === 100 ? '#10b981' : '#3b82f6'} strokeWidth="3" strokeDasharray={`${extractProgress}, 100`} className="transition-all duration-300 ease-linear" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-700">{extractProgress}%</span>
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-800">
              {extractProgress < 100 ? (dataSource === 'db' ? 'Extrayendo y consolidando datos...' : 'Procesando importación de archivo...') : 'Extracción y Consolidación completada'}
            </h4>
          </div>

          {extractProgress === 100 && (
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 zoom-in-95 duration-500 shadow-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-emerald-800 font-bold">Registros consolidados listos para revisión:</span>
                <span className="font-black text-emerald-700 bg-white px-3 py-1 rounded shadow-sm border border-emerald-100">{TOTAL_RECORDS.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botones de Acción de Extracción Generales */}
      {!extracting && extractProgress === 0 && (
        <div className="flex justify-center mt-6 animate-in slide-in-from-bottom-2 fade-in">
          
          {sourceTab === 'cortes' && selectedCorte && (
            selectedCorte.estadoDatos === 'Aprobada' ? (
              <button onClick={handleExtract} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center">
                <Database size={18} className="mr-2 text-emerald-400" />
                Iniciar Extracción de Datos
              </button>
            ) : (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 px-6 py-4 rounded-xl flex items-center shadow-sm">
                 <AlertTriangle size={24} className="mr-3 shrink-0"/> 
                 <div className="text-sm">
                   <p className="font-bold mb-0.5">Extracción Restringida</p>
                   <p>Solo se permite extraer y continuar si el estado de los datos es <strong>Aprobada</strong>.</p>
                 </div>
              </div>
            )
          )}

          {sourceTab === 'nuevas' && newSourceType === 'csv' && newSourceFile && (
             <button onClick={handleExtract} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center">
                <FileSpreadsheet size={18} className="mr-2 text-white" />
                Procesar e Importar Archivo
              </button>
          )}

          {sourceTab === 'nuevas' && newSourceType === 'db' && (
             <button onClick={handleExtract} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center">
                <Database size={18} className="mr-2 text-white" />
                Extraer desde Base de Datos Externa
              </button>
          )}
        </div>
      )}
    </div>
    );
  };

  const renderScreenReview = () => (
    <div className="stage-transition space-y-6">
      <div className="flex justify-between items-start border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">3. Revisión Analítica de Datos</h3>
          <p className="text-sm text-slate-500">Analice la información consolidada antes de definir el canal y serializar a AVRO.</p>
        </div>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center shadow-sm">
          <CheckSquare size={14} className="mr-1.5" /> Auditoría Previa
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex bg-slate-50 border-b border-slate-200 px-2 overflow-x-auto">
           <button onClick={()=>{setReviewTab('resumen'); setCurrentPage(1); setDetailFilter('');}} className={`px-4 py-3 text-sm font-bold flex items-center whitespace-nowrap transition-colors ${reviewTab==='resumen'?'border-b-2 border-blue-600 text-blue-700':'text-slate-500 hover:text-slate-700'}`}>
             <PieChart size={16} className="mr-2"/> Resumen por Cartera
           </button>
           <button onClick={()=>{setReviewTab('top5'); setCurrentPage(1); setDetailFilter('');}} className={`px-4 py-3 text-sm font-bold flex items-center whitespace-nowrap transition-colors ${reviewTab==='top5'?'border-b-2 border-blue-600 text-blue-700':'text-slate-500 hover:text-slate-700'}`}>
             <Users size={16} className="mr-2"/> Top 5 Mayor Riesgo
           </button>
           <button onClick={()=>setReviewTab('detalle')} className={`px-4 py-3 text-sm font-bold flex items-center whitespace-nowrap transition-colors ${reviewTab==='detalle'?'border-b-2 border-blue-600 text-blue-700':'text-slate-500 hover:text-slate-700'}`}>
             <ListFilter size={16} className="mr-2"/> Detalle (Paginado)
           </button>
        </div>

        <div className="p-0">
          {reviewTab === 'resumen' && (
            <div className="animate-in fade-in overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-white text-slate-500 text-xs uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Tipo de Crédito</th>
                    <th className="px-6 py-4 font-bold text-right">Cantidad de Oblig.</th>
                    <th className="px-6 py-4 font-bold text-right">% del Total</th>
                    <th className="px-6 py-4 font-bold text-right">Saldo de Capital Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-700">Comercial</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-600">{Math.floor(TOTAL_RECORDS * 0.18).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">18%</span></td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">$ 45.2 Billones</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-700">Consumo</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-600">{Math.floor(TOTAL_RECORDS * 0.60).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">60%</span></td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">$ 22.1 Billones</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-700">Hipotecario</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-600">{Math.floor(TOTAL_RECORDS * 0.14).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">14%</span></td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">$ 38.5 Billones</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-700">Microcrédito</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-600">{Math.floor(TOTAL_RECORDS * 0.08).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">8%</span></td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-800">$ 1.2 Billones</td>
                  </tr>
                  <tr className="bg-slate-100/50 border-t-2 border-slate-200">
                    <td className="px-6 py-4 font-black text-slate-800 uppercase text-xs">Total Datos Consolidados</td>
                    <td className="px-6 py-4 text-right font-black text-slate-800">{TOTAL_RECORDS.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right"><span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">100%</span></td>
                    <td className="px-6 py-4 text-right font-mono font-black text-blue-700">$ 107.0 Billones</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {reviewTab === 'top5' && (
            <div className="animate-in fade-in overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-white text-slate-500 text-xs uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold">Rank</th>
                    <th className="px-6 py-4 font-bold">ID Cliente / NIT</th>
                    <th className="px-6 py-4 font-bold">ID Obligación</th>
                    <th className="px-6 py-4 font-bold text-right">Saldo Capital</th>
                    <th className="px-6 py-4 font-bold text-center">Calif.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  <tr className="hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 font-bold">1</td>
                    <td className="px-6 py-3 text-slate-800">NIT 890900608</td>
                    <td className="px-6 py-3 font-mono text-slate-600">OBL-C-001</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-red-600">$ 150,000,000,000</td>
                    <td className="px-6 py-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">A</span></td>
                  </tr>
                  <tr className="hover:bg-red-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 font-bold">2</td>
                    <td className="px-6 py-3 text-slate-800">NIT 860001022</td>
                    <td className="px-6 py-3 font-mono text-slate-600">OBL-C-452</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-red-600">$ 120,500,000,000</td>
                    <td className="px-6 py-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">A</span></td>
                  </tr>
                  <tr className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 font-bold">3</td>
                    <td className="px-6 py-3 text-slate-800">NIT 900504312</td>
                    <td className="px-6 py-3 font-mono text-slate-600">OBL-C-891</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-amber-600">$ 85,000,000,000</td>
                    <td className="px-6 py-3 text-center"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">B</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 font-bold">4</td>
                    <td className="px-6 py-3 text-slate-800">CC 79450321</td>
                    <td className="px-6 py-3 font-mono text-slate-600">OBL-H-102</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">$ 15,200,000,000</td>
                    <td className="px-6 py-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">A</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-400 font-bold">5</td>
                    <td className="px-6 py-3 text-slate-800">NIT 800123456</td>
                    <td className="px-6 py-3 font-mono text-slate-600">OBL-C-222</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">$ 12,000,000,000</td>
                    <td className="px-6 py-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">A</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {reviewTab === 'detalle' && (
            <div className="animate-in fade-in">
               <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
                 <div className="flex items-center space-x-2 w-full sm:w-auto">
                   <div className="relative w-full sm:w-64">
                     <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Buscar por ID Obligación o Interno..." 
                       value={detailFilter}
                       onChange={(e) => {setDetailFilter(e.target.value); setCurrentPage(1);}}
                       className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-shadow hover:shadow-sm"
                     />
                   </div>
                 </div>
                 
                 <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                   <span className="text-slate-600 font-medium">
                     {VIRTUAL_TOTAL_RECORDS > 0 ? (
                       <>Mostrando <strong>{((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, VIRTUAL_TOTAL_RECORDS)}</strong> de <strong>{VIRTUAL_TOTAL_RECORDS.toLocaleString()}</strong></>
                     ) : '0 resultados'}
                   </span>
                   <div className="flex items-center space-x-2">
                     <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm">Anterior</button>
                     <span className="font-bold text-slate-700">Pág {currentPage.toLocaleString()} de {TOTAL_PAGES.toLocaleString()}</span>
                     <button onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))} disabled={currentPage === TOTAL_PAGES || TOTAL_PAGES === 0} className="px-2 py-1 border border-slate-300 rounded bg-white text-blue-600 hover:bg-blue-50 font-medium disabled:opacity-50 transition-colors shadow-sm">Siguiente</button>
                   </div>
                 </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-white text-slate-500 text-[10px] uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-2 font-bold"># ID_Interno</th>
                      <th className="px-6 py-2 font-bold">ID_Obligación</th>
                      <th className="px-6 py-2 font-bold">Tipo_Credito</th>
                      <th className="px-6 py-2 font-bold text-right">Saldo_Capital</th>
                      <th className="px-6 py-2 font-bold text-center">Calificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-mono">
                    {currentDetails.length > 0 ? currentDetails.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${i * 30}ms` }}>
                          <td className="px-6 py-2 text-slate-400">{r.idInterno}</td>
                          <td className="px-6 py-2 text-slate-800 font-bold text-blue-700 bg-blue-50 px-2 rounded inline-block mt-1">{r.idObligacion}</td>
                          <td className="px-6 py-2 text-slate-600">{r.tipo}</td>
                          <td className="px-6 py-2 text-right text-slate-800">$ {r.saldo.toLocaleString()}</td>
                          <td className="px-6 py-2 text-center">
                             <span className={`${r.calificacion === 'A' ? 'text-emerald-600' : 'text-amber-600'} font-bold`}>{r.calificacion}</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-sans text-sm">No hay registros que coincidan con la búsqueda.</td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScreenChannel = () => (
    <div className="stage-transition space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">4. Selección de Canal</h3>
        <p className="text-sm text-slate-500">Seleccione la vía de comunicación regulatoria. Esto determinará el empaquetado del archivo AVRO.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div onClick={() => setChannel('REST')} className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${channel === 'REST' ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-50' : 'border-slate-200 bg-white'}`}>
          {channel === 'REST' && <div className="absolute top-4 right-4 text-blue-500 animate-in zoom-in duration-300"><CheckCircle size={24} /></div>}
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm"><Activity size={24} /></div>
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block shadow-sm">Canal Principal</span>
          <h4 className="text-lg font-bold text-slate-800 mb-2">API REST (En Línea)</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center"><CheckCircle2 size={16} className="text-emerald-500 mr-2 shrink-0"/> Particionamiento en bloques de 100 MB</li>
            <li className="flex items-center"><CheckCircle2 size={16} className="text-emerald-500 mr-2 shrink-0"/> Confirmación inmediata de recepción</li>
          </ul>
        </div>

        <div onClick={() => setChannel('SFTP')} className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${channel === 'SFTP' ? 'border-amber-500 bg-amber-50/50 shadow-md ring-4 ring-amber-50' : 'border-slate-200 bg-white'}`}>
          {channel === 'SFTP' && <div className="absolute top-4 right-4 text-amber-500 animate-in zoom-in duration-300"><CheckCircle size={24} /></div>}
          <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm"><Server size={24} /></div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded border border-amber-200 uppercase tracking-wider mb-2 inline-block">Contingencia</span>
          <h4 className="text-lg font-bold text-slate-800 mb-2">Servidor SFTP Regulador</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center"><AlertTriangle size={16} className="text-amber-500 mr-2 shrink-0"/> Solo por indisponibilidad de API</li>
            <li className="flex items-center"><Shield size={16} className="text-slate-500 mr-2 shrink-0"/> Envío como archivo único AVRO consolidado</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderScreenSignAndPrepare = () => (
    <div className="stage-transition space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">5. Generación AVRO, Firma y Preparación</h3>
        <p className="text-sm text-slate-500">
          Aplique su certificado digital. El sistema serializará los datos a AVRO y adaptará el paquete según el canal: {channel === 'REST' ? 'Particionamiento API' : 'Archivo Único SFTP'}.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4"><Key size={24} /></div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">Autenticación de Empaquetado</h4>
            <p className="text-sm text-slate-600 mb-6">Seleccione su certificado corporativo para validar y firmar el reporte estructurado.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Certificado PGP</label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 font-medium transition-all hover:bg-white focus:ring-2 focus:ring-blue-500 outline-none" disabled={isSigned || preparing}>
                  <option>CERT_REPRE_LEGAL_2026</option>
                  <option>CERT_OFICIAL_CUMP_2026</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PIN / Token</label>
                <input type="password" value="********" readOnly className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50" />
              </div>
            </div>
          </div>
          <button onClick={handlePreparePackage} disabled={isSigned || preparing} className={`mt-6 w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center transition-all duration-300 ${isSigned ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'} disabled:opacity-70 disabled:hover:translate-y-0`}>
            {preparing ? <><RefreshCw size={16} className="mr-2 animate-spin"/> Procesando Línea de Ensamblaje...</> : 
             isSigned ? <><CheckCircle2 size={16} className="mr-2 animate-in zoom-in"/> Lote Preparado y Firmado</> : 
             <><Layers size={16} className="mr-2"/> Generar AVRO, Firmar y Preparar</>}
          </button>
        </div>

        <div className="lg:col-span-3 bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
            <h4 className="text-base font-bold text-slate-800 flex items-center">
              <Layers size={20} className="mr-2 text-slate-500" /> Línea de Ensamblaje Automática
            </h4>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-start">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-colors duration-500 ${isAvroGenerated ? 'bg-emerald-500' : preparing ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}>
                 {isAvroGenerated ? <CheckCircle2 size={14} className="animate-in zoom-in"/> : '1'}
              </div>
              <div className="ml-4">
                <h5 className={`text-sm font-bold transition-colors duration-500 ${isAvroGenerated ? 'text-emerald-800' : preparing ? 'text-blue-800' : 'text-slate-500'}`}>Serialización AVRO</h5>
                <p className="text-xs text-slate-500">Convirtiendo datos extraídos al esquema {selectedSchemaVersion}.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-colors duration-500 ${isSigned ? 'bg-emerald-500' : (preparing && isAvroGenerated && !isSigned) ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}>
                 {isSigned ? <CheckCircle2 size={14} className="animate-in zoom-in"/> : '2'}
              </div>
              <div className="ml-4">
                <h5 className={`text-sm font-bold transition-colors duration-500 ${isSigned ? 'text-emerald-800' : (preparing && isAvroGenerated && !isSigned) ? 'text-blue-800' : 'text-slate-500'}`}>Firma Digital PGP</h5>
                <p className="text-xs text-slate-500">Aplicando hash de seguridad al bloque serializado.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-colors duration-500 ${isPartitioned ? 'bg-emerald-500' : (preparing && isSigned && !isPartitioned) ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}>
                 {isPartitioned ? <CheckCircle2 size={14} className="animate-in zoom-in"/> : '3'}
              </div>
              <div className="ml-4 flex-1">
                <h5 className={`text-sm font-bold transition-colors duration-500 ${isPartitioned ? 'text-emerald-800' : (preparing && isSigned && !isPartitioned) ? 'text-blue-800' : 'text-slate-500'}`}>
                  {channel === 'REST' ? 'Particionamiento API (Max 100MB)' : 'Empaquetado SFTP Consolidado'}
                </h5>
                
                {isPartitioned && channel === 'REST' && (
                  <div className="mt-3 space-y-2">
                    <div className="bg-white border border-slate-200 p-2 rounded flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{animationDelay: '100ms'}}>
                      <span className="text-xs font-bold text-slate-800 font-mono">muric_part1.avro.pgp</span><span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded">100 MB</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{animationDelay: '200ms'}}>
                      <span className="text-xs font-bold text-slate-800 font-mono">muric_part2.avro.pgp</span><span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded">100 MB</span>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{animationDelay: '300ms'}}>
                      <span className="text-xs font-bold text-slate-800 font-mono">muric_part3.avro.pgp</span><span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded">50 MB</span>
                    </div>
                  </div>
                )}

                {isPartitioned && channel === 'SFTP' && (
                  <div className="mt-3 bg-white border border-amber-200 p-3 rounded flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center">
                      <FileArchive size={20} className="text-amber-500 mr-2" />
                      <span className="text-xs font-bold text-amber-900 font-mono">muric_{selectedCorte.period.replace('-','')}.avro.pgp</span>
                    </div>
                    <span className="text-xs font-black text-amber-800 block">{FILE_SIZE_MB} MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScreenTransmission = () => (
    <div className="stage-transition space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-800">6. Transmisión a Superintendencia</h3>
        <p className="text-sm text-slate-500">Monitoree el despacho de información mediante {channel}.</p>
      </div>

      {!transmitting && transmitProgress === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
           <Activity size={48} className={`mx-auto mb-4 ${channel === 'REST' ? 'text-blue-500' : 'text-amber-500'} animate-bounce`} style={{animationDuration: '2s'}} />
           <h3 className="text-xl font-bold text-slate-800 mb-2">Preparado para Transmisión</h3>
           <p className="text-sm text-slate-500 mb-6">El paquete está generado en AVRO, firmado y listo para ser despachado.</p>
           
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 inline-block text-left mb-6 shadow-inner">
              <div className="flex items-center justify-between text-sm mb-2 w-64">
                <span className="text-slate-500 font-bold">Destino:</span>
                <span className="font-mono text-slate-800">{channel === 'REST' ? 'api.superfinanciera.gov' : 'sftp.superfinanciera.gov'}</span>
              </div>
              <div className="flex items-center justify-between text-sm w-64">
                <span className="text-slate-500 font-bold">Carga Total:</span>
                <span className="font-bold text-slate-800">{FILE_SIZE_MB} MB {channel === 'REST' ? '(3 Partes)' : '(1 Archivo)'}</span>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-lg max-w-2xl mx-auto mt-4 transition-all">
          <div className="text-center mb-8">
            <Activity size={40} className={`mx-auto mb-4 ${channel === 'REST' ? 'text-blue-500' : 'text-amber-500'} animate-pulse`} />
            <h3 className="text-2xl font-bold text-slate-800">Transmitiendo Lote MURIC</h3>
            <p className="text-sm text-slate-500 mt-1">Conectado a nodo seguro: {channel === 'REST' ? 'api.superfinanciera.gov' : 'sftp.superfinanciera.gov'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end text-sm">
              <span className="font-bold text-slate-700">Progreso Global ({FILE_SIZE_MB} MB)</span>
              <span className="text-2xl font-black text-slate-800">{Math.floor(transmitProgress)}%</span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden border border-slate-200 p-0.5 shadow-inner">
              <div className={`h-full rounded-full flex items-center justify-end pr-2 text-[10px] text-white font-bold transition-all duration-300 ease-linear
                  ${channel === 'REST' 
                    ? 'bg-[repeating-linear-gradient(45deg,#3b82f6,#3b82f6_10px,#2563eb_10px,#2563eb_20px)] bg-[length:28px_28px] animate-[progress_1s_linear_infinite]' 
                    : 'bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#d97706_10px,#d97706_20px)] bg-[length:28px_28px] animate-[progress_1s_linear_infinite]'}`}
                style={{ width: `${Math.max(5, transmitProgress)}%` }}>
              </div>
            </div>
            <style jsx="true">{`@keyframes progress { 0% { background-position: 0 0; } 100% { background-position: 28px 0; } }`}</style>

            <div className="flex justify-between text-xs font-medium text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg shadow-sm">
              <div className="flex flex-col"><span className="text-slate-400 uppercase text-[10px] mb-0.5">Velocidad</span><span className="text-slate-800 font-mono">~ 22.4 MB/s</span></div>
              <div className="flex flex-col text-right"><span className="text-slate-400 uppercase text-[10px] mb-0.5">Tiempo Estimado (ETA)</span><span className="text-slate-800 font-mono font-bold">{formatTime(transmitETA)} min</span></div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Logs de Transferencia</p>
              <div className="space-y-1 text-xs font-mono">
                {channel === 'REST' ? (
                  <>
                    <div className={`flex justify-between transition-colors duration-300 ${transmitProgress > 33 ? 'text-emerald-600' : 'text-slate-500'}`}><span>[1/3] muric_part1.avro.pgp</span><span>{transmitProgress > 33 ? 'Enviado OK' : 'Transfiriendo...'}</span></div>
                    <div className={`flex justify-between transition-colors duration-300 ${transmitProgress > 66 ? 'text-emerald-600' : transmitProgress > 33 ? 'text-blue-600' : 'text-slate-400'}`}><span>[2/3] muric_part2.avro.pgp</span><span>{transmitProgress > 66 ? 'Enviado OK' : transmitProgress > 33 ? 'Transfiriendo...' : 'En cola'}</span></div>
                    <div className={`flex justify-between transition-colors duration-300 ${transmitProgress === 100 ? 'text-emerald-600' : transmitProgress > 66 ? 'text-blue-600' : 'text-slate-400'}`}><span>[3/3] muric_part3.avro.pgp</span><span>{transmitProgress === 100 ? 'Enviado OK' : transmitProgress > 66 ? 'Transfiriendo...' : 'En cola'}</span></div>
                  </>
                ) : (
                  <div className={`flex justify-between transition-colors duration-300 ${transmitProgress === 100 ? 'text-emerald-600' : 'text-amber-600'}`}><span>[1/1] muric_${selectedCorte.period.replace('-','')}.avro.pgp</span><span>{transmitProgress === 100 ? 'Depósito SFTP OK' : 'Subiendo (Streaming)...'}</span></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderScreenStatus = () => (
    <div className="stage-transition space-y-6">
      <div className="bg-emerald-600 rounded-2xl p-8 text-white shadow-lg text-center relative overflow-hidden transform hover:scale-[1.01] transition-transform">
        <div className="absolute -right-10 -top-10 opacity-10"><CheckCircle size={200}/></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"><CheckCircle size={40} strokeWidth={3} className="animate-in zoom-in duration-500 delay-200" /></div>
          <h3 className="text-3xl font-black mb-2 tracking-tight">Transmisión Exitosa</h3>
          <p className="text-emerald-100 text-lg">El lote ({FILE_SIZE_MB} MB vía {channel}) ha sido procesado y depositado en la autoridad regulatoria.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center"><Terminal size={18} className="mr-2 text-slate-400"/> Trazabilidad del Lote</h4>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-1">ID de Proceso General</span>
              <span className="font-mono text-lg font-bold text-slate-800">TX-MUR-{selectedCorte.id.replace('C-','').replace('EXT-','')}-26</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase mb-2">IDs de Recepción ({channel})</span>
              <div className="space-y-2 text-sm font-mono bg-slate-800 text-emerald-400 p-4 rounded-lg shadow-inner">
                {channel === 'REST' ? (
                  <>
                    <div className="flex justify-between"><span>part1.avro.pgp</span> <span>RCV-2026-A101</span></div>
                    <div className="flex justify-between"><span>part2.avro.pgp</span> <span>RCV-2026-A102</span></div>
                    <div className="flex justify-between"><span>part3.avro.pgp</span> <span>RCV-2026-A103</span></div>
                  </>
                ) : (
                  <div className="flex justify-between"><span>muric_{selectedCorte.period.replace('-','')}.avro.pgp</span> <span>SFTP-DEP-8849</span></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-8 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
          <FileText size={48} className="text-blue-500 mb-4" />
          <h4 className="text-xl font-bold text-blue-900 mb-2">Evidencia Regulatoria</h4>
          <p className="text-sm text-blue-700 mb-6">Descargue la evidencia oficial en formato PDF con la firma digital, sellos de tiempo y hashes de validación.</p>
          
          <button onClick={() => handleDownloadPDF(selectedCorte)} disabled={downloaded === 'loading'} className={`w-full flex items-center justify-center space-x-2 text-white py-4 rounded-xl text-base font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-1 relative overflow-hidden ${downloaded === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-70 disabled:hover:translate-y-0`}>
            {downloaded === 'loading' ? (
               <><RefreshCw size={20} className="animate-spin" /> <span>Generando Documento...</span></>
            ) : downloaded === 'success' ? (
               <><CheckCircle2 size={20} className="animate-in zoom-in" /> <span>¡Evidencia Descargada!</span></>
            ) : (
               <><Download size={20} /><span>Descargar Evidencia Oficial (PDF)</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      <style jsx="true">{`
        @keyframes flipInY {
          0% { transform: perspective(1200px) rotateY(15deg); opacity: 0; }
          100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .stage-transition {
          animation: flipInY 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
          transform-origin: center left;
        }
        .alternating-row {
          opacity: 0;
        }
        .alternating-row:nth-child(odd) {
          animation: slideInRight 0.5s ease-out forwards;
        }
        .alternating-row:nth-child(even) {
          animation: slideInRight 0.7s ease-out forwards;
        }
      `}</style>
      <header className="bg-[#0b1120] text-white border-b border-slate-800 h-16 flex items-center px-6 justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <img src="https://totalreport.com.co/wp-content/uploads/2024/11/totalreport1300.png" alt="TÓTAL REPORT Logo" className="h-6 object-contain mr-2" />
          <div className="hidden md:block">
            <h1 className="font-bold text-white leading-tight">Módulo de Transmisión MURIC</h1>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Plataforma Empresarial</p>
          </div>
        </div>
        <div className="flex items-center space-x-5 text-sm">
          {step > 0 && (
            <button onClick={handleRestart} className="flex items-center text-slate-300 hover:text-white transition-all text-xs font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-500 hover:shadow-sm">
              <RotateCcw size={14} className="mr-1.5"/> Histórico
            </button>
          )}
          <div className="hidden sm:flex items-center text-slate-300 font-medium"><Clock size={16} className="mr-2"/> Hoy</div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600 shadow-inner">AR</div>
        </div>
      </header>

      {step === 0 ? (
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {renderDashboardHistorico()}
        </main>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col relative bg-slate-50/50">
            <div className="bg-white border-b border-slate-200 px-4 py-4 shrink-0 z-10 shadow-sm transition-all">
              <div className="flex items-center justify-between max-w-5xl mx-auto">
                {steps.map((s, i) => {
                  const isActive = step - 1 === i;
                  const isPast = step - 1 > i;
                  return (
                    <div key={i} className="flex flex-col items-center relative z-10 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${isPast ? 'bg-emerald-500 border-emerald-500 text-white shadow-md scale-100' : isActive ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50 shadow-sm scale-110' : 'bg-white border-slate-200 text-slate-400 scale-95'}`}>
                        {isPast ? <CheckCircle size={14} className="animate-in zoom-in" /> : (i + 1)}
                      </div>
                      <span className={`text-[9px] sm:text-[10px] text-center uppercase tracking-widest mt-2 font-bold transition-colors duration-300 ${isActive ? 'text-blue-700' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>{s}</span>
                      {i < steps.length - 1 && <div className={`absolute top-[15px] left-[50%] right-[-50%] h-[2px] -z-10 transition-all duration-700 ${isPast ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <main className="flex-1 overflow-auto p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                {step === 1 && renderScreenConfig()}
                {step === 2 && renderScreenOriginExtraction()}
                {step === 3 && renderScreenReview()}
                {step === 4 && renderScreenChannel()}
                {step === 5 && renderScreenSignAndPrepare()}
                {step === 6 && renderScreenTransmission()}
                {step === 7 && renderScreenStatus()}
              </div>
            </main>

            <footer className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="w-1/3 px-4">
                {step > 1 && step < 7 && (
                  <button onClick={() => setStep(step - 1)} disabled={transmitting || (step === 2 && extracting)} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg transition-all hover:bg-slate-50 disabled:opacity-50 disabled:bg-white">
                    <ChevronLeft size={16} className="mr-1" /> Anterior
                  </button>
                )}
              </div>
              <div className="w-1/3 flex justify-end px-4 ml-auto">
                {step === 1 && <button onClick={() => setStep(2)} disabled={!schemaValid} className={`px-8 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all hover:-translate-y-0.5 ${schemaValid ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed hover:translate-y-0'}`}>Siguiente Paso <ChevronRight size={18} className="ml-1" /></button>}
                {step === 2 && <button onClick={() => setStep(3)} disabled={extractProgress < 100} className={`px-8 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all hover:-translate-y-0.5 ${extractProgress === 100 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed hover:translate-y-0'}`}>Revisar Datos <ChevronRight size={18} className="ml-1" /></button>}
                {step === 3 && <button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 px-8 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all">Seleccionar Canal <ChevronRight size={18} className="ml-1" /></button>}
                {step === 4 && <button onClick={() => setStep(5)} disabled={!channel} className={`px-8 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all hover:-translate-y-0.5 ${channel ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed hover:translate-y-0'}`}>Generación AVRO <ChevronRight size={18} className="ml-1" /></button>}
                {step === 5 && <button onClick={() => setStep(6)} disabled={!isPartitioned} className={`px-8 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg ${isPartitioned ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed hover:translate-y-0'}`}>Ir a Transmisión <ChevronRight size={18} className="ml-1" /></button>}
                {step === 6 && !transmitting && <button onClick={handleTransmit} className={`px-8 py-2.5 rounded-lg text-sm font-bold flex items-center transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${channel === 'REST' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>Transmitir Lote ({FILE_SIZE_MB}MB)</button>}
                {step === 7 && <button onClick={handleRestart} className="bg-slate-800 hover:bg-slate-900 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 px-8 py-2.5 rounded-lg text-sm font-bold transition-all">Ir al Histórico</button>}
              </div>
            </footer>
          </div>

          <aside className="w-[340px] bg-white border-l border-slate-200 p-6 hidden xl:flex flex-col z-20 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Auditoría en Tiempo Real</h3>
            <div className="space-y-4 flex-1">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center text-slate-800 font-bold mb-4 border-b border-slate-200 pb-3"><Database size={18} className="text-blue-600 mr-2" /><span>Trazabilidad Operativa</span></div>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-sm"><span className="text-xs uppercase font-bold text-slate-500">Esquema Base</span><span className="font-bold text-slate-800">{selectedSchemaVersion ? `v${selectedSchemaVersion}` : '-'}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-xs uppercase font-bold text-slate-500">Origen de Datos</span><span className="font-bold text-slate-800">{dataSource ? (dataSource === 'db' ? 'TÓTAL SÚPERVISION®' : 'Carga Manual') : '-'}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-xs uppercase font-bold text-slate-500">Período de Corte</span><span className="font-bold text-slate-800">{selectedCorte ? selectedCorte.label : '-'}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-xs uppercase font-bold text-slate-500">Generación AVRO</span><span className={`font-bold transition-colors duration-500 ${isAvroGenerated ? 'text-emerald-600' : 'text-slate-800'}`}>{isAvroGenerated ? 'Construido' : 'Pendiente'}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-xs uppercase font-bold text-slate-500">Canal Asignado</span><span className="font-bold text-slate-800">{channel || '-'}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-xs uppercase font-bold text-slate-500">Particionamiento</span><span className="font-bold text-slate-800">{isPartitioned ? (channel === 'REST' ? 'Sí (API)' : 'No (Archivo Único)') : '-'}</span></div>
                </div>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mt-4 transition-all hover:shadow-sm">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Criptografía y Seguridad</h4>
                <ul className="space-y-2 text-xs font-medium text-slate-600">
                  <li className="flex items-center"><CheckCircle2 size={14} className="text-blue-500 mr-2 shrink-0"/> Sesión de usuario autenticada</li>
                  <li className="flex items-center"><CheckCircle2 size={14} className="text-blue-500 mr-2 shrink-0"/> Tráfico encriptado TLS 1.3</li>
                  <li className={`flex items-center transition-opacity duration-500 ${isSigned ? 'opacity-100' : 'opacity-40'}`}><CheckCircle2 size={14} className="text-blue-500 mr-2 shrink-0"/> Firma PGP validada</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* MODALES DEL DASHBOARD HISTÓRICO */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center">
                <ListFilter size={18} className="mr-2 text-blue-600"/> 
                <h3 className="font-bold text-slate-800 mr-4">Revisión de Corte Histórico</h3>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">{detailModalItem.label}</span>
              </div>
              <button onClick={() => setDetailModalItem(null)} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
            </div>

            <div className="flex bg-slate-50 border-b border-slate-200 px-2 overflow-x-auto shrink-0">
               <button onClick={()=>{setModalReviewTab('resumen'); setModalCurrentPage(1); setModalDetailFilter('');}} className={`px-4 py-3 text-sm font-bold flex items-center whitespace-nowrap transition-colors ${modalReviewTab==='resumen'?'border-b-2 border-blue-600 text-blue-700':'text-slate-500 hover:text-slate-700'}`}>
                 <PieChart size={16} className="mr-2"/> Resumen por Cartera
               </button>
               <button onClick={()=>{setModalReviewTab('top5'); setModalCurrentPage(1); setModalDetailFilter('');}} className={`px-4 py-3 text-sm font-bold flex items-center whitespace-nowrap transition-colors ${modalReviewTab==='top5'?'border-b-2 border-blue-600 text-blue-700':'text-slate-500 hover:text-slate-700'}`}>
                 <Users size={16} className="mr-2"/> Top 5 Mayor Riesgo
               </button>
               <button onClick={()=>setModalReviewTab('detalle')} className={`px-4 py-3 text-sm font-bold flex items-center whitespace-nowrap transition-colors ${modalReviewTab==='detalle'?'border-b-2 border-blue-600 text-blue-700':'text-slate-500 hover:text-slate-700'}`}>
                 <ListFilter size={16} className="mr-2"/> Detalle (Paginado)
               </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 bg-white">
              {modalReviewTab === 'resumen' && (
                <div className="animate-in fade-in overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
                      <tr><th className="px-6 py-4 font-bold">Tipo de Crédito</th><th className="px-6 py-4 font-bold text-right">Cantidad de Oblig.</th><th className="px-6 py-4 font-bold text-right">% del Total</th><th className="px-6 py-4 font-bold text-right">Saldo de Capital Total</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      <tr className="hover:bg-slate-50 transition-colors"><td className="px-6 py-3 font-bold text-slate-700">Comercial</td><td className="px-6 py-3 text-right font-medium text-slate-600">{Math.floor(detailModalItem.records * 0.18).toLocaleString()}</td><td className="px-6 py-3 text-right"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">18%</span></td><td className="px-6 py-3 text-right font-mono font-bold text-slate-800">$ 45.2 Billones</td></tr>
                      <tr className="hover:bg-slate-50 transition-colors"><td className="px-6 py-3 font-bold text-slate-700">Consumo</td><td className="px-6 py-3 text-right font-medium text-slate-600">{Math.floor(detailModalItem.records * 0.60).toLocaleString()}</td><td className="px-6 py-3 text-right"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">60%</span></td><td className="px-6 py-3 text-right font-mono font-bold text-slate-800">$ 22.1 Billones</td></tr>
                      <tr className="hover:bg-slate-50 transition-colors"><td className="px-6 py-3 font-bold text-slate-700">Hipotecario</td><td className="px-6 py-3 text-right font-medium text-slate-600">{Math.floor(detailModalItem.records * 0.14).toLocaleString()}</td><td className="px-6 py-3 text-right"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">14%</span></td><td className="px-6 py-3 text-right font-mono font-bold text-slate-800">$ 38.5 Billones</td></tr>
                      <tr className="bg-slate-100/50 border-t-2 border-slate-200">
                        <td className="px-6 py-4 font-black text-slate-800 uppercase text-xs">Total Datos Lote {detailModalItem.period}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800">{detailModalItem.records.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right"><span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">100%</span></td>
                        <td className="px-6 py-4 text-right font-mono font-black text-blue-700">$ 107.0 Billones</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {modalReviewTab === 'top5' && (
                <div className="animate-in fade-in overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
                      <tr><th className="px-6 py-4 font-bold">Rank</th><th className="px-6 py-4 font-bold">ID Cliente / NIT</th><th className="px-6 py-4 font-bold">ID Obligación</th><th className="px-6 py-4 font-bold text-right">Saldo Capital</th><th className="px-6 py-4 font-bold text-center">Calif.</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium">
                      <tr className="hover:bg-red-50/50 transition-colors"><td className="px-6 py-3 text-slate-400 font-bold">1</td><td className="px-6 py-3 text-slate-800">NIT 890900608</td><td className="px-6 py-3 font-mono text-slate-600">OBL-C-001</td><td className="px-6 py-3 text-right font-mono font-bold text-red-600">$ 150,000,000,000</td><td className="px-6 py-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">A</span></td></tr>
                      <tr className="hover:bg-red-50/50 transition-colors"><td className="px-6 py-3 text-slate-400 font-bold">2</td><td className="px-6 py-3 text-slate-800">NIT 860001022</td><td className="px-6 py-3 font-mono text-slate-600">OBL-C-452</td><td className="px-6 py-3 text-right font-mono font-bold text-red-600">$ 120,500,000,000</td><td className="px-6 py-3 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">A</span></td></tr>
                      <tr className="hover:bg-amber-50/50 transition-colors"><td className="px-6 py-3 text-slate-400 font-bold">3</td><td className="px-6 py-3 text-slate-800">NIT 900504312</td><td className="px-6 py-3 font-mono text-slate-600">OBL-C-891</td><td className="px-6 py-3 text-right font-mono font-bold text-amber-600">$ 85,000,000,000</td><td className="px-6 py-3 text-center"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-xs shadow-sm">B</span></td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {modalReviewTab === 'detalle' && (
                <div className="animate-in fade-in border border-slate-200 rounded-xl overflow-hidden">
                   <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex flex-col sm:flex-row justify-between items-center text-xs gap-3">
                     <div className="flex items-center space-x-2 w-full sm:w-auto">
                       <div className="relative w-full sm:w-64">
                         <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                         <input type="text" placeholder="Buscar por ID Obligación..." value={modalDetailFilter} onChange={(e) => {setModalDetailFilter(e.target.value); setModalCurrentPage(1);}} className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium hover:shadow-sm transition-shadow"/>
                       </div>
                     </div>
                     <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                       <span className="text-slate-600 font-medium">
                         {MODAL_VIRTUAL_TOTAL > 0 ? (<>Mostrando <strong>{((modalCurrentPage - 1) * 10) + 1} a {Math.min(modalCurrentPage * 10, MODAL_VIRTUAL_TOTAL)}</strong> de <strong>{MODAL_VIRTUAL_TOTAL.toLocaleString()}</strong></>) : '0 resultados'}
                       </span>
                       <div className="flex items-center space-x-2">
                         <button onClick={() => setModalCurrentPage(p => Math.max(1, p - 1))} disabled={modalCurrentPage === 1} className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm disabled:shadow-none">Anterior</button>
                         <span className="font-bold text-slate-700">Pág {modalCurrentPage.toLocaleString()} de {MODAL_TOTAL_PAGES.toLocaleString()}</span>
                         <button onClick={() => setModalCurrentPage(p => Math.min(MODAL_TOTAL_PAGES, p + 1))} disabled={modalCurrentPage === MODAL_TOTAL_PAGES || MODAL_TOTAL_PAGES === 0} className="px-2 py-1 border border-slate-300 rounded bg-white text-blue-600 disabled:opacity-50 hover:bg-blue-50 transition-colors shadow-sm disabled:shadow-none">Siguiente</button>
                       </div>
                     </div>
                   </div>
                   
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                        <tr><th className="px-6 py-2 font-bold"># ID_Interno</th><th className="px-6 py-2 font-bold">ID_Obligación</th><th className="px-6 py-2 font-bold">Tipo_Credito</th><th className="px-6 py-2 font-bold text-right">Saldo_Capital</th><th className="px-6 py-2 font-bold text-center">Calificación</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-mono">
                        {modalCurrentDetails.length > 0 ? modalCurrentDetails.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both" style={{ animationDelay: `${i * 30}ms` }}>
                              <td className="px-6 py-2 text-slate-400">{r.idInterno}</td>
                              <td className="px-6 py-2 text-slate-800 font-bold text-blue-700 bg-blue-50 px-2 rounded inline-block mt-1">{r.idObligacion}</td>
                              <td className="px-6 py-2 text-slate-600">{r.tipo}</td>
                              <td className="px-6 py-2 text-right text-slate-800">$ {r.saldo.toLocaleString()}</td>
                              <td className="px-6 py-2 text-center"><span className={`${r.calificacion === 'A' ? 'text-emerald-600' : 'text-amber-600'} font-bold`}>{r.calificacion}</span></td>
                            </tr>
                          )) : (<tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-sans text-sm">No hay registros que coincidan.</td></tr>)
                        }
                      </tbody>
                    </table>
                   </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right shrink-0">
              <button onClick={() => setDetailModalItem(null)} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-all hover:shadow-lg">Cerrar Detalle Analítico</button>
            </div>
          </div>
        </div>
      )}

      {evidenceModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0f172a] text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold flex items-center"><FileText size={18} className="mr-2 text-blue-400"/> Evidencia TÓTAL REPORT®</h3>
                <p className="text-[10px] text-slate-400 uppercase mt-1 tracking-widest">{evidenceModalItem.id}</p>
              </div>
              <button onClick={() => setEvidenceModalItem(null)} className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"><X size={24}/></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center"><CheckCircle2 size={24} className="text-emerald-600 mr-3"/> <div><p className="text-sm font-bold text-emerald-900">Transmisión Exitosa</p><p className="text-xs text-emerald-700">{evidenceModalItem.fechaTransmision}</p></div></div>
                <div className="text-right text-xs"><p className="font-bold text-slate-500 uppercase">Respuesta Autoridad</p><p className="font-bold text-emerald-700">{evidenceModalItem.respuesta}</p></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Período</p><p className="font-bold text-slate-800">{evidenceModalItem.label}</p></div>
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Total Registros</p><p className="font-bold text-slate-800">{evidenceModalItem.records.toLocaleString()}</p></div>
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Canal de Salida</p><p className="font-bold text-slate-800">{evidenceModalItem.canal}</p></div>
                <div><p className="text-[10px] font-bold text-slate-500 uppercase">Usuario Operador</p><p className="font-bold text-slate-800">{USUARIO_ACTUAL}</p></div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-3">Archivos Transmitidos</p>
                <div className="space-y-2">
                  {evidenceModalItem.archivos.map((a, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 text-xs shadow-sm hover:border-slate-200 transition-colors">
                      <span className="font-mono font-bold text-slate-700">{a.nombre}</span>
                      <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm text-slate-600">{a.peso}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button 
                onClick={() => handleDownloadPDF(evidenceModalItem)} 
                disabled={downloaded === 'loading'}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all hover:shadow-lg flex items-center shadow-md disabled:opacity-70 disabled:hover:shadow-none"
              >
                {downloaded === 'loading' ? <RefreshCw size={16} className="mr-2 animate-spin"/> : <Download size={16} className="mr-2"/>}
                Descargar Evidencia Oficial (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;