import { useState, ChangeEvent, FormEvent, CSSProperties } from "react";

const API_URL = "https://localhost:7246/graphql";

const REGISTER_MUTATION = `
  mutation Register($username: String!, $email: String!, $password: String!) {
    auth {
      register(username: $username, email: $email, password: $password) {
        token
        error { code message }
      }
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    auth {
      login(email: $email, password: $password) {
        token
        error { code message }
      }
    }
  }
`;

// =====================
// Types
// =====================

type Mode = "login" | "register";

interface FormState {
  username: string;
  email: string;
  password: string;
}

interface StatusState {
  type: "success" | "error";
  text: string;
}

interface GraphQLError {
  code: string;
  message: string;
}

interface AuthPayload {
  token: string | null;
  error: GraphQLError | null;
}

interface LoginResponse {
  data?: { auth?: { login?: AuthPayload } };
}

interface RegisterResponse {
  data?: { auth?: { register?: AuthPayload } };
}

// =====================
// GraphQL helper
// =====================

async function graphqlRequest<T>(
  query: string,
  variables: Record<string, string>
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<T>;
}

// =====================
// Field component
// =====================

interface FieldProps {
  label: string;
  name: keyof FormState;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={focused ? styles.inputFocus : styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// =====================
// AuthPage component
// =====================

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<StatusState | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      let payload: AuthPayload | null | undefined;

      if (mode === "login") {
        const res = await graphqlRequest<LoginResponse>(LOGIN_MUTATION, {
          email: form.email,
          password: form.password,
        });
        payload = res.data?.auth?.login;
      } else {
        const res = await graphqlRequest<RegisterResponse>(REGISTER_MUTATION, {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        payload = res.data?.auth?.register;
      }

      if (payload?.error) {
        setStatus({ type: "error", text: payload.error.message });
      } else {
        setSuccess(true);
        setStatus({
          type: "success",
          text: mode === "login" ? "Вхід успішний" : "Реєстрацію завершено",
        });
      }
    } catch {
      setStatus({
        type: "error",
        text: "Не вдалося з'єднатися з сервером",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setStatus(null);
    setSuccess(false);
    setForm({ username: "", email: "", password: "" });
  };

  return (
    <div style={styles.root}>
      <div style={styles.bg} />

      <div style={styles.card}>
        {/* Логотип */}
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>Ethy</span>
        </div>

        <p style={styles.tagline}>Координація адресної допомоги</p>

        {/* Таби */}
        <div style={styles.tabs}>
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}
            >
              {m === "login" ? "Вхід" : "Реєстрація"}
            </button>
          ))}
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" && (
            <Field
              label="Ім'я користувача"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="ivan_petrenko"
              required
            />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
          />
          <Field
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {status && (
            <div
              style={{
                ...styles.alert,
                background:
                  status.type === "error"
                    ? "rgba(220,53,69,0.12)"
                    : "rgba(40,167,69,0.12)",
                borderColor:
                  status.type === "error" ? "#dc3545" : "#28a745",
                color: status.type === "error" ? "#ff6b7a" : "#5dd879",
              }}
            >
              {status.type === "error" ? "✗" : "✓"} {status.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            style={{
              ...styles.submitBtn,
              ...(loading || success ? styles.submitBtnDisabled : {}),
            }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : success ? (
              "✓"
            ) : mode === "login" ? (
              "Увійти"
            ) : (
              "Зареєструватись"
            )}
          </button>
        </form>

        <p style={styles.footer}>
          {mode === "login" ? "Немає акаунту? " : "Вже є акаунт? "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            style={styles.footerLink}
          >
            {mode === "login" ? "Зареєструватись" : "Увійти"}
          </button>
        </p>
      </div>
    </div>
  );
}

// =====================
// Styles
// =====================

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0d0f14",
    fontFamily: "'Georgia', serif",
    position: "relative",
    overflow: "hidden",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%), " +
      "radial-gradient(ellipse 40% 40% at 80% 80%, rgba(236,72,153,0.08) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: 400,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "40px 36px 32px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  logoIcon: {
    fontSize: 28,
    color: "#818cf8",
    lineHeight: 1,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: "0.02em",
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    margin: "0 0 28px",
    letterSpacing: "0.03em",
  },
  tabs: {
    display: "flex",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: 4,
    marginBottom: 28,
    gap: 4,
  },
  tab: {
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 7,
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.02em",
  },
  tabActive: {
    background: "rgba(129,140,248,0.2)",
    color: "#a5b4fc",
    fontWeight: 600,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  inputFocus: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(129,140,248,0.5)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#f1f5f9",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
    boxShadow: "0 0 0 3px rgba(129,140,248,0.1)",
    width: "100%",
    boxSizing: "border-box",
  },
  alert: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid",
    fontSize: 13,
    letterSpacing: "0.01em",
  },
  submitBtn: {
    marginTop: 4,
    padding: "13px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "opacity 0.2s, transform 0.1s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    width: "100%",
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: "default",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
  },
  footerLink: {
    background: "none",
    border: "none",
    color: "#818cf8",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'Georgia', serif",
    textDecoration: "underline",
    padding: 0,
  },
};

const styleTag = document.createElement("style");
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
