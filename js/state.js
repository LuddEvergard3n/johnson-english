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
  }

  /** Persist current progress to localStorage. */
  function _saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_progress));
    } catch (_err) {
      /* Silently ignore — progress is still available in memory this session */
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

    /**
     * Reset all stored progress. Useful for testing.
     */
    resetProgress() {
      _progress = {};
      _saveProgress();
    },
  };
})();
