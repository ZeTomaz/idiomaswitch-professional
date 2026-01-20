
export enum LanguageVariant {
  PT_EU_AO45 = 'Português Europeu AO45',
  PT_EU_AO90 = 'Português Europeu AO90',
  EN_UK = 'English UK',
  EN_US = 'English US'
}

export enum WritingStyle {
  REPORTER = 'REPORTER',
  WRITER_FICTION = 'WRITER_FICTION',
  WRITER_NOVELIST = 'WRITER_NOVELIST',
  WRITER_BIOGRAPHER = 'WRITER_BIOGRAPHER',
  INVESTIGATIVE_JOURNALISM = 'INVESTIGATIVE_JOURNALISM'
}

export enum OperationMode {
  CASUAL = 'CASUAL',
  PROFESSIONAL = 'PROFESSIONAL',
  EXPERT = 'EXPERT'
}

export enum OperationType {
  REWRITE = 'REWRITE',
  CORRECT = 'CORRECT',
  ENRICH = 'ENRICH'
}

export enum ReferenceCitationStyle {
  NAME_ONLY = 'NAME_ONLY',
  NAME_AND_LINK = 'NAME_AND_LINK'
}

export type ConfidenceLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface AuditTrace {
  intentConfidence: string;
  constraintSatisfaction: string;
  humanisationApplied: string;
  aiTraceRisk: string;
  aiTracePercentage: number;
  variantCompliance: string;
  references: string[];
}

export interface ProcessingResult {
  text: string;
  confidence: ConfidenceLevel;
  auditTrace: AuditTrace;
  error?: string;
}

export type UILanguage = 'PT' | 'EN';
