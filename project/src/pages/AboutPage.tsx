import { images } from '@/data/products';

export function AboutPage() {
  return (
    <section className="about-page page-width">
      <div className="about-intro">
        <div>
          <p className="eyebrow">A little about us</p>
          <h1>
            About
            <br />
            WorkNest
          </h1>
          <p>
            WorkNest creates simple, thoughtful workspace essentials for a
            calmer, more productive everyday life.
          </p>
        </div>
        <img
          src={images.desk_organizer}
          alt="Calm home office with plants and a wooden desk"
        />
      </div>

      <div className="about-body">
        <blockquote className="about-quote">
          <span>
            &ldquo;We shape our buildings and afterwards our buildings shape
            us.&rdquo;
          </span>
          <cite>-Winston Churchill</cite>
        </blockquote>
        <div>
          <p>
            Many of us now study, work, and complete personal projects from the
            same desk every day. But building a comfortable and organized
            workspace can quickly become expensive or unnecessarily complicated.
          </p>
          <p>
            WorkNest was created to offer simple, affordable products that solve
            everyday problems — from tangled cables and limited desk space to
            uncomfortable laptop placement.
          </p>
        </div>
      </div>

      <section className="privacy-policy" aria-labelledby="privacy-policy-title">
        <header className="privacy-policy-header">
          <p className="eyebrow">Your information</p>
          <h2 id="privacy-policy-title">Privacy Policy</h2>
          <p>
            This policy explains what information WorkNest may collect, why it
            is used, and the choices available to you.
          </p>
          <p className="privacy-policy-date">Last updated: October 3, 2026</p>
        </header>

        <div className="privacy-policy-content">
          <section>
            <h3>Information We Collect</h3>
            <p>
              WorkNest does not currently require user accounts or collect
              payment information through this website. If you contact us
              directly, we may receive information you choose to provide, such
              as your name, email address, and the contents of your message.
            </p>
            <p>
              Our hosting provider may automatically process limited technical
              information, such as an IP address, browser type, device type,
              requested pages, and access times, to deliver and protect the
              website.
            </p>
          </section>

          <section>
            <h3>How We Use Information</h3>
            <p>We use personal information only when reasonably necessary to:</p>
            <ul>
              <li>respond to questions, requests, or support inquiries;</li>
              <li>operate, maintain, and secure the website;</li>
              <li>understand and resolve technical problems; and</li>
              <li>meet applicable legal and regulatory requirements.</li>
            </ul>
            <p>
              We will identify any new purpose and request consent where
              required before using personal information for that purpose.
            </p>
          </section>

          <section>
            <h3>Cookies and Analytics</h3>
            <p>
              WorkNest does not currently use advertising cookies or analytics
              tools. The website may rely on essential browser or hosting
              technologies needed for security and basic operation. If our use
              of cookies or analytics changes, this policy and any required
              consent controls will be updated.
            </p>
          </section>

          <section>
            <h3>Sharing, Disclosure, and Retention</h3>
            <p>
              We do not sell or rent personal information. Information may be
              shared with service providers that help operate the website, only
              to the extent needed to provide those services. We may also
              disclose information where required by law, to protect legal
              rights or safety, or as part of a business transfer.
            </p>
            <p>
              Personal information is kept only as long as needed for the
              purpose for which it was collected or as required by law, after
              which it is securely deleted or anonymized where appropriate.
            </p>
          </section>

          <section>
            <h3>Contact Us</h3>
            <p>
              To ask a privacy question or make a request, email our privacy
              contact at{' '}
              <a href="mailto:huxx1791@mylaurier.ca">
                huxx1791@mylaurier.ca
              </a>
              . We may need to verify your identity before completing certain
              requests.
            </p>
          </section>
        </div>
      </section>
    </section>
  );
}
