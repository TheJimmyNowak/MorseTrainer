# MorseTrainer

Interactive web application for learning and practicing Morse code with multiple training methods and customizable settings.

## Deployment

### Quick Start
Visit: [https://mashu.github.io/MorseTrainer](https://mashu.github.io/MorseTrainer)

### Local Development
```bash
git clone https://github.com/mashu/MorseTrainer.git
cd morse-trainer
npm install
npm run dev
```

### Docker
```bash
docker run --rm -p 8080:80 -d ghcr.io/mashu/MorseTrainer:main
```

## Features

- Multiple training methods:
  - Koch Method (progressive character introduction)
  - Huffman Method (tree-based character ordering)
  - Q-Codes practice
  - Cut numbers training
  - Common CW words
  - Custom alphabet sequences

- Adjustable parameters:
  - Speed: 5-50 WPM
  - Tone: 400-1000 Hz
  - Group size: 1-10 characters
  - Farnsworth spacing
  - Signal fading (QSB)
  - Interference (QRM)

- Training modes:
  - Head copy practice
  - Progressive speed mode
  - Real-time performance tracking
  - Character history

## Usage Guide

1. Select a training method from the dropdown menu
2. Adjust audio settings (tone, speed) to your preference
3. Click "Start Practice" to begin
4. Type the characters you hear
5. Use the settings panel (gear icon) to customize your experience

## Contributing

Issues and pull requests welcome at [GitHub repository](https://github.com/mashu/MorseTrainer).

## License

MIT License
