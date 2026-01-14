/**
 * Types cho Code Exercises (Parsons Problems & Coding Exercises)
 */

// ============== PARSONS PROBLEMS ==============

export interface ParsonsBlock {
  id: string;
  content: string;
  indent: number; // Số tab indent (0, 1, 2, ...)
}

export interface ParsonsData {
  blocks: ParsonsBlock[];
  correct_order: string[]; // Array of block IDs in correct order
  distractors: ParsonsBlock[]; // Optional distractor blocks (wrong code)
}

// ============== CODING EXERCISES ==============

export interface TestCase {
  input: string;
  expected: string;
  description?: string;
  hidden: boolean; // Hidden test cases for grading
}

export interface CodingData {
  starter_code: string;
  solution_code: string;
  test_code: string; // Python test code for validation
  test_cases: TestCase[];
  hints: string[];
}

// ============== CODE EXERCISE TYPES ==============

export type ExerciseType = "parsons" | "coding";

export interface CodeExercise {
  id: string;
  title: string;
  description: string;
  exercise_type: ExerciseType;
  difficulty: "easy" | "medium" | "hard";
  parsons_data?: ParsonsData;
  coding_data?: CodingData;
}

// ============== API REQUEST/RESPONSE ==============

// Create code exercise request
export interface CreateCodeExerciseRequest {
  title: string;
  description: string;
  exercise_type: ExerciseType;
  difficulty: "easy" | "medium" | "hard";
  language?: string;
  parsons_data?: ParsonsData;
  coding_data?: CodingData;
  expires_in_days?: number;
}

// Create code exercise response
export interface CreateCodeExerciseResponse {
  share_code: string;
  share_url: string;
  exercise_type: ExerciseType;
  title: string;
  expires_at: string | null;
}

// Public exercise response (for students - hides answers)
export interface PublicCodeExerciseResponse {
  share_code: string;
  title: string;
  description: string;
  exercise_type: ExerciseType;
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
  expires_at: string | null;
  creator_name?: string;
  // Exercise data - answers hidden
  exercise_data: PublicParsonsData | PublicCodingData;
}

// Parsons data for students (correct_order hidden)
export interface PublicParsonsData {
  blocks: ParsonsBlock[];
  distractors: ParsonsBlock[];
}

// Coding data for students (solution_code hidden)
export interface PublicCodingData {
  starter_code: string;
  test_cases: PublicTestCase[];
  hints: string[];
}

export interface PublicTestCase {
  input: string;
  expected: string;
  description?: string;
  // hidden test cases not shown
}

// ============== SUBMISSION ==============

// Parsons submission
export interface SubmitParsonsRequest {
  student_name: string;
  submitted_order: string[]; // Array of block IDs in student's order
}

// Coding submission
export interface SubmitCodingRequest {
  student_name: string;
  submitted_code: string;
}

// Submission response
export interface SubmitExerciseResponse {
  success: boolean;
  score: number;
  max_score: number;
  percentage: number;
  feedback: string;
  is_correct: boolean;
  // For parsons
  correct_positions?: number;
  total_positions?: number;
  // For coding
  passed_tests?: number;
  total_tests?: number;
  test_results?: TestResult[];
}

export interface TestResult {
  test_case: string;
  passed: boolean;
  actual_output?: string;
  expected_output: string;
  error?: string;
}

// ============== TEACHER VIEW ==============

// Teacher's exercise list
export interface TeacherExerciseListItem {
  share_code: string;
  title: string;
  exercise_type: ExerciseType;
  difficulty: string;
  created_at: string;
  expires_at: string | null;
  submission_count: number;
  average_score: number | null;
}

export interface TeacherExerciseListResponse {
  exercises: TeacherExerciseListItem[];
  total: number;
}

// Submission detail for teacher
export interface ExerciseSubmission {
  id: number;
  student_name: string;
  submitted_code?: string;
  submitted_order?: string[];
  score: number;
  max_score: number;
  feedback: string;
  submitted_at: string;
}

export interface ExerciseSubmissionsResponse {
  share_code: string;
  title: string;
  exercise_type: ExerciseType;
  submissions: ExerciseSubmission[];
  total: number;
}

// ============== UI STATE ==============

export interface CodeExerciseState {
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Current exercise
  currentExercise: PublicCodeExerciseResponse | null;
  
  // Parsons state
  parsonsOrder: string[];
  
  // Coding state
  code: string;
  
  // Result
  result: SubmitExerciseResponse | null;
  
  // Error
  error: string | null;
}

// ============== GENERATE CODE EXERCISE (AI) ==============

export interface GenerateCodeExerciseRequest {
  exercise_type: ExerciseType;
  section_content: string;
  section_title: string;
  lesson_name: string;
  difficulty: "easy" | "medium" | "hard";
  language: string;
}

export interface GeneratedParsonsExercise {
  title: string;
  description: string;
  blocks: ParsonsBlock[];
  correct_order: string[];
  distractors?: ParsonsBlock[];
}

export interface GeneratedCodingExercise {
  title: string;
  description: string;
  starter_code: string;
  solution_code: string;
  test_code: string;
  test_cases: TestCase[];
  hints?: string[];
}

export interface GenerateCodeExerciseResponse {
  exercise_type: ExerciseType;
  parsons_exercise?: GeneratedParsonsExercise;
  coding_exercise?: GeneratedCodingExercise;
}

// ============== SHARE MODAL ==============

export interface ShareCodeExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: CodeExercise;
  sectionTitle?: string;
}
