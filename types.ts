
export interface Lesson {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  content: string;
}

export interface Question {
  id: number;
  topicId: string; // Hangi konuya ait olduğu
  text: string;
  options: string[];
  correctAnswer: number;
  hint?: {
    text?: string;
    image?: string;
  };
}

export interface ScoreRecord {
  name: string;
  topicName: string;
  score: number;
  date: string;
  timeTaken: number;
}

export interface UserAccount {
  email: string;
  password?: string;
  name: string;
  gamePoints: number;
  scores: ScoreRecord[];
  isAdmin: boolean;
  createdAt: string;
}

export enum Page {
  Home = 'home',
  TopicContent = 'topic-content',
  Quiz = 'quiz',
  Games = 'games',
  Profile = 'profile',
  About = 'about',
  Contact = 'contact'
}