import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — ElectaCore" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app/dashboard" });
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/app/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/app/dashboard`,
        data: { display_name: name, organization: org },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. You can sign in now.");
  };

  const handleToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("verify-voting-token", {
      body: { token: token.trim() },
    });
    setLoading(false);
    if (error) return toast.error(error.message || "Network error");
    if (!data?.ok) return toast.error(data?.error || "Invalid voting token");
    if (data.has_voted) return toast.error("This token has already been used.");
    sessionStorage.setItem("electa.token", token.trim());
    sessionStorage.setItem("electa.tokenRoll", JSON.stringify({ election_id: data.election_id, has_voted: false }));
    navigate({ to: "/vote/$electionId", params: { electionId: data.election_id } });
  };

  return (
    <PageShell
      eyebrow="Secure access"
      title="Sign in to ElectaCore"
      lede="Administrators and registered voters use credentials. Anonymous voters use the single-use token issued by their election authority."
    >
      <div className="mx-auto max-w-xl">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
            <TabsTrigger value="token">Voting token</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Field id="si-email" label="Email"><Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field id="si-pw" label="Password"><Input id="si-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
              <Button type="submit" variant="institutional" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Field id="su-name" label="Full name"><Input id="su-name" required value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field id="su-org" label="Organization"><Input id="su-org" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Optional" /></Field>
              <Field id="su-email" label="Email"><Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
              <Field id="su-pw" label="Password"><Input id="su-pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
              <Button type="submit" variant="institutional" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
              <p className="text-xs text-muted-foreground">By creating an account you accept the platform's audit, logging, and integrity policies.</p>
            </form>
          </TabsContent>

          <TabsContent value="token">
            <form onSubmit={handleToken} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><KeyRound className="h-4 w-4 text-gold" /> Single-use code issued by your election authority</div>
              <Field id="tk" label="Voting token"><Input id="tk" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="e.g. 8B2K-NQ4R-7TVP" /></Field>
              <Button type="submit" variant="gold" className="w-full" disabled={loading}>{loading ? "Verifying…" : "Enter ballot"}</Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Back to <Link to="/" className="text-foreground underline">home</Link>
        </p>
      </div>
    </PageShell>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
