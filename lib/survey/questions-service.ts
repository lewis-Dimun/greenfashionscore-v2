import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { db } from '../../db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface QuestionWithAnswers {
  id: number;
  text: string;
  is_specific: boolean;
  max_points: number;
  dimension: {
    id: number;
    name: string;
    weight_percent: number;
    max_points: number;
  };
  answers: {
    id: number;
    text: string;
    points: number;
  }[];
}

export interface QuestionsByCategory {
  [key: string]: QuestionWithAnswers[];
}

// Return ALL questions (general + specific) grouped by dimension
export async function getAllQuestionsByCategory(): Promise<QuestionsByCategory> {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        text,
        is_specific,
        max_points,
        dimension:dimensions(id, name, weight_percent, max_points),
        answers(id, text, points)
      `)
      .order('id');

    if (error) {
      console.error('Error fetching all questions:', error);
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    const grouped: QuestionsByCategory = {};

    questions.forEach(question => {
      const dimensionName = question.dimension.name;
      if (!grouped[dimensionName]) {
        grouped[dimensionName] = [];
      }
      grouped[dimensionName].push(question);
    });

    return grouped;
  } catch (error) {
    console.error('Error in getAllQuestionsByCategory:', error);
    throw error;
  }
}

export async function getGeneralQuestionsByCategory(): Promise<QuestionsByCategory> {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        text,
        is_specific,
        max_points,
        dimension:dimensions(id, name, weight_percent, max_points),
        answers(id, text, points)
      `)
      .eq('is_specific', false)
      .order('id');

    if (error) {
      console.error('Error fetching general questions:', error);
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    // Group by dimension name
    const grouped: QuestionsByCategory = {};
    
    questions.forEach(question => {
      const dimensionName = question.dimension.name;
      if (!grouped[dimensionName]) {
        grouped[dimensionName] = [];
      }
      grouped[dimensionName].push(question);
    });

    return grouped;
  } catch (error) {
    console.error('Error in getGeneralQuestionsByCategory:', error);
    throw error;
  }
}

export async function getProductQuestionsByCategory(): Promise<QuestionsByCategory> {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        id,
        text,
        is_specific,
        max_points,
        dimension:dimensions(id, name, weight_percent, max_points),
        answers(id, text, points)
      `)
      .eq('is_specific', true)
      .order('id');

    if (error) {
      console.error('Error fetching product questions:', error);
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    // Group by dimension name
    const grouped: QuestionsByCategory = {};
    
    questions.forEach(question => {
      const dimensionName = question.dimension.name;
      if (!grouped[dimensionName]) {
        grouped[dimensionName] = [];
      }
      grouped[dimensionName].push(question);
    });

    return grouped;
  } catch (error) {
    console.error('Error in getProductQuestionsByCategory:', error);
    throw error;
  }
}

export async function getQuestionById(questionId: number): Promise<QuestionWithAnswers | null> {
  try {
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        id,
        text,
        is_specific,
        max_points,
        dimension:dimensions(id, name, weight_percent, max_points),
        answers(id, text, points)
      `)
      .eq('id', questionId)
      .single();

    if (error) {
      console.error('Error fetching question by ID:', error);
      return null;
    }

    return question;
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    return null;
  }
}

export async function getDimensions(): Promise<Array<{id: number, name: string, weight_percent: number, max_points: number}>> {
  try {
    const { data: dimensions, error } = await supabase
      .from('dimensions')
      .select('id, name, weight_percent, max_points')
      .order('name');

    if (error) {
      console.error('Error fetching dimensions:', error);
      throw new Error(`Failed to fetch dimensions: ${error.message}`);
    }

    return dimensions;
  } catch (error) {
    console.error('Error in getDimensions:', error);
    throw error;
  }
}