import { pgTable, uuid, text, integer, timestamp, numeric, boolean, serial, pgEnum, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const dimensionEnum = pgEnum('dimension_name', ['PEOPLE', 'PLANET', 'MATERIALS', 'CIRCULARITY']);
export const surveyTypeEnum = pgEnum('survey_type', ['general', 'specific']);
export const categoryEnum = pgEnum('category', ['A', 'B', 'C', 'D', 'E']);

// User profiles (maps to auth.users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // References auth.users.id
  email: text("email").notNull().unique(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Dimensions with weights and max points
export const dimensions = pgTable("dimensions", {
  id: serial("id").primaryKey(),
  name: dimensionEnum("name").notNull().unique(),
  weight_percent: numeric("weight_percent", { precision: 5, scale: 2 }).notNull(),
  max_points: integer("max_points").notNull(),
  description: text("description")
});

// Questions (both general and specific)
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  dimension_id: integer("dimension_id").notNull().references(() => dimensions.id),
  text: text("text").notNull(),
  is_specific: boolean("is_specific").notNull().default(false),
  max_points: integer("max_points").notNull().default(4),
  excel_id: text("excel_id"), // For traceability
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  // Unique constraint to prevent duplicates
  uniqueQuestion: unique("unique_question").on(table.dimension_id, table.text, table.is_specific)
}));

// Answers for questions
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  question_id: integer("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  points: integer("points").notNull(),
  excel_id: text("excel_id"), // For traceability
  created_at: timestamp("created_at").defaultNow().notNull()
}, (table) => ({
  // Unique constraint to prevent duplicate answers per question
  uniqueAnswer: unique("unique_answer").on(table.question_id, table.text)
}));

// General surveys (one per user)
export const generalSurveys = pgTable("general_surveys", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id),
  completed: boolean("completed").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  completed_at: timestamp("completed_at")
});

// Specific surveys (multiple per user, requires completed general)
export const specificSurveys = pgTable("specific_surveys", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id),
  general_survey_id: integer("general_survey_id").notNull().references(() => generalSurveys.id),
  product_name: text("product_name").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// User answers (links users to their question responses)
export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull().references(() => profiles.id),
  question_id: integer("question_id").notNull().references(() => questions.id),
  answer_id: integer("answer_id").notNull().references(() => answers.id),
  points_obtained: integer("points_obtained").notNull(),
  general_survey_id: integer("general_survey_id").references(() => generalSurveys.id),
  specific_survey_id: integer("specific_survey_id").references(() => specificSurveys.id),
  created_at: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  generalSurveys: many(generalSurveys),
  specificSurveys: many(specificSurveys),
  userAnswers: many(userAnswers)
}));

export const dimensionsRelations = relations(dimensions, ({ many }) => ({
  questions: many(questions)
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  dimension: one(dimensions, {
    fields: [questions.dimension_id],
    references: [dimensions.id]
  }),
  answers: many(answers),
  userAnswers: many(userAnswers)
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
  question: one(questions, {
    fields: [answers.question_id],
    references: [questions.id]
  }),
  userAnswers: many(userAnswers)
}));

export const generalSurveysRelations = relations(generalSurveys, ({ one, many }) => ({
  user: one(profiles, {
    fields: [generalSurveys.user_id],
    references: [profiles.id]
  }),
  specificSurveys: many(specificSurveys),
  userAnswers: many(userAnswers)
}));

export const specificSurveysRelations = relations(specificSurveys, ({ one, many }) => ({
  user: one(profiles, {
    fields: [specificSurveys.user_id],
    references: [profiles.id]
  }),
  generalSurvey: one(generalSurveys, {
    fields: [specificSurveys.general_survey_id],
    references: [generalSurveys.id]
  }),
  userAnswers: many(userAnswers)
}));

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  user: one(profiles, {
    fields: [userAnswers.user_id],
    references: [profiles.id]
  }),
  question: one(questions, {
    fields: [userAnswers.question_id],
    references: [questions.id]
  }),
  answer: one(answers, {
    fields: [userAnswers.answer_id],
    references: [answers.id]
  }),
  generalSurvey: one(generalSurveys, {
    fields: [userAnswers.general_survey_id],
    references: [generalSurveys.id]
  }),
  specificSurvey: one(specificSurveys, {
    fields: [userAnswers.specific_survey_id],
    references: [specificSurveys.id]
  })
}));