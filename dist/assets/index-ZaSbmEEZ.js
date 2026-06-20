var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=e((e=>{Object.defineProperty(e,"__esModule",{value:!0}),e.renderResume=t;function t(e,t){t.innerHTML=``;let a=n(`resume-header`);a.appendChild(r(`h1`,e.personal.name)),a.appendChild(r(`h2`,e.personal.title));let o=[e.personal.email,e.personal.phone,e.personal.location,e.personal.github].filter(Boolean).join(` | `);if(a.appendChild(r(`p`,o)),t.appendChild(a),e.experience?.length&&t.appendChild(i(`Experience`,e.experience)),e.education?.length&&t.appendChild(i(`Education`,e.education)),e.skills?.length){let i=n(`section-block`);i.appendChild(r(`h3`,`Skills`));let a=document.createElement(`div`);a.className=`skills-grid`,e.skills.forEach(e=>{let t=document.createElement(`div`);t.textContent=typeof e==`string`?e:`${e.category}: ${e.items.join(`, `)}`,a.appendChild(t)}),i.appendChild(a),t.appendChild(i)}}function n(e){let t=document.createElement(`div`);return t.className=`positioned-block ${e}`,t}function r(e,t){let n=document.createElement(e);return n.className=`layout-line`,n.textContent=t,n}function i(e,t){let i=n(`section-block`),a=document.createElement(`h3`);return a.textContent=e,i.appendChild(a),t.forEach(e=>{let t=n(`entity-item`),a=r(`div`,``);a.innerHTML=`<span><strong>${e.role}</strong> - ${e.institution}</span><span>${e.period}</span>`,t.appendChild(a);let o=document.createElement(`ul`);e.description.forEach(e=>{let t=document.createElement(`li`);t.textContent=e,o.appendChild(t)}),t.appendChild(o),i.appendChild(t)}),i}})),n=e((e=>{Object.defineProperty(e,"__esModule",{value:!0}),e.printResume=t;function t(){if(!document.getElementById(`resume-container`)){alert(`Resume container not found in the DOM. Cannot print.`);return}let e=`print-overrides`,t=document.getElementById(e);t||(t=document.createElement(`style`),t.id=e,document.head.appendChild(t)),t.innerHTML=`
    @media print {
      /* Interface Purging */
      .controls-bar, .theme-switcher-bar, button, nav, .debug-info, #loading-overlay {
        display: none !important;
      }

      body, html {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        height: auto !important;
        overflow: visible !important;
      }

      /* Sizing Mechanics (A4) */
      @page {
        size: A4;
        margin: 10mm;
      }

      #resume-container {
        width: 100% !important;
        max-width: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
        position: static !important;
        float: none !important;
        clear: both !important;
        overflow: visible !important;
        height: auto !important;
        border: none !important;
      }

      /* Force all text to be black */
      #resume-container *, #resume-container h1, #resume-container h2, #resume-container h3, 
      #resume-container p, #resume-container span, #resume-container li, #resume-container a {
        color: black !important;
        background: transparent !important;
      }
      
      #resume-container a {
        text-decoration: underline;
      }

      /* Pagination Break Protections */
      .entity-item, .section-block, .positioned-block, .resume-section {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      h1, h2, h3 {
        page-break-after: avoid;
      }
      
      /* Ensure first page is not blank */
      body::before, html::before {
        content: none !important;
      }
    }
  `,window.print()}})),r=e((e=>{var t=e&&e.__awaiter||function(e,t,n,r){function i(e){return e instanceof n?e:new n(function(t){t(e)})}return new(n||=Promise)(function(n,a){function o(e){try{c(r.next(e))}catch(e){a(e)}}function s(e){try{c(r.throw(e))}catch(e){a(e)}}function c(e){e.done?n(e.value):i(e.value).then(o,s)}c((r=r.apply(e,t||[])).next())})};Object.defineProperty(e,"__esModule",{value:!0}),e.fetchGitHubResumeData=n;function n(e){return t(this,void 0,void 0,function*(){let t=e.replace(`https://github.com/`,``).split(`/`)[0].trim(),n={Accept:`application/vnd.github.v3+json`},[i,a]=yield Promise.all([fetch(`https://api.github.com/users/${t}`,{headers:n}),fetch(`https://api.github.com/users/${t}/repos?sort=updated&per_page=30`,{headers:n})]);if(!i.ok)throw Error(`User not found`);let o=yield i.json(),s=yield a.json(),c=s.filter(e=>!e.fork).sort((e,t)=>t.stargazers_count+t.forks_count-(e.stargazers_count+e.forks_count)).slice(0,10),l=new Date().getFullYear(),u=c.map(e=>{let t=[];e.stargazers_count>0&&t.push(`Built and maintained an open-source project with ${e.stargazers_count} stars and ${e.forks_count} forks.`);let n=e.description||`Developed a custom solution focusing on performance and modularity.`;t.push(n),e.topics&&e.topics.length>0?t.push(`Key Technologies: ${e.topics.join(`, `)}`):t.push(`Primary Stack: ${e.language||`Software Engineering`}`),e.homepage&&t.push(`Live Demo: ${e.homepage.replace(/^https?:\/\//,``)}`);let i=new Date(e.created_at).getFullYear(),a=new Date(e.updated_at).getFullYear(),o;return o=i===a?`${i}`:a>l?`${i} — ${l}`:`${i} — ${a}`,{institution:`GitHub Open Source`,role:r(e.name),period:o,description:t}}),d=Array.from(new Set(s.map(e=>e.language).filter(Boolean))),f=s.flatMap(e=>e.topics||[]),p=Array.from(new Set(f)).slice(0,12),m=[{category:`Languages`,items:d.slice(0,8)},{category:`Frameworks & Tools`,items:p.slice(0,8)}];return{personal:{name:o.name||o.login,title:o.bio?o.bio.split(`.`)[0]:`Software Engineer`,email:o.email||`${o.login}@github.com`,phone:`Available upon request`,location:o.location||`Remote / Global`,github:o.html_url,linkedin:o.blog&&o.blog.includes(`linkedin`)?o.blog:void 0},experience:u,education:[{institution:`GitHub Contributions`,role:`Active Developer since ${new Date(o.created_at).getFullYear()}`,period:`${o.public_repos} Public Repositories`,description:[`Accumulated ${s.reduce((e,t)=>e+t.stargazers_count,0)} total stars across all projects.`,`Continuous integration and contribution to the global developer ecosystem.`]}],skills:m}})}function r(e){return e.split(/[-_]/).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `)}})),i=t(),a=n(),o=r(),s=null,c=`left`,l={personal:{name:`Almaz Developer`,title:`Full Stack Software Engineer`,email:`almaz@knu.ac.kr`,phone:`+82 10-1234-5678`,location:`Gongju, South Korea`,github:`github.com/almaz`},education:[{institution:`Kongju National University`,role:`B.S. Computer Science`,period:`2020 - 2024`,description:[`GPA: 4.2/4.5`,`Focus on Web Architecture and UI/UX Design`]}],experience:[{institution:`Web Engineering Lab`,role:`Research Intern`,period:`2023 - Present`,description:[`Implementing Pretext-based layout algorithms`,`Optimizing GitHub API data processing`]}],skills:[`TypeScript`,`React`,`Node.js`,{category:`Frameworks`,items:[`Vite`,`Tailwind`,`Express`]}]};function u(e,t){s=e,(0,i.renderResume)(e,t),d(t,c)}function d(e,t){c=t;let n=e.querySelector(`.resume-header`);n&&(n.style.textAlign=`center`),e.querySelectorAll(`.section-block`).forEach(e=>{let n=e;n.style.textAlign=t;let r=n.querySelector(`.layout-line`);if(r){let e=r;t===`center`?e.style.justifyContent=`center`:(t===`left`||t===`justify`)&&(e.style.justifyContent=`space-between`)}n.querySelectorAll(`ul`).forEach(e=>{t===`left`?(e.style.listStyleType=`disc`,e.style.paddingLeft=`20px`):(e.style.listStyleType=`none`,e.style.paddingLeft=`0`)})})}document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`resume-container`),t=document.getElementById(`loader`),n=document.getElementById(`loading-overlay`),r=document.getElementById(`theme-toggle`);if(!e)return;u(l,e);let i=!1;r?.addEventListener(`click`,()=>{i=!i,i?document.documentElement.setAttribute(`data-theme`,`dark`):document.documentElement.removeAttribute(`data-theme`),r&&(r.textContent=i?`☀️ Светлая`:`🌙 Темная`)}),document.querySelectorAll(`.design-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-design`);t&&(document.body.classList.remove(`theme-classic`,`theme-modern`,`theme-minimal`),document.body.classList.add(`theme-${t}`),document.querySelectorAll(`.design-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`))})}),document.querySelectorAll(`.align-btn`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.getAttribute(`data-align`);n&&e&&(d(e,n),document.querySelectorAll(`.align-btn`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`))})});let c=document.getElementById(`import-github`),f=document.getElementById(`github-url`);c?.addEventListener(`click`,async()=>{let r=f.value.trim();if(!r){alert(`Please enter a username`);return}try{t&&(t.style.display=`block`),n&&n.classList.remove(`hidden`),c.setAttribute(`disabled`,`true`),u(await(0,o.fetchGitHubResumeData)(r),e)}catch{alert(`GitHub User not found or API limit reached`)}finally{t&&(t.style.display=`none`),n&&n.classList.add(`hidden`),c.removeAttribute(`disabled`)}}),document.getElementById(`save-json`)?.addEventListener(`click`,()=>{if(!s)return;let e=new Blob([JSON.stringify(s,null,2)],{type:`application/json`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`resume-${s.personal.name.replace(/\s+/g,`-`).toLowerCase()}.json`,n.click(),URL.revokeObjectURL(t)}),document.getElementById(`export-pdf`)?.addEventListener(`click`,a.printResume)});