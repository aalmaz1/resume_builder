/**
 * Pretext-Inspired Typographic Engine
 * This module implements the Layout Primitive pattern from @chenglou/pretext
 * logic, specifically extending the 'Editorial Engine' concept.
 */
import { ResumeData, TimeBoundedEntity, SkillCategory } from './types';

export function renderResume(data: ResumeData, container: HTMLElement): void {
  // Clear container - simulating the rigid re-render cycle of Pretext
  container.innerHTML = '';

  // 1. PositionedBlock: Header (Pretext Concept: High-level layout container)
  const header = createBlock('resume-header');
  header.appendChild(createLine('h1', data.personal.name));
  header.appendChild(createLine('h2', data.personal.title));
  
  const contacts = [data.personal.email, data.personal.phone, data.personal.location, data.personal.github]
    .filter(Boolean).join(' | ');
  header.appendChild(createLine('p', contacts));
  container.appendChild(header);

  // 2. Sections (Pretext Concept: Content Nodes)
  if (data.experience?.length) {
    container.appendChild(renderSection('Experience', data.experience));
  }

  if (data.education?.length) {
    container.appendChild(renderSection('Education', data.education));
  }

  // 3. Skills Grid (Pretext Concept: Dynamic Grid Constraints)
  if (data.skills?.length) {
    const section = createBlock('section-block');
    section.appendChild(createLine('h3', 'Skills'));
    
    const skillsList = document.createElement('div');
    skillsList.className = 'skills-grid';
    
    data.skills.forEach(skill => {
      const el = document.createElement('div');
      if (typeof skill === 'string') {
        el.textContent = skill;
      } else {
        el.innerHTML = `<strong>${skill.category}:</strong> ${skill.items.join(', ')}`;
      }
      skillsList.appendChild(el);
    });
    section.appendChild(skillsList);
    container.appendChild(section);
  }
}

/**
 * Primitive: PositionedBlock
 * Maps to Pretext's concept of an explicit bounding box.
 */
function createBlock(cls: string): HTMLElement {
  const div = document.createElement('div');
  div.className = `positioned-block ${cls}`;
  return div;
}

/**
 * Primitive: LayoutLine
 * Maps to Pretext's typography baseline alignment.
 */
function createLine(tag: string, text: string): HTMLElement {
  const el = document.createElement(tag);
  el.className = 'layout-line';
  el.textContent = text;
  return el;
}

function renderSection(title: string, items: TimeBoundedEntity[]): HTMLElement {
  const section = createBlock('section-block');
  const h3 = document.createElement('h3');
  h3.textContent = title;
  section.appendChild(h3);

  items.forEach(item => {
    const itemBlock = createBlock('entity-item');
    const headerLine = document.createElement('div');
    headerLine.className = 'layout-line';
    headerLine.innerHTML = `<span><strong>${item.role}</strong> - ${item.institution}</span><span>${item.period}</span>`;
    itemBlock.appendChild(headerLine);

    const ul = document.createElement('ul');
    item.description.forEach(desc => {
      const li = document.createElement('li');
      li.textContent = desc;
      ul.appendChild(li);
    });
    itemBlock.appendChild(ul);
    section.appendChild(itemBlock);
  });
  return section;
}
