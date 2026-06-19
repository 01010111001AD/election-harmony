// Detailed walkthrough narration script for the ElectaCore product video.
export const narrationText = `Meet ElectaCore: the secure digital election platform trusted by institutions that take democracy seriously.

An administrator begins by creating a new election — for example, "Board of Directors Election 2026". They choose a voting method: First-Past-the-Post, Approval, Ranked-Choice, or Yes/No. They set the maximum number of selections, add a ballot description, and schedule open and close dates. The ballot automatically inherits the organization's logo, brand colors, and tagline, so every voter feels they are inside their own institution's portal.

Next, the administrator adds candidates. Each candidate's name, statement, and portrait are entered into a sortable list with thumbnail previews. The administrator can drag them into the exact display order that will appear on the ballot.

The voter roll is built in three ways. The administrator can upload an Excel or CSV file and map the email column, plus optional name and tag columns — ElectaCore generates a unique voting token for each row. They can also enroll members directly from the organization's directory, filtering by tags like "active members" or "shareholders", or selecting all members. For external systems, an API key can be pasted to sync eligible voters. The administrator reviews the count, removes duplicates, and can add late enrollees.

When everything is ready, the administrator changes the election status from draft to open. Instantly, every enrolled voter receives a secure email invitation containing their unique token, formatted as XXXX-XXXX-XXXX, and a link to the branded ballot portal.

A voter opens the email, clicks the link, and arrives at a login page carrying the organization's colors and logo. They enter their token — accepted case-insensitively and with or without hyphens — and the ballot appears. For First-Past-the-Post, clean radio buttons sit beside each candidate's photo and statement. For Approval, checkboxes appear with a counter reading "Approve up to N". For Ranked-Choice, the voter taps candidates in order, and each selected candidate shows a numbered badge. For Yes/No, two prominent choice buttons are shown. After reviewing their selections, the voter clicks "Cast ballot" and sees a confirmation screen with a shield icon: their vote has been securely recorded and audit-logged. The ballot is encrypted in transit, and the voter receives no receipt, so no one can ever prove how they voted — preserving absolute secrecy.

While the election is open, the administrator dashboard displays a live tally bar chart that updates in real time as ballots arrive. It also shows turnout statistics — votes cast versus roll size — but individual voter choices are never revealed. If public results are enabled, voters and visitors can see anonymized live bars updating on the results page.

At the scheduled close time, or manually, the administrator changes the status to closed. The system stops accepting new ballots. After a review period, the administrator certifies the election. The results become permanently visible and immutable: final counts per candidate, total turnout percentage, and winning margin.

Every ballot cast generates a cryptographic audit entry with an immutable timestamp. This guarantees that no ballot was altered after submission and that the tally matches the number of audit entries. The organization can export a certified results report for board minutes or regulatory filing.

From setup to certification, ElectaCore transforms election management into a secure, transparent, and scalable process. It replaces paper ballots and basic survey tools with a modern system that protects voter secrecy, gives administrators real-time confidence, and produces immutable, auditable records. ElectaCore — for elections that matter.`;

export const SCENE_TIMINGS = [
  { id: "intro", label: "Meet ElectaCore", durationInSeconds: 7 },
  { id: "setup", label: "Setup & Configuration", durationInSeconds: 18 },
  { id: "candidates", label: "Candidate Onboarding", durationInSeconds: 12 },
  { id: "voterRoll", label: "Voter Roll Creation", durationInSeconds: 17 },
  { id: "launch", label: "Launch", durationInSeconds: 9 },
  { id: "voterExperience", label: "Voter Experience", durationInSeconds: 25 },
  { id: "monitoring", label: "Monitoring & Live Results", durationInSeconds: 12 },
  { id: "close", label: "Close & Certify", durationInSeconds: 11 },
  { id: "audit", label: "Audit & Transparency", durationInSeconds: 9 },
  { id: "outro", label: "Why ElectaCore", durationInSeconds: 12 },
] as const;

export const TOTAL_SECONDS = SCENE_TIMINGS.reduce((acc, s) => acc + s.durationInSeconds, 0);
export const FPS = 30;
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
