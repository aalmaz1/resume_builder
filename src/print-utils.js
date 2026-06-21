"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printResume = printResume;
/**
 * Production Print Optimizer with html2pdf.js
 */
const html2pdfModule = require("html2pdf.js");
const html2pdf = html2pdfModule.default || html2pdfModule;
function printResume() {
    return __awaiter(this, void 0, void 0, function* () {
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
            yield document.fonts.ready;
            // Даем дополнительное время для рендеринга изображений
            yield new Promise(resolve => setTimeout(resolve, 500));
            // Экспорт через html2pdf.js с точными настройками A4
            yield html2pdf()
                .set({
                margin: 0, // Поля уже заданы в CSS контейнера (padding: 20mm)
                filename: 'resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2, // Улучшенное качество рендеринга
                    letterRendering: true, // Корректный рендеринг шрифтов
                    useCORS: true, // Разрешить загрузку изображений с CORS
                    logging: false,
                    windowWidth: 794 // Фиксированная ширина в px (210mm при 96dpi)
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            })
                .from(resumeContainer)
                .save();
        }
        catch (error) {
            console.error('PDF export error:', error);
            alert('Ошибка при экспорте PDF. Пожалуйста, попробуйте снова.');
        }
        finally {
            // Скрываем индикатор загрузки
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
        }
    });
}
