/**
 * state.js — Application state manager
 * Johnson English Language Laboratory
 *
 * Responsibilities:
 *   - Load and cache JSON data (levels, modules, lessons).
 *   - Track lesson progress (completed activities, current step).
 *   - Provide lookup helpers used by the router and views.
 *   - Persist lightweight progress data to localStorage.
 *
 * Design decision: no reactive framework. State is plain data; views are
 * re-rendered by the router when the hash changes. This keeps the system
 * simple, auditable, and free of heavy dependencies.
 *
 * Storage key: "je_progress" in localStorage.
 *   Structure: { "a1/m01/l01": { completedActivities: ["listening", ...] } }
 */

const STORAGE_KEY = 'je_progress';
const META_KEY = 'je_meta';

/**
 * Calcula o percentual concluído sem depender do DOM ou do armazenamento.
 *
 * @param {string[]} completedActivities
 * @param {string[]} availableActivities
 * @returns {number}
 */
export function calculateProgress(completedActivities = [], availableActivities = []) {
  if (!availableActivities.length) return 0;
  const completed = new Set(completedActivities);
  return Math.round((availableActivities.filter((item) => completed.has(item)).length / availableActivities.length) * 100);
}

/**
 * Busca simples e determinística no catálogo já carregado.
 *
 * @param {Array} lessons
 * @param {Array} modules
 * @param {string} query
 * @returns {Array}
 */
export function searchCatalog(lessons = [], modules = [], query = '') {
  const terms = String(query).trim().toLocaleLowerCase('pt-BR').split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const moduleById = new Map(modules.map((item) => [`${item.levelId}/${item.id}`, item]));
  return lessons.filter((lesson) => {
    const module = moduleById.get(`${lesson.levelId}/${lesson.moduleId}`);
    const haystack = [lesson.levelId, lesson.title, lesson.description, module?.title, module?.description]
      .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
    return terms.every((term) => haystack.includes(term));
  });
}

/** Normaliza preferências antigas ou corrompidas sem perder compatibilidade. */
export function normaliseMeta(stored = {}) {
  return {
    lastLesson: typeof stored.lastLesson === 'string' ? stored.lastLesson : null,
    audioRate: Number.isFinite(stored.audioRate) ? Math.min(1.25, Math.max(0.65, stored.audioRate)) : 0.9,
    audioAccent: stored.audioAccent === 'gb' ? 'gb' : 'us',
  };
}

export const State = (() => {
  /* -------------------------------------------------------------------------
     Private data — only accessible through the public API below.
     ------------------------------------------------------------------------- */

  /** Cached raw JSON data */
  let _levels  = null;   /* Array<LevelData>  */
  let _modules = null;   /* Array<ModuleData> */
  let _lessons = null;   /* Array<LessonData> */

  /** Progress map: lessonKey → { completedActivities: string[] } */
  let _progress = {};
  let _meta = { lastLesson: null, audioRate: 0.9, audioAccent: 'us' };

  /* -------------------------------------------------------------------------
     DATA LOADING
     Loads JSON from /data/*.json. Results are cached after first fetch.
     ------------------------------------------------------------------------- */

  /**
   * Load a JSON file from the /data/ directory.
   *
   * @param {string} filename  e.g. "levels.json"
   * @returns {Promise<any>}
   */
  async function _loadJSON(filename) {
    const response = await fetch(`data/${filename}`);
    if (!response.ok) {
      throw new Error(`[State] Failed to load ${filename}: HTTP ${response.status}`);
    }
    return response.json();
  }

  /**
   * Ensure all JSON data is loaded. Idempotent — safe to call multiple times.
   *
   * @returns {Promise<void>}
   */
  async function _ensureDataLoaded() {
    if (_levels && _modules && _lessons) return;

    const [levels, modules, lessons] = await Promise.all([
      _loadJSON('levels.json'),
      _loadJSON('modules.json'),
      _loadJSON('lessons.json'),
    ]);

    _levels  = levels;
    _modules = modules;
    _lessons = lessons;
  }

  /* -------------------------------------------------------------------------
     PROGRESS PERSISTENCE
     ------------------------------------------------------------------------- */

  /** Load progress from localStorage. Called once during init. */
  function _loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _progress = raw ? JSON.parse(raw) : {};
    } catch (_err) {
      /* If localStorage is unavailable (private mode, etc.), use empty state */
      _progress = {};
    }
    try {
      const raw = localStorage.getItem(META_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      _meta = normaliseMeta(stored);
    } catch (_err) {
      _meta = { lastLesson: null, audioRate: 0.9, audioAccent: 'us' };
    }
  }

  /** Persist current progress to localStorage. */
  function _saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_progress));
    } catch (_err) {
      /* Silently ignore — progress is still available in memory this session */
    }
  }

  function _saveMeta() {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(_meta));
    } catch (_err) {
      /* Preferências continuam disponíveis durante a sessão. */
    }
  }

  /* -------------------------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------------------------- */
  return {
    /**
     * Initialise state. Called once by app.js.
     * Loads persisted progress from localStorage.
     *
     * @returns {object}  The state object itself (for chaining by app.js)
     */
    init() {
      _loadProgress();
      return this;
    },

    /* -----------------------------------------------------------------------
       DATA ACCESS
       ----------------------------------------------------------------------- */

    /**
     * Get all levels.
     *
     * @returns {Promise<Array>}
     */
    async getLevels() {
      await _ensureDataLoaded();
      return _levels;
    },

    /**
     * Get a single level by ID.
     *
     * @param {string} levelId  e.g. "a1"
     * @returns {Promise<object|null>}
     */
    async getLevel(levelId) {
      await _ensureDataLoaded();
      return _levels.find((l) => l.id === levelId.toLowerCase()) || null;
    },

    /**
     * Get all modules for a given level.
     *
     * @param {string} levelId
     * @returns {Promise<Array>}
     */
    async getModulesForLevel(levelId) {
      await _ensureDataLoaded();
      return _modules.filter((m) => m.levelId === levelId.toLowerCase());
    },

    /**
     * Get a single module by level and module ID.
     * Synchronous — used by the router for breadcrumbs after data is loaded.
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @returns {object|null}
     */
    getModule(levelId, moduleId) {
      if (!_modules) return null;
      return _modules.find(
        (m) => m.levelId === levelId.toLowerCase() && m.id === moduleId.toLowerCase()
      ) || null;
    },

    /**
     * Get all lessons for a given module.
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @returns {Promise<Array>}
     */
    async getLessonsForModule(levelId, moduleId) {
      await _ensureDataLoaded();
      return _lessons.filter(
        (l) => l.levelId === levelId.toLowerCase() && l.moduleId === moduleId.toLowerCase()
      );
    },

    /**
     * Get a single lesson.
     * Synchronous — used by the router for breadcrumbs after data is loaded.
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @param {string} lessonId
     * @returns {object|null}
     */
    getLesson(levelId, moduleId, lessonId) {
      if (!_lessons) return null;
      return _lessons.find(
        (l) =>
          l.levelId  === levelId.toLowerCase()  &&
          l.moduleId === moduleId.toLowerCase() &&
          l.id       === lessonId.toLowerCase()
      ) || null;
    },

    /**
     * Get a lesson asynchronously (ensures data is loaded first).
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @param {string} lessonId
     * @returns {Promise<object|null>}
     */
    async getLessonAsync(levelId, moduleId, lessonId) {
      await _ensureDataLoaded();
      return this.getLesson(levelId, moduleId, lessonId);
    },

    /** Retorna todo o catálogo para busca e navegação sequencial. */
    async getAllLessons() {
      await _ensureDataLoaded();
      return _lessons;
    },

    /** Busca por nível, módulo, título, descrição e tema. */
    async search(query) {
      await _ensureDataLoaded();
      return searchCatalog(_lessons, _modules, query);
    },

    /* -----------------------------------------------------------------------
       PROGRESS TRACKING
       ----------------------------------------------------------------------- */

    /**
     * Build a unique key for a lesson's progress entry.
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @param {string} lessonId
     * @returns {string}  e.g. "a1/m01/l01"
     */
    lessonKey(levelId, moduleId, lessonId) {
      return `${levelId.toLowerCase()}/${moduleId.toLowerCase()}/${lessonId.toLowerCase()}`;
    },

    /**
     * Record that an activity has been completed.
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @param {string} lessonId
     * @param {string} activityType  e.g. "listening", "repetition", "practice"
     */
    markActivityComplete(levelId, moduleId, lessonId, activityType) {
      const key = this.lessonKey(levelId, moduleId, lessonId);
      if (!_progress[key]) {
        _progress[key] = { completedActivities: [] };
      }
      if (!_progress[key].completedActivities.includes(activityType)) {
        _progress[key].completedActivities.push(activityType);
      }
      _saveProgress();
    },

    /**
     * Check whether a specific activity has been completed.
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @param {string} lessonId
     * @param {string} activityType
     * @returns {boolean}
     */
    isActivityComplete(levelId, moduleId, lessonId, activityType) {
      const key  = this.lessonKey(levelId, moduleId, lessonId);
      const data = _progress[key];
      return data ? data.completedActivities.includes(activityType) : false;
    },

    /**
     * Get the list of completed activities for a lesson.
     *
     * @param {string} levelId
     * @param {string} moduleId
     * @param {string} lessonId
     * @returns {string[]}
     */
    getCompletedActivities(levelId, moduleId, lessonId) {
      const key  = this.lessonKey(levelId, moduleId, lessonId);
      const data = _progress[key];
      return data ? [...data.completedActivities] : [];
    },

    /** Retorna as atividades que podem gerar conclusão para uma lição. */
    getAvailableActivities(lesson) {
      if (!lesson) return [];
      const activities = [];
      if ((lesson.listening || []).length) activities.push('listening');
      if ((lesson.repetition || []).length) activities.push('repetition');
      if ((lesson.practice || []).length) activities.push('practice');
      if ((lesson.production || []).length) activities.push('production');
      return activities;
    },

    getLessonProgress(levelId, moduleId, lessonId, lesson = null) {
      const resolved = lesson || this.getLesson(levelId, moduleId, lessonId);
      return calculateProgress(
        this.getCompletedActivities(levelId, moduleId, lessonId),
        this.getAvailableActivities(resolved)
      );
    },

    async getProgressSummary(levelId = null, moduleId = null) {
      await _ensureDataLoaded();
      const lessons = _lessons.filter((lesson) =>
        (!levelId || lesson.levelId === levelId.toLowerCase()) &&
        (!moduleId || lesson.moduleId === moduleId.toLowerCase())
      );
      const total = lessons.reduce((sum, lesson) =>
        sum + this.getLessonProgress(lesson.levelId, lesson.moduleId, lesson.id, lesson), 0);
      return { percent: lessons.length ? Math.round(total / lessons.length) : 0, lessons: lessons.length };
    },

    setLastLesson(levelId, moduleId, lessonId) {
      _meta.lastLesson = this.lessonKey(levelId, moduleId, lessonId);
      _saveMeta();
    },

    getLastLesson() {
      return _meta.lastLesson;
    },

    setAudioRate(rate) {
      const value = Number(rate);
      _meta.audioRate = Number.isFinite(value) ? Math.min(1.25, Math.max(0.65, value)) : 0.9;
      _saveMeta();
      return _meta.audioRate;
    },

    getAudioRate() {
      return _meta.audioRate;
    },

    setAudioAccent(accent) {
      _meta.audioAccent = accent === 'gb' ? 'gb' : 'us';
      _saveMeta();
      return _meta.audioAccent;
    },

    getAudioAccent() {
      return _meta.audioAccent;
    },

    /**
     * Reset all stored progress. Useful for testing.
     */
    resetProgress() {
      _progress = {};
      _meta.lastLesson = null;
      _saveProgress();
      _saveMeta();
    },
  };
})();
