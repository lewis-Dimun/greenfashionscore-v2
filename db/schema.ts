import { pgSchema, pgTable, uuid, text, integer, timestamp, jsonb, numeric, primaryKey } from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull()
});

export const surveys = pgTable("surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(), // general | specific
  version: text("version").notNull(),
  productTypeId: uuid("product_type_id")
});

export const productTypes = pgTable("product_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull()
});

export const dimensions = pgTable("dimensions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  maxPoints: integer("max_points").notNull(),
  weightPercent: integer("weight_percent").notNull()
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  textEs: text("text_es").notNull(),
  dimensionId: uuid("dimension_id").notNull(),
  surveyType: text("survey_type").notNull(),
  version: text("version").notNull(),
  weight: numeric("weight")
});

export const answersCatalog = pgTable("answers_catalog", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionCode: text("question_code").notNull(),
  answerCode: text("answer_code").notNull(),
  textEs: text("text_es"),
  valuePoints: numeric("value_points"),
  normalizedValue: numeric("normalized_value")
});

export const surveySubmissions = pgTable("survey_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  surveyId: uuid("survey_id").notNull(),
  brandId: uuid("brand_id"),
  createdAt: timestamp("created_at").defaultNow()
});

export const responses = pgTable("responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull(),
  questionCode: text("question_code").notNull(),
  rawValue: jsonb("raw_value"),
  normalizedValue: numeric("normalized_value")
});

export const scores = pgTable("scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull(),
  total: numeric("total").notNull(),
  perDimension: jsonb("per_dimension").notNull(),
  grade: text("grade").notNull()
});

export const weights = pgTable("weights", {
  id: uuid("id").defaultRandom().primaryKey(),
  version: text("version").notNull(),
  globalDistribution: jsonb("global_distribution").notNull() // {general:0.6, specifics:0.4}
});

export const gradingThresholds = pgTable("grading_thresholds", {
  id: uuid("id").defaultRandom().primaryKey(),
  version: text("version").notNull(),
  thresholds: jsonb("thresholds").notNull() // {A:[75,100], B:[50,74], ...}
});


