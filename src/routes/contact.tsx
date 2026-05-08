import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  organization: z.string().trim().min(1, "Required").max(160),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
});

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact — ElectaCore" }] }),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Thank you. A specialist will be in touch within one business day.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  }

  return (
    <PageShell
      eyebrow="Talk to us"
      title="Request a demo."
      lede="Tell us about your organization and the election you're preparing. A governance specialist will be in touch within one business day."
    >
      <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" required maxLength={255} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="organization">Organization</Label>
          <Input id="organization" name="organization" required maxLength={160} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Tell us about your election</Label>
          <Textarea id="message" name="message" rows={5} required maxLength={2000} placeholder="Type of organization, approximate voter count, timeline…" />
        </div>
        <Button type="submit" variant="institutional" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Request demo"}
        </Button>
      </form>
    </PageShell>
  );
}
