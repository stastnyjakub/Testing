export enum ELogSeverityLevel {
  /**
   * The log entry has no assigned severity level. (0)
   */
  DEFAULT = 'DEFAULT',
  /**
   * Debug or trace information. (100)
   */
  DEBUG = 'DEBUG',
  /**
   * Routine information, such as ongoing status or performance. (200)
   */
  INFO = 'INFO',
  /**
   * Normal but significant events, such as start up, shut down, or a configuration change. (300)
   */
  NOTICE = 'NOTICE',
  /**
   * Warning events might cause problems. (400)
   */
  WARNING = 'WARNING',
  /**
   * Error events are likely to cause problems. (500)
   */
  ERROR = 'ERROR',
  /**
   * Critical events cause more severe problems or outages. (600)
   */
  CRITICAL = 'CRITICAL',
  /**
   * A person must take an action immediately. (700)
   */
  ALERT = 'ALERT',
  /**
   * One or more systems are unusable. (800)
   */
  EMERGENCY = 'EMERGENCY',
}
