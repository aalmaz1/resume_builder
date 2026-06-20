import { ResumeData, TimeBoundedEntity, SkillCategory } from './types';

export async function fetchGitHubResumeData(input: string): Promise<ResumeData> {
  const username = input.replace('https://github.com/', '').split('/')[0].trim();
  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  
  // 1. Fetch Profile & Repos in parallel
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers })
  ]);
  
  if (!userRes.ok) throw new Error('User not found');
  const profile = await userRes.json();
  const allRepos = await reposRes.json() as any[];
  
  // 2. Filter and Sort Repos (Top 10 by impact: stars + forks)
  const topRepos = allRepos
    .filter(repo => !repo.fork)
    .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
    .slice(0, 10);
  
  // 3. Map Repos to Professional Experience
  const experience: TimeBoundedEntity[] = topRepos.map(repo => {
    const bullets: string[] = [];
    
    // Impact Achievement
    if (repo.stargazers_count > 0) {
      bullets.push(`Built and maintained an open-source project with ${repo.stargazers_count} stars and ${repo.forks_count} forks.`);
    }
    
    // Technical Description
    const desc = repo.description || 'Developed a custom solution focusing on performance and modularity.';
    bullets.push(desc);
    
    // Tech Stack & Metadata
    if (repo.topics && repo.topics.length > 0) {
      bullets.push(`Key Technologies: ${repo.topics.join(', ')}`);
    } else {
      bullets.push(`Primary Stack: ${repo.language || 'Software Engineering'}`);
    }
    
    // Links (Live Demo or Repo)
    if (repo.homepage) {
      bullets.push(`Live Demo: ${repo.homepage.replace(/^https?:\/\//, '')}`);
    }
    
    return {
      institution: 'GitHub Open Source',
      role: formatRepoName(repo.name),
      period: `${new Date(repo.created_at).getFullYear()} — ${new Date(repo.updated_at).getFullYear()}`,
      description: bullets
    };
  });
  
  // 4. Synthesize Skills Section
  const languages = Array.from(new Set(allRepos.map(r => r.language).filter(Boolean))) as string[];
  const allTopics = allRepos.flatMap(r => r.topics || []);
  const topTopics = Array.from(new Set(allTopics)).slice(0, 12) as string[];
  
  const skills: (string | SkillCategory)[] = [
    { category: 'Languages', items: languages.slice(0, 8) },
    { category: 'Frameworks & Tools', items: topTopics.slice(0, 8) }
  ];
  
  // 5. Build Final Resume Object
  return {
    personal: {
      name: profile.name || profile.login,
      title: profile.bio ? profile.bio.split('.')[0] : 'Software Engineer',
      email: profile.email || `${profile.login}@github.com`,
      phone: 'Available upon request',
      location: profile.location || 'Remote / Global',
      github: profile.html_url,
      linkedin: profile.blog && profile.blog.includes('linkedin') ? profile.blog : undefined
    },
    experience,
    education: [
      {
        institution: 'GitHub Contributions',
        role: `Active Developer since ${new Date(profile.created_at).getFullYear()}`,
        period: `${profile.public_repos} Public Repositories`,
        description: [
          `Accumulated ${allRepos.reduce((acc, r) => acc + r.stargazers_count, 0)} total stars across all projects.`,
          `Continuous integration and contribution to the global developer ecosystem.`
        ]
      }
    ],
    skills
  };
}

/**
 * Formats repository name from kebab/snake_case to Title Case
 */
function formatRepoName(name: string): string {
  return name.split(/[-_]/).map((w: string) => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
}
