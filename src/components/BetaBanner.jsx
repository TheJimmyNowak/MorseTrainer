import { Github } from 'lucide-react';

export const BetaBanner = () => (
  <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-500/90 via-yellow-400/90 to-yellow-500/90 text-black py-3 px-4 text-center font-bold z-40 shadow-lg backdrop-blur-sm">
    <div className="flex items-center justify-center gap-6">
      <span className="animate-bounce">🚧</span>
      <span>BETA</span>
      <span className="animate-bounce">🚧</span>

      <div className="flex items-center gap-4 ml-4">
        <a
          href="https://github.com/mashu/MorseTrainer"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity flex items-center gap-1"
        >
          <Github size={20} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <a
          href="https://discord.gg/S5FHkWeDCs"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity flex items-center gap-1"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            className="shrink-0"
          >
            <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
          </svg>
          <span className="hidden sm:inline">Discord</span>
        </a>
        <a
          href="https://matrix.to/#/#morsetrainer:matrix.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity flex items-center gap-1"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            className="shrink-0"
          >
            <path d="M.632.55v22.9H2.28V24H0V0h2.28v.55zm7.043 7.26v1.157h.033c.309-.443.683-.784 1.117-1.024.433-.245.936-.365 1.5-.365.54 0 1.033.107 1.481.314.448.208.785.582 1.02 1.108.254-.374.6-.706 1.034-.992.434-.287.95-.43 1.546-.43.453 0 .872.056 1.26.167.388.11.716.286.993.53.276.243.489.55.646.914.152.366.23.829.23 1.386v5.705h-2.349V10.49c0-.29-.018-.559-.054-.812a1.56 1.56 0 0 0-.226-.65 1.106 1.106 0 0 0-.48-.431c-.211-.107-.482-.16-.817-.16-.328 0-.59.062-.792.183a1.38 1.38 0 0 0-.524.49 2.059 2.059 0 0 0-.29.747 4.407 4.407 0 0 0-.087.911v4.715h-2.348V10.3c0-.276-.011-.534-.033-.782a1.755 1.755 0 0 0-.193-.667 1.106 1.106 0 0 0-.455-.457c-.211-.113-.488-.17-.83-.17-.343 0-.624.074-.84.223-.216.143-.384.326-.51.55-.13.223-.218.467-.272.732a3.766 3.766 0 0 0-.087.777v4.976H3.46V7.81h2.216zM21.088 0H24v24h-2.28v-.55h1.648V.55z"/>
          </svg>
          <span className="hidden sm:inline">Matrix</span>
        </a>
      </div>
    </div>
  </div>
);

// Default export for compatibility
export default BetaBanner;
