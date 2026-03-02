export interface PersistentOptions {
    version?: number;
    userId?: string | number;
}

interface StoredPayload<T> {
    version: number;
    data: T;
}

export class PersistentState<T> {
    private key: string;
    private version: number;

    constructor(key: string, options?: PersistentOptions) {
        const version = options?.version ?? 1;
        const userSuffix = options?.userId ? `_u${options.userId}` : "";

        this.key = `${key}${userSuffix}`;
        this.version = version;
    }

    load(defaultValue: T): T {
        const raw = localStorage.getItem(this.key);
        if (!raw) return defaultValue;

        try {
            const parsed: StoredPayload<T> = JSON.parse(raw);

            if (parsed.version !== this.version) {
                return defaultValue;
            }

            return parsed.data;
        } catch {
            return defaultValue;
        }
    }

    save(value: T) {
        const payload: StoredPayload<T> = {
            version: this.version,
            data: value,
        };

        localStorage.setItem(this.key, JSON.stringify(payload));
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}