import { ResumeData, TimeBoundedEntity } from './types';

export async function fetchGitHubResumeData(input: string): Promise<ResumeData> {
  // Extract username if full URL is provided
  const username = input.replace('https://github.com/', '').split('/')[0].trim();
  
  const userUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=15`;

  const response = await fetch(userUrl);
  if (!response.ok) throw new Error('User not found');
  const profile = await response.json();

  const reposResponse = await fetch(reposUrl);
  const repos = await reposResponse.json();

  const experience: TimeBoundedEntity[] = (repos as any[])
    .filter(repo => !repo.fork)
    .map(repo => ({
      institution: 'GitHub Open Source',
      role: repo.name,
      period: `${new Date(repo.created_at).getFullYear()} - Present`,
      description: [
        repo.description || 'No description provided',
        `Primary Language: ${repo.language || 'Mixed'}`,
        `Stars: ${repo.stargazers_count}`
      ]
    }));

  return {
    personal: {
      name: profile.name || profile.login,
      title: profile.bio || 'Software Developer',
      email: profile.email || `${profile.login}@github.com`,
      phone: 'Not public',
      location: profile.location || 'Remote',
      github: profile.html_url
    },
    experience,
    education: [
      {
        institution: 'Self-Taught via GitHub',
        role: 'Continuous Learning',
        period: '2020 - 2024',
        description: ['Focusing on modern web architectures and Pretext-inspired layouts.']
      }
    ],
    skills: Array.from(new Set(repos.map((r: any) => r.language).filter(Boolean))).slice(0, 8) as string[]
  };
}
