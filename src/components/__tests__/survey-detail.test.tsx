import { render, screen } from '@testing-library/react'
import { SurveyDetail } from '../survey-detail'

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "RATING";
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  client: {
    id: string;
    name: string | null;
    email: string;
  };
  teamMember: {
    id: string;
    name: string | null;
    email: string;
  };
  questions: Question[];
  responses: {
    id: string;
    createdAt: Date;
    score: number | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    answers: {
      id: string;
      text: string | null;
      score: number | null;
    }[];
  }[];
};

const mockSurvey: Survey = {
  id: '1',
  title: 'Test Survey',
  description: 'Test Description',
  client: {
    id: '1',
    name: 'Test Client',
    email: 'client@test.com',
  },
  teamMember: {
    id: '1',
    name: 'Test Team Member',
    email: 'team@test.com',
  },
  questions: [
    {
      id: '1',
      text: 'Test Question',
      type: 'TEXT' as const,
    },
  ],
  responses: [
    {
      id: '1',
      createdAt: new Date(),
      score: 5,
      user: {
        id: '1',
        name: 'Test User',
        email: 'user@test.com',
      },
      answers: [
        {
          id: '1',
          text: 'Test Answer',
          score: 5,
        },
      ],
    },
  ],
}

describe('SurveyDetail', () => {
  it('renders survey title and description', () => {
    render(<SurveyDetail survey={mockSurvey} />)
    
    expect(screen.getByText('Test Survey')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders client and team member information', () => {
    render(<SurveyDetail survey={mockSurvey} />)
    
    expect(screen.getByText('Test Client')).toBeInTheDocument()
    expect(screen.getByText('Test Team Member')).toBeInTheDocument()
  })

  it('renders questions', () => {
    render(<SurveyDetail survey={mockSurvey} />)
    
    expect(screen.getByText('Test Question')).toBeInTheDocument()
    expect(screen.getByText('Type: TEXT')).toBeInTheDocument()
  })

  it('renders previous responses when they exist', () => {
    render(<SurveyDetail survey={mockSurvey} />)
    
    expect(screen.getByText('By: Test User')).toBeInTheDocument()
    expect(screen.getByText('Score: 5')).toBeInTheDocument()
  })
}) 