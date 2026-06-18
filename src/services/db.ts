import initSqlJs, { type Database, type SqlValue } from "sql.js";
import type {
  Course,
  Lesson,
  Question,
  UserProgress,
  Achievement,
  UserAchievement,
  StudyStats,
  StreakRecord,
  CourseWithProgress,
  LessonWithProgress,
  Difficulty,
} from "@/types";

const DB_NAME = "daily_checkin_en";
const STORE_NAME = "sqlite_db";
const DB_KEY = "database";
const DB_VERSION_KEY = "daily_checkin_en_version";
const DB_VERSION = 3; // 递增此值以强制重置数据库

let db: Database | null = null;

// IndexedDB 辅助操作
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadDbFromIndexedDB(): Promise<Uint8Array | null> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(DB_KEY);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result as Uint8Array);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function saveDbToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(data, DB_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 初始化表结构
function initSchema(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('simple', 'medium', 'hard')),
      category TEXT,
      total_lessons INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      script_text TEXT,
      audio_url TEXT,
      order_num INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_answer TEXT NOT NULL,
      audio_url TEXT,
      explanation TEXT,
      year INTEGER,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL UNIQUE,
      status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
      score INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      last_accessed INTEGER,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      condition_type TEXT NOT NULL,
      condition_value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      achievement_id INTEGER NOT NULL UNIQUE,
      unlocked_at INTEGER NOT NULL,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      study_time INTEGER DEFAULT 0,
      questions_answered INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS streak_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      current_streak INTEGER DEFAULT 0,
      max_streak INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);

  // 初始化成就数据
  database.run(`
    INSERT OR IGNORE INTO achievements (name, description, icon, condition_type, condition_value) VALUES
      ('初出茅庐', '连续答对 3 题', 'sparkles', 'consecutive_correct', 3),
      ('渐入佳境', '连续答对 5 题', 'flame', 'consecutive_correct', 5),
      ('听力达人', '连续答对 10 题', 'headphones', 'consecutive_correct', 10),
      ('满分王', '连续答对 20 题', 'crown', 'consecutive_correct', 20),
      ('坚持不懈', '连续学习 3 天', 'calendar-check', 'study_days', 3),
      ('学习先锋', '连续学习 7 天', 'medal', 'study_days', 7),
      ('月度冠军', '连续学习 30 天', 'trophy', 'study_days', 30),
      ('完成首课', '完成第一个课时', 'book-open', 'lessons_completed', 1),
      ('学有所成', '完成 10 个课时', 'graduation-cap', 'lessons_completed', 10),
      ('真题大师', '完成 50 道题目', 'award', 'questions_answered', 50);

    INSERT OR IGNORE INTO streak_records (id, current_streak, max_streak, updated_at) VALUES
      (1, 0, 0, 0);
  `);
}

// 持久化数据库
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist(): void {
  if (!db) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!db) return;
    const data = db.export();
    saveDbToIndexedDB(data).catch(console.error);
  }, 300);
}

// 行转对象
function rowToObject<T>(columns: string[], values: SqlValue[]): T {
  const obj: Record<string, SqlValue> = {};
  columns.forEach((col, idx) => {
    obj[col] = values[idx];
  });
  return obj as T;
}

function queryAll<T>(sql: string, params: SqlValue[] = []): T[] {
  if (!db) return [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row as unknown as T);
  }
  stmt.free();
  return results;
}

function queryOne<T>(sql: string, params: SqlValue[] = []): T | null {
  const results = queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

function execute(sql: string, params: SqlValue[] = []): void {
  if (!db) return;
  db.run(sql, params);
  persist();
}

// 初始化数据库
export async function initDatabase(): Promise<void> {
  if (db) return;

  const SQL = await initSqlJs({
    locateFile: () => "/sql-wasm.wasm",
  });

  // 检查数据库版本，版本不匹配则清除旧数据
  const savedVersion = localStorage.getItem(DB_VERSION_KEY);
  const needsReset = savedVersion && parseInt(savedVersion) < DB_VERSION;

  if (needsReset) {
    // 删除旧的 IndexedDB 数据
    await deleteIndexedDB();
  }

  const savedData = !needsReset ? await loadDbFromIndexedDB() : null;
  if (savedData) {
    db = new SQL.Database(savedData);
    initSchema(db);
  } else {
    db = new SQL.Database();
    initSchema(db);
    persist();
  }

  // 记录当前版本
  localStorage.setItem(DB_VERSION_KEY, DB_VERSION.toString());
}

async function deleteIndexedDB(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

export function isDbReady(): boolean {
  return db !== null;
}

// ============ 课程操作 ============
export function getCourses(difficulty?: Difficulty): Course[] {
  const sql = difficulty
    ? "SELECT * FROM courses WHERE difficulty = ? ORDER BY created_at DESC"
    : "SELECT * FROM courses ORDER BY created_at DESC";
  const params = difficulty ? [difficulty] : [];
  return queryAll<Course>(sql, params);
}

export function getCoursesWithProgress(difficulty?: Difficulty): CourseWithProgress[] {
  const courses = getCourses(difficulty);
  return courses.map((course) => {
    const lessons = getLessons(course.id);
    const completed = lessons.filter((l) => {
      const progress = getProgress(l.id);
      return progress?.status === "completed";
    }).length;
    const total = lessons.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      ...course,
      completed_lessons: completed,
      progress_percent: percent,
    };
  });
}

export function getCourse(id: number): Course | null {
  return queryOne<Course>("SELECT * FROM courses WHERE id = ?", [id]);
}

export function addCourse(
  data: Omit<Course, "id" | "created_at" | "total_lessons">
): number {
  const now = Date.now();
  execute(
    "INSERT INTO courses (title, description, difficulty, category, total_lessons, created_at) VALUES (?, ?, ?, ?, 0, ?)",
    [data.title, data.description, data.difficulty, data.category, now]
  );
  const result = queryOne<{ id: number }>("SELECT last_insert_rowid() as id");
  return result?.id ?? 0;
}

export function deleteCourse(id: number): void {
  // 先删除关联的课时和题目
  const lessons = getLessons(id);
  lessons.forEach((l) => deleteLesson(l.id));
  execute("DELETE FROM courses WHERE id = ?", [id]);
}

// ============ 课时操作 ============
export function getLessons(courseId: number): Lesson[] {
  return queryAll<Lesson>(
    "SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num ASC",
    [courseId]
  );
}

export function getLessonsWithProgress(courseId: number): LessonWithProgress[] {
  const lessons = getLessons(courseId);
  return lessons.map((lesson) => {
    const progress = getProgress(lesson.id);
    return {
      ...lesson,
      status: progress?.status ?? "not_started",
      score: progress?.score ?? 0,
    };
  });
}

export function getLesson(id: number): Lesson | null {
  return queryOne<Lesson>("SELECT * FROM lessons WHERE id = ?", [id]);
}

export function addLesson(
  data: Omit<Lesson, "id" | "order_num">
): number {
  const orderResult = queryOne<{ max_order: number }>(
    "SELECT COALESCE(MAX(order_num), -1) as max_order FROM lessons WHERE course_id = ?",
    [data.course_id]
  );
  const orderNum = (orderResult?.max_order ?? -1) + 1;
  execute(
    "INSERT INTO lessons (course_id, title, script_text, audio_url, order_num, duration) VALUES (?, ?, ?, ?, ?, ?)",
    [data.course_id, data.title, data.script_text, data.audio_url, orderNum, data.duration]
  );
  // 更新课程总课时数
  execute(
    "UPDATE courses SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = ?) WHERE id = ?",
    [data.course_id, data.course_id]
  );
  const result = queryOne<{ id: number }>("SELECT last_insert_rowid() as id");
  return result?.id ?? 0;
}

export function deleteLesson(id: number): void {
  execute("DELETE FROM questions WHERE lesson_id = ?", [id]);
  execute("DELETE FROM user_progress WHERE lesson_id = ?", [id]);
  execute("DELETE FROM lessons WHERE id = ?", [id]);
}

// ============ 题目操作 ============
export function getQuestions(lessonId: number): Question[] {
  return queryAll<Question>(
    "SELECT * FROM questions WHERE lesson_id = ? ORDER BY id ASC",
    [lessonId]
  );
}

export function getAllQuestions(): Question[] {
  return queryAll<Question>("SELECT * FROM questions ORDER BY year DESC, id ASC");
}

export function addQuestion(
  data: Omit<Question, "id">
): number {
  execute(
    `INSERT INTO questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, audio_url, explanation, year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.lesson_id,
      data.question_text,
      data.option_a,
      data.option_b,
      data.option_c,
      data.option_d,
      data.correct_answer,
      data.audio_url,
      data.explanation,
      data.year,
    ]
  );
  const result = queryOne<{ id: number }>("SELECT last_insert_rowid() as id");
  return result?.id ?? 0;
}

export function deleteQuestion(id: number): void {
  execute("DELETE FROM questions WHERE id = ?", [id]);
}

// ============ 学习进度 ============
export function getProgress(lessonId: number): UserProgress | null {
  return queryOne<UserProgress>(
    "SELECT * FROM user_progress WHERE lesson_id = ?",
    [lessonId]
  );
}

export function updateProgress(
  lessonId: number,
  status: "not_started" | "in_progress" | "completed",
  score: number,
  timeSpent: number
): void {
  const existing = getProgress(lessonId);
  const now = Date.now();
  if (existing) {
    execute(
      "UPDATE user_progress SET status = ?, score = MAX(score, ?), time_spent = time_spent + ?, last_accessed = ? WHERE lesson_id = ?",
      [status, score, timeSpent, now, lessonId]
    );
  } else {
    execute(
      "INSERT INTO user_progress (lesson_id, status, score, time_spent, last_accessed) VALUES (?, ?, ?, ?, ?)",
      [lessonId, status, score, timeSpent, now]
    );
  }
}

export function getAllProgress(): UserProgress[] {
  return queryAll<UserProgress>("SELECT * FROM user_progress");
}

// ============ 成就系统 ============
export function getAchievements(): Achievement[] {
  return queryAll<Achievement>("SELECT * FROM achievements ORDER BY condition_value ASC");
}

export function getUserAchievements(): UserAchievement[] {
  return queryAll<UserAchievement>("SELECT * FROM user_achievements ORDER BY unlocked_at DESC");
}

export function unlockAchievement(achievementId: number): void {
  const existing = queryOne<UserAchievement>(
    "SELECT * FROM user_achievements WHERE achievement_id = ?",
    [achievementId]
  );
  if (!existing) {
    execute(
      "INSERT INTO user_achievements (achievement_id, unlocked_at) VALUES (?, ?)",
      [achievementId, Date.now()]
    );
  }
}

export function getUnlockedAchievementIds(): Set<number> {
  const userAchs = getUserAchievements();
  return new Set(userAchs.map((a) => a.achievement_id));
}

// ============ 连续答对记录 ============
export function getStreakRecord(): StreakRecord {
  const record = queryOne<StreakRecord>("SELECT * FROM streak_records WHERE id = 1");
  return (
    record ?? {
      id: 1,
      current_streak: 0,
      max_streak: 0,
      updated_at: 0,
    }
  );
}

export function updateStreakRecord(current: number, max: number): void {
  execute(
    "UPDATE streak_records SET current_streak = ?, max_streak = ?, updated_at = ? WHERE id = 1",
    [current, max, Date.now()]
  );
}

// ============ 学习统计 ============
export function getTodayStats(): StudyStats {
  const today = new Date().toISOString().split("T")[0];
  const stats = queryOne<StudyStats>(
    "SELECT * FROM study_stats WHERE date = ?",
    [today]
  );
  return (
    stats ?? {
      id: 0,
      date: today,
      study_time: 0,
      questions_answered: 0,
      correct_count: 0,
      streak_days: 0,
    }
  );
}

export function getStatsRange(days: number): StudyStats[] {
  const result: StudyStats[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const stats = queryOne<StudyStats>(
      "SELECT * FROM study_stats WHERE date = ?",
      [dateStr]
    );
    result.push(
      stats ?? {
        id: 0,
        date: dateStr,
        study_time: 0,
        questions_answered: 0,
        correct_count: 0,
        streak_days: 0,
      }
    );
  }
  return result;
}

export function recordStudyTime(seconds: number): void {
  const today = new Date().toISOString().split("T")[0];
  const existing = queryOne<StudyStats>(
    "SELECT * FROM study_stats WHERE date = ?",
    [today]
  );
  if (existing) {
    execute(
      "UPDATE study_stats SET study_time = study_time + ? WHERE date = ?",
      [seconds, today]
    );
  } else {
    const streak = calculateStreak();
    execute(
      "INSERT INTO study_stats (date, study_time, questions_answered, correct_count, streak_days) VALUES (?, ?, 0, 0, ?)",
      [today, seconds, streak]
    );
  }
}

export function recordAnswer(isCorrect: boolean): void {
  const today = new Date().toISOString().split("T")[0];
  const existing = queryOne<StudyStats>(
    "SELECT * FROM study_stats WHERE date = ?",
    [today]
  );
  if (existing) {
    execute(
      "UPDATE study_stats SET questions_answered = questions_answered + 1, correct_count = correct_count + ? WHERE date = ?",
      [isCorrect ? 1 : 0, today]
    );
  } else {
    const streak = calculateStreak();
    execute(
      "INSERT INTO study_stats (date, study_time, questions_answered, correct_count, streak_days) VALUES (?, 0, 1, ?, ?)",
      [today, isCorrect ? 1 : 0, streak]
    );
  }
}

// 计算连续学习天数
function calculateStreak(): number {
  const allStats = queryAll<StudyStats>(
    "SELECT * FROM study_stats ORDER BY date DESC"
  );
  if (allStats.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  // 如果今天或昨天有学习记录，开始计算
  if (allStats[0].date === today || allStats[0].date === yesterday) {
    streak = 1;
    for (let i = 1; i < allStats.length; i++) {
      const prevDate = new Date(allStats[i - 1].date);
      const currDate = new Date(allStats[i].date);
      const diffDays = Math.round(
        (prevDate.getTime() - currDate.getTime()) / 86400000
      );
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  // 更新所有记录的 streak_days
  execute("UPDATE study_stats SET streak_days = ? WHERE date = ?", [
    streak,
    today,
  ]);

  return streak;
}

export function getStudyDaysCount(): number {
  const result = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM study_stats WHERE study_time > 0"
  );
  return result?.count ?? 0;
}

export function getCompletedLessonsCount(): number {
  const result = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_progress WHERE status = 'completed'"
  );
  return result?.count ?? 0;
}

export function getTotalQuestionsAnswered(): number {
  const result = queryOne<{ total: number }>(
    "SELECT SUM(questions_answered) as total FROM study_stats"
  );
  return result?.total ?? 0;
}

export function getWeeklyAccuracy(): number {
  const stats = getStatsRange(7);
  const totalAnswered = stats.reduce((sum, s) => sum + s.questions_answered, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.correct_count, 0);
  if (totalAnswered === 0) return 0;
  return Math.round((totalCorrect / totalAnswered) * 100);
}
