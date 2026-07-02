/**
 * Production Print Optimizer with html2pdf.js from node_modules
 */

interface Html2PdfModule {
  default: any;
}

async function loadHtml2Pdf(): Promise<any> {
  // Проверяем, загружена ли библиотека уже
  if ((window as any).html2pdf) {
    return (window as any).html2pdf;
  }
  
  try {
    // Импортируем из локального модуля
    const module = await import('html2pdf.js') as Html2PdfModule;
    if (module.default) {
      (window as any).html2pdf = module.default;
      return module.default;
    }
    throw new Error('html2pdf default export not found');
  } catch (error) {
    console.error('Failed to load html2pdf from local module:', error);
    throw new Error('Failed to load html2pdf.js');
  }
}

export async function printResume(): Promise<void> {
  const resumeContainer = document.getElementById('resume-container');
  
  // Sanity Check
  if (!resumeContainer) {
    alert('Resume container not found in the DOM. Cannot export PDF.');
    return;
  }

  // Показываем индикатор загрузки
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }

  try {
    // Ждем загрузки всех шрифтов и изображений
    await document.fonts.ready;
    
    // Даем дополнительное время для рендеринга изображений
    await new Promise(resolve => setTimeout(resolve, 500));

    // Динамически загружаем html2pdf из локального модуля
    const html2pdf = await loadHtml2Pdf();

    // Экспорт через html2pdf.js с точными настройками A4
    await html2pdf()
      .set({
        margin: 0,                    // Поля уже заданы в CSS контейнера (padding: 20mm)
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,                   // Улучшенное качество рендеринга
          letterRendering: true,      // Корректный рендеринг шрифтов
          useCORS: true,              // Разрешить загрузку изображений с CORS
          logging: false,
          windowWidth: 794            // Фиксированная ширина в px (210mm при 96dpi)
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      })
      .from(resumeContainer)
      .save();
      
  } catch (error) {
    console.error('PDF export error:', error);
    alert('Ошибка при экспорте PDF. Пожалуйста, попробуйте снова.');
  } finally {
    // Скрываем индикатор загрузки
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }
}
