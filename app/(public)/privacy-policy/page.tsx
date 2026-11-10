import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Tollab Nation collects, uses, and protects your information when you visit our website.",
};

const LAST_UPDATED = "April 2025";

export default function PrivacyPolicyPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mb-12 border-b-[3px] border-line-strong pb-8">
        <p className="kicker animate-rise text-accent-ink">Legal</p>
        <h1 className="animate-rise mt-4 display text-6xl uppercase sm:text-8xl" style={{ "--d": 1 } as React.CSSProperties}>
          Privacy Policy
        </h1>
        <p className="kicker mt-4 text-ink-muted">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="space-y-10 text-[1.0625rem] text-ink-soft leading-relaxed">
        <section>
          <p>
            Welcome to <strong className="text-ink">Tollab Nation</strong> (
            <span className="text-ink">https://tollabn.com</span>). We are committed to
            protecting your privacy and ensuring transparency about how we collect and use
            information.
          </p>
          <p className="mt-3">
            This Privacy Policy explains how Tollab Nation collects, uses, and safeguards your
            information when you visit our website.
          </p>
        </section>

        <Section title="1. Information We Collect">
          <p className="mb-3">We collect information in the following ways:</p>
          <SubSection title="a) Information you provide">
            <p>
              You may contact us via email at{" "}
              <a href="mailto:tollabcontact@gmail.com" className="text-accent-ink underline underline-offset-2 hover:text-ink">
                tollabcontact@gmail.com
              </a>
              , in which case we may receive your name, email address, and any information you
              choose to share.
            </p>
          </SubSection>
          <SubSection title="b) Information collected automatically">
            <p className="mb-3">
              When you visit Tollab Nation, we automatically collect certain information, including:
            </p>
            <BulletList
              items={[
                "IP address",
                "Browser type and version",
                "Device type",
                "Pages visited and time spent on the site",
                "Referring website",
              ]}
            />
            <p className="mt-3">
              This information helps us understand how visitors use our website.
            </p>
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <p className="mb-3">We use the information we collect to:</p>
          <BulletList
            items={[
              "Operate and maintain our website",
              "Improve content and user experience",
              "Analyze traffic and usage trends",
              "Monitor website performance",
              "Display advertisements",
            ]}
          />
        </Section>

        <Section title="3. Cookies and Tracking Technologies">
          <p className="mb-3">Tollab Nation uses cookies to enhance your browsing experience.</p>
          <p className="mb-3">
            Cookies are small data files stored on your device that help us:
          </p>
          <BulletList
            items={[
              "Remember user preferences",
              "Understand how visitors interact with our content",
              "Improve website performance",
            ]}
          />
          <p className="mt-3">
            You can choose to disable cookies through your browser settings. Note that some parts
            of the website may not function properly if cookies are disabled.
          </p>
        </Section>

        <Section title="4. Advertising and Google AdSense">
          <p className="mb-3">
            We may use third-party advertising services such as{" "}
            <strong className="text-ink">Google AdSense</strong>.
          </p>
          <p className="mb-3">
            Google uses cookies (including the DoubleClick cookie) to serve ads to users based on
            their visits to this website and other websites.
          </p>
          <p className="mb-3">
            These cookies enable Google and its partners to display relevant advertisements.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting:{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink underline underline-offset-2 hover:text-ink break-all"
            >
              https://adssettings.google.com/
            </a>
          </p>
        </Section>

        <Section title="5. Third-Party Services">
          <p>
            We may work with third-party services that collect, monitor, and analyze usage data to
            help improve our website and display advertisements. These third parties have their own
            privacy policies governing how they use such information.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p>
            We take reasonable measures to protect your information from unauthorized access,
            disclosure, or misuse. However, no method of transmission over the Internet is
            completely secure.
          </p>
        </Section>

        <Section title="7. Your Privacy Rights">
          <p className="mb-3">As a user, you have the right to:</p>
          <BulletList
            items={[
              "Request access to your personal data",
              "Request correction or deletion of your data",
              "Disable cookies through your browser settings",
            ]}
          />
          <p className="mt-3">
            To exercise any of these rights, you can contact us at{" "}
            <a href="mailto:tollabcontact@gmail.com" className="text-accent-ink underline underline-offset-2 hover:text-ink">
              tollabcontact@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="8. Children's Information">
          <p>
            Tollab Nation does not knowingly collect personal information from children under the
            age of 13.
          </p>
        </Section>

        <Section title="9. Consent">
          <p>
            By using our website, you consent to this Privacy Policy and agree to its terms.
          </p>
        </Section>

        <Section title="10. Updates to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on
            this page with an updated revision date.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p className="mb-3">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <a href="mailto:tollabcontact@gmail.com" className="text-accent-ink underline underline-offset-2 hover:text-ink">
            tollabcontact@gmail.com
          </a>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display text-2xl uppercase text-ink mb-4 pt-4 border-t border-line">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="font-medium text-ink mb-2">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}
