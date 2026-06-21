"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDemoProfile = generateDemoProfile;
const faker_1 = require("@faker-js/faker");
/**
 * Generates a demo profile with realistic random data using Faker.js
 */
function generateDemoProfile() {
    // Generate a list of 5-6 random IT skills from a predefined pool
    const skillPool = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++',
        'React', 'Vue', 'Angular', 'Svelte',
        'Node.js', 'Express', 'Django', 'Flask',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
        'Git', 'CI/CD', 'GraphQL', 'REST API',
        'SQL', 'MongoDB', 'PostgreSQL', 'Redis'
    ];
    const skills = [];
    const selectedSkills = new Set();
    // Select 5-6 random skills
    const numSkills = faker_1.faker.number.int({ min: 5, max: 6 });
    for (let i = 0; i < numSkills; i++) {
        selectedSkills.add(faker_1.faker.helpers.arrayElement(skillPool));
    }
    // Add some categorized skills
    skills.push(...Array.from(selectedSkills));
    skills.push({
        category: 'Tools',
        items: [faker_1.faker.helpers.arrayElement(['VS Code', 'IntelliJ', 'WebStorm']), faker_1.faker.helpers.arrayElement(['Figma', 'Sketch', 'Adobe XD'])]
    });
    // Generate 2-3 work experiences
    const experience = [];
    const numExperiences = faker_1.faker.number.int({ min: 2, max: 3 });
    for (let i = 0; i < numExperiences; i++) {
        const startDate = faker_1.faker.date.past({ years: 5 - i });
        const endDate = i === 0 ? faker_1.faker.date.recent() : faker_1.faker.date.between({ from: startDate, to: new Date() });
        experience.push({
            institution: faker_1.faker.company.name(),
            role: faker_1.faker.person.jobTitle(),
            period: `${startDate.getFullYear()} - ${endDate.getFullYear()}`,
            description: [
                faker_1.faker.lorem.sentence({ min: 10, max: 20 }),
                faker_1.faker.lorem.sentence({ min: 10, max: 20 })
            ]
        });
    }
    // Generate education
    const education = [
        {
            institution: `${faker_1.faker.location.city()} University`,
            role: `B.S. ${faker_1.faker.helpers.arrayElement(['Computer Science', 'Software Engineering', 'Information Technology', 'Data Science'])}`,
            period: `${faker_1.faker.number.int({ min: 2016, max: 2019 })} - ${faker_1.faker.number.int({ min: 2020, max: 2024 })}`,
            description: [
                `GPA: ${faker_1.faker.number.float({ min: 3.0, max: 4.0, fractionDigits: 1 })}/4.0`,
                faker_1.faker.lorem.sentence({ min: 8, max: 15 })
            ]
        }
    ];
    return {
        personal: {
            name: faker_1.faker.person.fullName(),
            title: faker_1.faker.person.jobTitle(),
            email: faker_1.faker.internet.email(),
            phone: faker_1.faker.phone.number(),
            location: `${faker_1.faker.location.city()}, ${faker_1.faker.location.country()}`,
            github: `github.com/${faker_1.faker.internet.username()}`,
            linkedin: `linkedin.com/in/${faker_1.faker.internet.username()}`
        },
        education,
        experience,
        skills
    };
}
