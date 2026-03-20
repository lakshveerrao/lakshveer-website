import { Link } from "wouter";

interface HeaderProps {
  showBackLink?: boolean;
}

export function Header({ showBackLink = true }: HeaderProps) {
  return (
    <header className="container-main pt-8 pb-6 border-b border-[var(--border-subtle)]">
      <div className="flex items-center justify-between">
        {/* Logo / Name */}
        <Link href="/">
          <span className="text-lg font-semibold text-[var(--text-primary)] hover:opacity-80 transition-opacity duration-150">
            Lakshveer Rao
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-4 md:gap-6">
          <a 
            href="/endorse"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            Endorse
          </a>
          <Link 
            href="/invite"
            className="text-sm text-[var(--accent)] hover:opacity-80 transition-opacity duration-150"
          >
            Invite
          </Link>
          <Link 
            href="/collaborate"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            Enable
          </Link>
        </nav>
      </div>
    </header>
  );
}
