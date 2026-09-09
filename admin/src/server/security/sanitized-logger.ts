export type LogLevel = "error" | "info" | "warn";

export type SanitizedLogEntry = {
  context?: Record<string, unknown>;
  event: string;
  level: LogLevel;
};

export interface LogSink {
  write(entry: SanitizedLogEntry): void;
}

const sensitiveFieldName = /authorization|cookie|password|secret|token/i;
const redactedValue = "[REDACTED]";

function sanitizeLogValue(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name };
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeLogValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sensitiveFieldName.test(key)
          ? redactedValue
          : sanitizeLogValue(nestedValue),
      ]),
    );
  }

  return value;
}

export type SanitizedLogger = {
  error(event: string, context?: Record<string, unknown>): void;
  info(event: string, context?: Record<string, unknown>): void;
  warn(event: string, context?: Record<string, unknown>): void;
};

export function createSanitizedLogger(sink: LogSink): SanitizedLogger {
  function write(
    level: LogLevel,
    event: string,
    context?: Record<string, unknown>,
  ): void {
    const entry: SanitizedLogEntry = { event, level };

    if (context !== undefined) {
      entry.context = sanitizeLogValue(context) as Record<string, unknown>;
    }

    sink.write(entry);
  }

  return {
    error: (event, context) => write("error", event, context),
    info: (event, context) => write("info", event, context),
    warn: (event, context) => write("warn", event, context),
  };
}
