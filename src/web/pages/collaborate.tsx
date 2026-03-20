import { useState } from "react";
import { SEO, PAGE_TITLES } from "@/components/seo";
import { Header } from "@/components/header";

const categoryOptions = [
  { value: "", label: "Select a category" },
  { value: "guest-talk", label: "Guest Talk / Lecture Invite" },
  { value: "hackathon", label: "Hackathon Invite" },
  { value: "grant", label: "Grant / Funding" },
  { value: "sponsorship", label: "Sponsorship" },
  { value: "hardware", label: "Hardware Support" },
  { value: "mentorship", label: "Mentorship" },
  { value: "media", label: "Media / Press" },
  { value: "collaboration", label: "Collaboration" },
  { value: "other", label: "Other" },
];

interface FormData {
  name: string;
  email: string;
  organisation: string;
  category: string;
  message: string;
}

function Collaborate() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    organisation: "",
    category: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSubmitted(true);
      } else {
        console.error('Contact form error:', result.error);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClasses =
    "w-full px-4 py-3 bg-[var(--bg)] border border-[#27272a] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#22d3ee] transition-[border-color] duration-150";

  return (
    <div className="min-h-screen">
      <SEO title={PAGE_TITLES.collaborate} />
      <Header />
      <main className="container-main py-8 md:py-16">
        {/* Page Title */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            If you'd like to support what we're building, or just want to say hi, we'd love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <section className="max-w-xl">
          {isSubmitted ? (
            <div className="p-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <p className="text-lg text-[var(--text-primary)] mb-2">
                Thank you for reaching out.
              </p>
              <p className="text-[var(--text-secondary)]">
                We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm text-[var(--text-secondary)] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputBaseClasses}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-[var(--text-secondary)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputBaseClasses}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="organisation" className="block text-sm text-[var(--text-secondary)] mb-2">
                  Organisation <span className="text-[var(--text-muted)]">(optional)</span>
                </label>
                <input
                  type="text"
                  id="organisation"
                  name="organisation"
                  value={formData.organisation}
                  onChange={handleChange}
                  className={inputBaseClasses}
                  placeholder="Where you work"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm text-[var(--text-secondary)] mb-2">
                  What's this about?
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className={`${inputBaseClasses} appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]`}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-[var(--text-secondary)] mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`${inputBaseClasses} resize-none`}
                  placeholder="What would you like to share?"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg)] font-medium hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default Collaborate;
