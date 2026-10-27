export type FagsystemTarget = "mock-alt" | "fiks";

type Method = "GET" | "POST";

interface RouteRule {
  pattern: RegExp;
  methods: Method[];
  /** Sti hos mock-alt-api, relativ til FAGSYSTEM_BACKEND_BASE_PATH. null = ikke støttet. */
  mockAlt: ((match: RegExpMatchArray) => string) | null;
  /** Sti hos sosialhjelp-fagsystem-backend, relativ til FAGSYSTEM_BACKEND_BASE_PATH. null = ikke støttet. */
  fiks: ((match: RegExpMatchArray) => string) | null;
}

const ID = "([A-Za-z0-9-]{1,64})";

/**
 * Tillatelsesliste for proxyen. Alt som ikke matcher her avvises med 404,
 * slik at proxyen ikke blir en åpen relé mot backendene.
 */
const rules: RouteRule[] = [
  {
    pattern: /^digisosapi\/oppdaterDigisosSak$/,
    methods: ["POST"],
    mockAlt: () => "innsyn-api/api/v1/digisosapi/oppdaterDigisosSak",
    fiks: () => "api/v1/digisosapi/oppdaterDigisosSak",
  },
  {
    pattern: new RegExp(`^digisosapi/${ID}/innsynsfil$`),
    methods: ["GET"],
    mockAlt: (m) => `innsyn-api/api/v1/digisosapi/${m[1]}/innsynsfil`,
    fiks: (m) => `api/v1/digisosapi/${m[1]}/innsynsfil`,
  },
  {
    pattern: new RegExp(`^digisosapi/${ID}/filOpplasting$`),
    methods: ["POST"],
    mockAlt: (m) => `innsyn-api/api/v1/digisosapi/${m[1]}/filOpplasting`,
    fiks: (m) => `api/v1/digisosapi/${m[1]}/filOpplasting`,
  },
  {
    pattern: /^mock\/nyNavEnhet$/,
    methods: ["POST"],
    mockAlt: () => "innsyn-api/api/v1/mock/nyNavEnhet",
    fiks: null,
  },
  {
    pattern: /^brukere$/,
    methods: ["GET"],
    mockAlt: () => "mock-alt/v2/brukere/",
    fiks: null,
  },
  {
    pattern: /^saker$/,
    methods: ["GET"],
    mockAlt: null,
    fiks: () => "api/v1/saker",
  },
];

export type ResolveResult =
  | { kind: "ok"; path: string }
  | { kind: "not-found" }
  | { kind: "method-not-allowed" }
  | { kind: "not-implemented" };

export const resolveProxyPath = (
  path: string,
  method: string,
  target: FagsystemTarget,
): ResolveResult => {
  for (const rule of rules) {
    const match = path.match(rule.pattern);
    if (!match) continue;
    if (!rule.methods.includes(method as Method)) {
      return { kind: "method-not-allowed" };
    }
    const mapper = target === "fiks" ? rule.fiks : rule.mockAlt;
    if (!mapper) return { kind: "not-implemented" };
    return { kind: "ok", path: mapper(match) };
  }
  return { kind: "not-found" };
};

export const getTarget = (): FagsystemTarget =>
  process.env.FAGSYSTEM_TARGET === "fiks" ? "fiks" : "mock-alt";
