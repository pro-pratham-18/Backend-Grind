export const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Mobile Developer (React Native)',
  'Software Engineer (General)',
];

export const DOMAINS = [
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'System Design',
  'DBMS & SQL',
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'Computer Networks',
  'MongoDB',
  'TypeScript',
  'Cloud Computing (AWS)',
  'Git & Version Control',
];

export const DIFFICULTIES = ['easy', 'medium', 'hard'];

export const PAPER_TYPES = [
  { id: 'mcq', label: 'Multiple Choice (MCQ)', description: 'Pick the correct option' },
  { id: 'one-word', label: 'One Word Answer', description: 'Single word or short phrase' },
  { id: 'long-answer', label: 'Long Answer', description: 'Detailed typed response' },
];

export const DURATIONS = [
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];

export const INTERVIEW_QUESTION_COUNTS = [3, 5, 7, 10];
export const TEST_QUESTION_COUNTS = [10, 20, 30, 50];

export const SCORING = {
  MCQ_MAX: 1,
  ONE_WORD_MAX: 1,
  LONG_MAX: 10,
};
