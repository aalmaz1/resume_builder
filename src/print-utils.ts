/**
 * Production Print Optimizer with html2pdf.js
 */
import html2pdf from 'html2pdf.js';

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
