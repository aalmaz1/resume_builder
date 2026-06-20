import * as process from 'process';
import { createCanvas, registerFont } from 'canvas';
import { fetchGitHubResumeData } from './github-provider';
import { renderResume, ResumeLayoutConfig, DEFAULT_LAYOUT_CONFIG } from './resume-builder';
import { writeFileSync } from 'fs';

/**
 * Polyfill for OffscreenCanvas in Node.js environment.
 * The Pretext layout engine depends on a Canvas context for precise text measurement.
 */
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  (globalThis as any).OffscreenCanvas = class {
    constructor(width: number, height: number) {
      return createCanvas(width, height) as any;
    }
  };
}

// Регистрация шрифтов, если они не стандартные.
// Это критично для корректного измерения текста в Node.js и его отрисовки.
// Без регистрации шрифтов, node-canvas может использовать шрифт по умолчанию,
// который может не совпадать с тем, что ожидает pretext, или не отрисовываться вовсе.
//
// Для начала, зарегистрируем Arial, который часто доступен в Linux после установки
// пакета `ttf-mscorefonts-installer`.
// Если Arial не найден, попробуйте 'DejaVu Sans' или 'Liberation Sans',
// которые обычно предустановлены в большинстве дистрибутивов Linux.
try {
  // Укажите корректный путь к файлам шрифтов в вашей системе
  // Пример для Ubuntu после установки ttf-mscorefonts-installer:
  registerFont('/usr/share/fonts/truetype/msttcorefonts/Arial.ttf', { family: 'Arial' });
  registerFont('/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf', { family: 'Arial Bold' });
  console.log('✅ Шрифты Arial зарегистрированы для отрисовки.');
} catch (e) {
  console.warn("⚠️ Не удалось зарегистрировать системные шрифты Arial. Убедитесь, что они установлены (например, 'sudo apt-get install ttf-mscorefonts-installer') и путь верен.", e);
  console.warn("Попробуйте использовать другие системные шрифты, например 'DejaVu Sans' или 'Liberation Sans', или укажите путь к вашим файлам шрифтов.");
}

async function main() {
  // Берем имя из аргументов CLI или используем по умолчанию
  const username = process.argv[2] || 'aalmaz1';
  // Используем токен из окружения для обхода Rate Limit (60 зап/час для анонимов)
  const token = process.env.GITHUB_TOKEN;
  
  console.log(`📡 Получение данных GitHub для пользователя: ${username}...`);

  try {
    const resumeData = await fetchGitHubResumeData(username, token);
    const config: ResumeLayoutConfig = { ...DEFAULT_LAYOUT_CONFIG, theme: 'professional' };
    const blocks = renderResume(resumeData, config);

    console.log('✅ Блоки резюме успешно сгенерированы!');
    console.log(`User: ${resumeData.name}`);
    console.log(`Projects found: ${resumeData.experience.length}`);
    console.log(`Top Skills: ${resumeData.skills?.slice(0, 5).join(', ')}`);
    console.log(`Total Layout Blocks: ${blocks.length}`);

    // --- Добавляем рендеринг в PNG ---
    const canvas = createCanvas(config.pageWidth, config.pageHeight);
    const ctx = canvas.getContext('2d');

    // Устанавливаем привязку текста к верхней границе (top), 
    // так как pretext выдает координату y для верха строки.
    ctx.textBaseline = 'top';

    // Заливаем фон белым
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовываем каждый блок
    for (const block of blocks) {
      // Устанавливаем шрифт и цвет в зависимости от типа блока
      switch (block.type) {
        case 'name':
          ctx.font = config.nameFont;
          ctx.fillStyle = '#333'; // Темно-серый
          break;
        case 'contact':
          ctx.font = config.bodyFont;
          ctx.fillStyle = '#555'; // Серый
          break;
        case 'sectionTitle':
          ctx.font = config.sectionTitleFont;
          ctx.fillStyle = '#333';
          break;
        case 'entry':
          // Для заголовков опыта/образования
          if (block.lines.some(line => line.text.includes('—'))) { // Простой способ определить заголовок
            ctx.font = config.subsectionFont;
            ctx.fillStyle = '#444';
          } else { // Для обычного текста и хайлайтов
            ctx.font = config.bodyFont;
            ctx.fillStyle = '#666';
          }
          break;
        default:
          ctx.font = config.bodyFont;
          ctx.fillStyle = '#000';
      }

      // Отрисовываем каждую строку в блоке
      for (const line of block.lines) {
        ctx.fillText(line.text, block.x, block.y + line.y);
      }
    }

    const outputPath = `./${username}_resume.png`;
    writeFileSync(outputPath, canvas.toBuffer('image/png'));
    console.log(`🖼️ Резюме сохранено в ${outputPath}`);

  } catch (err) {
    console.error('Failed to generate resume:', err);
  }
}

main();