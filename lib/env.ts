function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return getRequiredEnvVar("DATABASE_URL");
  },
  get NEXTAUTH_SECRET() {
    return getRequiredEnvVar("NEXTAUTH_SECRET");
  },
  get NEXTAUTH_URL() {
    return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  },
};
