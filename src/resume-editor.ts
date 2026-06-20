/**
 * Resume Editor — interactive form that lets users edit resume data in real-time.
 * Changes are persisted to localStorage and trigger a re-render callback.
 */

import { ResumeData, TimeBoundedEntity, SkillCategory } from './types';

const STORAGE_KEY = 'resume-data';

export class ResumeEditor {
  private container: HTMLElement;
  private data: ResumeData;
  private onUpdate: (data: ResumeData) => void;

  constructor(
    container: HTMLElement,
    initialData: ResumeData,
    onUpdate: (data: ResumeData) => void,
  ) {
    this.container = container;
    this.data = structuredClone(initialData);
    this.onUpdate = onUpdate;
    this.render();
  }

  static loadSaved(): ResumeData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ResumeData;
    } catch { /* ignore */ }
    return null;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch { /* ignore */ }
    this.onUpdate(this.data);
  }

  private notify(): void {
    this.save();
  }

  getData(): ResumeData {
    return structuredClone(this.data);
  }

  importJSON(json: string): void {
    try {
      const parsed = JSON.parse(json) as ResumeData;
      if (parsed.personal && parsed.experience && parsed.education && parsed.skills) {
        this.data = parsed;
        this.save();
        this.render();
      } else {
        alert('Invalid resume JSON format.');
      }
    } catch {
      alert('Failed to parse JSON file.');
    }
  }

  exportJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  reset(defaultData: ResumeData): void {
    this.data = structuredClone(defaultData);
    this.save();
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';

    this.container.appendChild(this.buildPersonalSection());
    this.container.appendChild(this.buildEntitySection('Experience', this.data.experience, (items) => { this.data.experience = items; }));
    this.container.appendChild(this.buildEntitySection('Education', this.data.education, (items) => { this.data.education = items; }));
    this.container.appendChild(this.buildSkillsSection());
  }

  private buildPersonalSection(): HTMLElement {
    const section = this.createSection('Personal Details');
    const p = this.data.personal;

    const fields: { label: string; key: keyof typeof p; placeholder: string }[] = [
      { label: 'Full Name', key: 'name', placeholder: 'John Doe' },
      { label: 'Job Title', key: 'title', placeholder: 'Software Engineer' },
      { label: 'Email', key: 'email', placeholder: 'john@example.com' },
      { label: 'Phone', key: 'phone', placeholder: '+1 234 567 890' },
      { label: 'Location', key: 'location', placeholder: 'City, Country' },
      { label: 'LinkedIn', key: 'linkedin', placeholder: 'linkedin.com/in/...' },
      { label: 'GitHub', key: 'github', placeholder: 'github.com/...' },
    ];

    for (const f of fields) {
      section.appendChild(this.createInput(f.label, (p[f.key] ?? '') as string, f.placeholder, (val) => {
        (this.data.personal as any)[f.key] = val;
        this.notify();
      }));
    }

    return section;
  }

  private buildEntitySection(
    title: string,
    items: TimeBoundedEntity[],
    setter: (items: TimeBoundedEntity[]) => void,
  ): HTMLElement {
    const section = this.createSection(title);

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'editor-card';

      card.appendChild(this.createInput('Role / Degree', item.role, 'e.g. Senior Engineer', (val) => {
        item.role = val; this.notify();
      }));
      card.appendChild(this.createInput('Institution / Company', item.institution, 'e.g. Google', (val) => {
        item.institution = val; this.notify();
      }));
      card.appendChild(this.createInput('Period', item.period, 'e.g. Jan 2020 – Present', (val) => {
        item.period = val; this.notify();
      }));

      const bulletsLabel = document.createElement('label');
      bulletsLabel.className = 'editor-label';
      bulletsLabel.textContent = 'Description (one per line)';
      card.appendChild(bulletsLabel);

      const textarea = document.createElement('textarea');
      textarea.className = 'editor-textarea';
      textarea.rows = 3;
      textarea.value = item.description.join('\n');
      textarea.addEventListener('input', () => {
        item.description = textarea.value.split('\n').filter((l) => l.trim() !== '');
        this.notify();
      });
      card.appendChild(textarea);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'editor-btn editor-btn-danger';
      removeBtn.textContent = `Remove ${title.slice(0, -1) || title}`;
      removeBtn.addEventListener('click', () => {
        items.splice(idx, 1);
        setter(items);
        this.notify();
        this.render();
      });
      card.appendChild(removeBtn);

      section.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'editor-btn editor-btn-add';
    addBtn.textContent = `+ Add ${title.slice(0, -1) || title}`;
    addBtn.addEventListener('click', () => {
      items.push({ institution: '', role: '', period: '', description: [] });
      setter(items);
      this.notify();
      this.render();
    });
    section.appendChild(addBtn);

    return section;
  }

  private buildSkillsSection(): HTMLElement {
    const section = this.createSection('Skills');

    this.data.skills.forEach((skill, idx) => {
      // Only handle SkillCategory objects, skip strings
      if (typeof skill === 'string') return;
      
      const card = document.createElement('div');
      card.className = 'editor-card';

      card.appendChild(this.createInput('Category', skill.category, 'e.g. Languages', (val) => {
        skill.category = val; this.notify();
      }));
      card.appendChild(this.createInput('Items (comma-separated)', skill.items.join(', '), 'e.g. TypeScript, Python', (val) => {
        skill.items = val.split(',').map((s) => s.trim()).filter(Boolean);
        this.notify();
      }));

      const removeBtn = document.createElement('button');
      removeBtn.className = 'editor-btn editor-btn-danger';
      removeBtn.textContent = 'Remove Category';
      removeBtn.addEventListener('click', () => {
        this.data.skills.splice(idx, 1);
        this.notify();
        this.render();
      });
      card.appendChild(removeBtn);

      section.appendChild(card);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'editor-btn editor-btn-add';
    addBtn.textContent = '+ Add Skill Category';
    addBtn.addEventListener('click', () => {
      this.data.skills.push({ category: '', items: [] });
      this.notify();
      this.render();
    });
    section.appendChild(addBtn);

    return section;
  }

  private createSection(title: string): HTMLElement {
    const el = document.createElement('fieldset');
    el.className = 'editor-section';
    const legend = document.createElement('legend');
    legend.textContent = title;
    el.appendChild(legend);
    return el;
  }

  private createInput(
    label: string,
    value: string,
    placeholder: string,
    onChange: (val: string) => void,
  ): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'editor-field';

    const lbl = document.createElement('label');
    lbl.className = 'editor-label';
    lbl.textContent = label;
    wrapper.appendChild(lbl);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editor-input';
    input.value = value;
    input.placeholder = placeholder;
    input.addEventListener('input', () => onChange(input.value));
    wrapper.appendChild(input);

    return wrapper;
  }
}
